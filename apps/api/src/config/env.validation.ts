export type ValidatedEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SEC: number;
  DEV_OTP: string;
  WEB_ORIGIN: string;
};

function asNodeEnv(value: unknown): ValidatedEnv["NODE_ENV"] {
  if (value === "development" || value === "test" || value === "production") return value;
  return "development";
}

export function validateEnv(rawEnv: Record<string, unknown>): ValidatedEnv {
  const databaseUrl = String(rawEnv.DATABASE_URL ?? "").trim();
  if (!databaseUrl) {
    throw new Error("Missing required env var: DATABASE_URL");
  }

  const jwtSecret = String(rawEnv.JWT_SECRET ?? "").trim();
  if (!jwtSecret) {
    throw new Error("Missing required env var: JWT_SECRET");
  }

  const portRaw = rawEnv.PORT ?? 3001;
  const port = typeof portRaw === "number" ? portRaw : Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("Invalid env var: PORT must be a positive number");
  }

  return {
    NODE_ENV: asNodeEnv(rawEnv.NODE_ENV),
    PORT: port,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN_SEC: Number(rawEnv.JWT_EXPIRES_IN_SEC ?? 60 * 60 * 24 * 7),
    DEV_OTP: String(rawEnv.DEV_OTP ?? "123456"),
    WEB_ORIGIN: String(rawEnv.WEB_ORIGIN ?? "http://localhost:3000")
  };
}
