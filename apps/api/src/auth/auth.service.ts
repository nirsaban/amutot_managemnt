import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { normalizePhone } from "../common/phone/normalize-phone";
import { JwtService } from "./jwt/jwt.service";

type LoginSession = {
  code: string;
  expiresAtMs: number;
  attempts: number;
};

@Injectable()
export class AuthService {
  private static sessions = new Map<string, LoginSession>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService
  ) {}

  async startLogin(phoneInput: string) {
    const phone = normalizePhone(phoneInput);
    if (!phone) {
      throw new BadRequestException({ code: "INVALID_PHONE", message: "Invalid phone" });
    }

    const user = await this.prisma.user.findUnique({
      where: { phone },
      select: { id: true, deletedAt: true, isActive: true }
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new BadRequestException({ code: "PHONE_NOT_FOUND", message: "Phone not found" });
    }

    const devOtp = String(this.config.get("DEV_OTP") ?? "123456");
    const ttlMs = 5 * 60 * 1000;
    AuthService.sessions.set(phone, { code: devOtp, expiresAtMs: Date.now() + ttlMs, attempts: 0 });

    const isProd = String(this.config.get("NODE_ENV") ?? "development") === "production";
    return {
      phone,
      otpSent: true,
      ...(isProd ? {} : { devCode: devOtp })
    };
  }

  async verify(phoneInput: string, codeInput: string) {
    const phone = normalizePhone(phoneInput);
    const code = String(codeInput ?? "").trim();
    if (!phone || !code) {
      throw new BadRequestException({ code: "INVALID_REQUEST", message: "Phone and code are required" });
    }

    const session = AuthService.sessions.get(phone);
    if (!session || session.expiresAtMs < Date.now()) {
      throw new UnauthorizedException({ code: "OTP_EXPIRED", message: "OTP expired" });
    }
    session.attempts += 1;
    if (session.attempts > 10) {
      AuthService.sessions.delete(phone);
      throw new UnauthorizedException({ code: "OTP_LOCKED", message: "Too many attempts" });
    }
    if (session.code !== code) {
      throw new UnauthorizedException({ code: "OTP_INVALID", message: "Invalid OTP" });
    }

    const user = await this.prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        associationId: true,
        registrationCompleted: true,
        groupSelectionCompleted: true,
        deletedAt: true,
        isActive: true
      }
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new BadRequestException({ code: "PHONE_NOT_FOUND", message: "Phone not found" });
    }

    AuthService.sessions.delete(phone);

    const secret = String(this.config.get("JWT_SECRET") ?? "");
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const expiresInSec = Number(this.config.get("JWT_EXPIRES_IN_SEC") ?? 60 * 60 * 24 * 7);

    const token = this.jwt.sign(
      { sub: user.id, phone: user.phone, associationId: user.associationId },
      secret,
      expiresInSec
    );

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        associationId: user.associationId,
        registrationCompleted: user.registrationCompleted,
        groupSelectionCompleted: user.groupSelectionCompleted
      }
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        associationId: true,
        registrationCompleted: true,
        groupSelectionCompleted: true
      }
    });
    if (!user) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "User not found" });
    }
    return user;
  }
}
