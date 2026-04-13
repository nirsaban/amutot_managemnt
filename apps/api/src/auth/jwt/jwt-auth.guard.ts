import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "../auth.types";
import { JwtService } from "./jwt.service";

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<any>();
    const header = String(req.headers?.authorization ?? "");
    const cookieHeader = req.headers?.cookie as string | undefined;
    const cookies = parseCookies(cookieHeader);

    const token =
      header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() :
      cookies.nd_token ? cookies.nd_token :
      "";

    if (!token) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Missing token" });
    }

    const secret = String(this.config.get("JWT_SECRET") ?? "");
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      const payload = this.jwt.verify(token, secret);
      const user: AuthUser = {
        userId: payload.sub,
        phone: payload.phone,
        associationId: payload.associationId
      };
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Invalid token" });
    }
  }
}

