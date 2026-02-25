// Instalação local: npm install -g zod
import { z } from "zod";

// ─── Produto ─────────────────────────────────────────────────────────────────
export const ProductSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  priceBox: z.number(),
  priceUnit: z.number(),
  unitsPerBox: z.number(),
  bottleMl: z.number().nullable().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// ─── Cart Item ───────────────────────────────────────────────────────────────
export const CartItemSchema = z.object({
  productCode: z.string(),
  productName: z.string(),
  quantity: z.number().int().min(1),
  sellType: z.enum(["UNIT", "BOX"]),
  unitPrice: z.number(),
  priceBox: z.number(),
  unitsPerBox: z.number(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

// ─── Create Order ────────────────────────────────────────────────────────────
export const CreateOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional(),
  customerCep: z.string().min(8).max(9),
  items: z.array(
    z.object({
      productCode: z.string(),
      quantity: z.number().int().min(1),
      sellType: z.enum(["UNIT", "BOX"]).default("UNIT"),
    }),
  ).min(1),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ─── Shipping Quote ──────────────────────────────────────────────────────────
export const ShippingQuoteSchema = z.object({
  cep: z.string(),
  zoneCode: z.string(),
  zoneName: z.string(),
  price: z.number(),
  matchedRange: z.object({ start: z.string(), end: z.string() }),
});
export type ShippingQuote = z.infer<typeof ShippingQuoteSchema>;
