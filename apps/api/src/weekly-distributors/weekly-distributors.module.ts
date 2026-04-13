import { Module } from "@nestjs/common";
import { WeeklyDistributorsController } from "./weekly-distributors.controller";
import { WeeklyDistributorsService } from "./weekly-distributors.service";

@Module({
  controllers: [WeeklyDistributorsController],
  providers: [WeeklyDistributorsService],
  exports: [WeeklyDistributorsService]
})
export class WeeklyDistributorsModule {}

