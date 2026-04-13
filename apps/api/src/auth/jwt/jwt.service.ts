import { Injectable } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";

export type JwtPayload = {
  sub: string;
  phone: string;
  associationId: string;
  iat: number;
  exp: number;
};

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

@Injectable()
export class JwtService {
  sign(payload: Omit<JwtPayload, "iat" | "exp">, secret: string, expiresInSec: number) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInSec;
    const fullPayload: JwtPayload = { ...payload, iat, exp };

    const header = { alg: "HS256", typ: "JWT" as const };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac("sha256", secret).update(signingInput).digest();
    const encodedSignature = base64UrlEncode(signature);
    return `${signingInput}.${encodedSignature}`;
  }

  verify(token: string, secret: string): JwtPayload {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error("Invalid token format");
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac("sha256", secret).update(signingInput).digest();
    const providedSignature = base64UrlDecode(encodedSignature);
    if (expectedSignature.length !== providedSignature.length || !timingSafeEqual(expectedSignature, providedSignature)) {
      throw new Error("Invalid token signature");
    }

    const payloadJson = base64UrlDecode(encodedPayload).toString("utf8");
    const payload = JSON.parse(payloadJson) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= now) {
      throw new Error("Token expired");
    }
    return payload;
  }
}

