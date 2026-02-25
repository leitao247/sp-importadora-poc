import { API_BASE } from "./constants";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Catalog ───────────────────────────────────────────────────────────────
export function fetchProducts(q?: string) {
  return apiFetch(`/catalog/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

// ── Shipping quote ────────────────────────────────────────────────────────
export function fetchShippingQuote(cep: string) {
  return apiFetch(`/shipping/quote?cep=${encodeURIComponent(cep)}`);
}

// ── Routing quote ─────────────────────────────────────────────────────────
export function fetchRoutingQuote(cep: string) {
  return apiFetch(`/routing/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cep }),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────
export function createOrder(body: {
  customerName: string;
  customerEmail?: string;
  customerCep: string;
  items: { productCode: string; quantity: number; sellType: "UNIT" | "BOX" }[];
}) {
  return apiFetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function fetchPublicTracking(orderId: string) {
  return apiFetch(`/orders/${orderId}/public`);
}

// ── Distributor portal ────────────────────────────────────────────────────
export function fetchDistributorOrders(code: string, key: string, status?: string) {
  return apiFetch(`/distributor/orders${status ? `?status=${status}` : ""}`, {
    headers: { "x-distributor-code": code, "x-distributor-key": key },
  });
}

export function updateDistributorOrderStatus(
  code: string,
  key: string,
  orderId: string,
  to: string,
  note?: string,
) {
  return apiFetch(`/distributor/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-distributor-code": code,
      "x-distributor-key": key,
    },
    body: JSON.stringify({ to, note }),
  });
}

// ── Admin ────────────────────────────────────────────────────────────────
function adminFetch(path: string, adminKey: string, options: RequestInit = {}) {
  return apiFetch(path, {
    ...options,
    headers: { ...(options.headers || {}), "x-admin-key": adminKey },
  });
}

export function adminListDistributors(adminKey: string) {
  return adminFetch("/admin/distributors", adminKey);
}

export function adminRotateKey(adminKey: string, code: string) {
  return adminFetch(`/admin/distributors/${code}/rotate-key`, adminKey, { method: "POST" });
}

export function adminListProducts(adminKey: string, q?: string) {
  return adminFetch(`/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`, adminKey);
}

export async function adminUploadFile(adminKey: string, endpoint: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "x-admin-key": adminKey },
    body: form,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
