import { z } from "zod";

const EnvSchema = z.object({
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  ADMIN_API_KEY: z.string().min(8),
  GEOCODER_PROVIDER: z.string().default("nominatim"),
  GEOCODER_USER_AGENT: z.string().default("sp-importadora/1.0"),
  GEOCODER_EMAIL: z.string().email().optional(),
  GEOCODER_RATE_LIMIT_MS: z.coerce.number().default(1100),
  ROUTING_DEFAULT_MAX_KM: z.coerce.number().default(150),
  PAYMENT_PROVIDER: z.string().default("mercadopago"),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Variáveis de ambiente inválidas:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
