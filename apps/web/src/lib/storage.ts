const ADMIN_KEY_STORAGE = "SP_ADMIN_KEY";
const CART_STORAGE = "SP_CART";
const DISTR_AUTH_STORAGE = "SP_DISTR_AUTH";

// ── Admin key ────────────────────────────────────
export function setAdminKey(key: string) {
  if (typeof window !== "undefined") localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_KEY_STORAGE) || "";
}

// ── Cart ─────────────────────────────────────────
export interface CartItem {
  productCode: string;
  productName: string;
  quantity: number;
  sellType: "UNIT" | "BOX";
  unitPrice: number;
  priceBox: number;
  unitsPerBox: number;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE, JSON.stringify(items));
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const idx = cart.findIndex(
    (c) => c.productCode === item.productCode && c.sellType === item.sellType,
  );
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function clearCart() {
  if (typeof window !== "undefined") localStorage.removeItem(CART_STORAGE);
}

// ── Distributor auth ──────────────────────────────
export function setDistributorAuth(code: string, key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(DISTR_AUTH_STORAGE, JSON.stringify({ code, key }));
  }
}

export function getDistributorAuth(): { code: string; key: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DISTR_AUTH_STORAGE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDistributorAuth() {
  if (typeof window !== "undefined") localStorage.removeItem(DISTR_AUTH_STORAGE);
}
