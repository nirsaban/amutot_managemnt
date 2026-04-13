import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CompleteProfileDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

