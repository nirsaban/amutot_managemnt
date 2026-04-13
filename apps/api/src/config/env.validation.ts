export type ValidatedEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DATABASE_URL: string;
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

  const portRaw = rawEnv.PORT ?? 3001;
  const port = typeof portRaw === "number" ? portRaw : Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("Invalid env var: PORT must be a positive number");
  }

  return {
    NODE_ENV: asNodeEnv(rawEnv.NODE_ENV),
    PORT: port,
    DATABASE_URL: databaseUrl
  };
}

