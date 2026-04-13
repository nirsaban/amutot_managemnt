import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async completeProfile(userId: string, input: { firstName: string; lastName: string; email?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, registrationCompleted: true, deletedAt: true, isActive: true }
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new BadRequestException({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    if (user.registrationCompleted) {
      throw new BadRequestException({ code: "ALREADY_COMPLETED", message: "Profile already completed" });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email ? input.email.trim().toLowerCase() : null,
        registrationCompleted: true
      }
    });

    return { registrationCompleted: true };
  }

  async selectGroup(userId: string, associationId: string, groupId: string | null | undefined) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, groupSelectionCompleted: true, deletedAt: true, isActive: true }
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new BadRequestException({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    if (user.groupSelectionCompleted) {
      throw new BadRequestException({ code: "GROUP_ALREADY_SELECTED", message: "Group selection already completed" });
    }

    if (groupId) {
      const group = await this.prisma.distributionGroup.findFirst({
        where: { id: groupId, associationId, deletedAt: null },
        select: { id: true }
      });
      if (!group) {
        throw new BadRequestException({ code: "GROUP_NOT_FOUND", message: "Group not found" });
      }

      await this.prisma.groupMembership.create({
        data: {
          groupId: group.id,
          userId
        }
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { groupSelectionCompleted: true }
    });

    return { groupSelectionCompleted: true };
  }
}

