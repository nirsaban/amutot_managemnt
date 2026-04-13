import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ok } from "../common/http/api-response";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { AdminGuard } from "../authz/guards/admin.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async list() {
    return ok(await this.usersService.list());
  }
}
