import { Controller, Get } from "@nestjs/common";
import { ok } from "../common/http/api-response";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return ok({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  }
}
