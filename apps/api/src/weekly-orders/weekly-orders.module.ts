import { Module } from "@nestjs/common";
import { WeeklyOrdersController } from "./weekly-orders.controller";
import { WeeklyOrdersService } from "./weekly-orders.service";

@Module({
  controllers: [WeeklyOrdersController],
  providers: [WeeklyOrdersService],
  exports: [WeeklyOrdersService]
})
export class WeeklyOrdersModule {}

