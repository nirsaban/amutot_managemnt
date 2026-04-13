import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ok } from "../common/http/api-response";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import type { AuthUser } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("start-login")
  async startLogin(@Body() body: { phone?: string }) {
    const result = await this.auth.startLogin(String(body.phone ?? ""));
    return ok(result);
  }

  @Post("verify")
  async verify(@Body() body: { phone?: string; code?: string }, @Res({ passthrough: true }) res: any) {
    const result = await this.auth.verify(String(body.phone ?? ""), String(body.code ?? ""));
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("nd_token", result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
    return ok({
      user: result.user
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: AuthUser) {
    return ok(await this.auth.me(user.userId));
  }
}
