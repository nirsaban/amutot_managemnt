import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (rawEnv) => validateEnv(rawEnv)
    })
  ]
})
export class AppConfigModule {}
