import { IsOptional, IsUUID } from "class-validator";

export class SelectGroupDto {
  @IsOptional()
  @IsUUID()
  groupId?: string | null;
}

