import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(associationId: string) {
    return this.prisma.distributionGroup.findMany({
      where: { associationId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });
  }
}
