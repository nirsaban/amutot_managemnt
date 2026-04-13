import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, phone: true, firstName: true, lastName: true, isActive: true },
      orderBy: { createdAt: "desc" }
    });
  }
}
