import { Controller, Post } from "@nestjs/common";
import { ok } from "../common/http/api-response";

@Controller("webhooks")
export class WebhooksController {
  @Post()
  receive() {
    return ok({ received: true });
  }
}

