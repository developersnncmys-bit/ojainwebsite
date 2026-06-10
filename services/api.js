// services/api.js
// ──────────────────────────────────────────────────────────────────────────
// Central API export.
//
// • CART + ADDRESS live entirely on the client (localStorage). The backend has
//   no cart/address collections, and a storefront cart is naturally per-device,
//   so we keep them local. `cartAPI.add` fetches the product from the backend
//   so the cart stores full product objects (needed for price/name display).
// • ORDERS are persisted to the backend (/api/orders). The logged-in customer
//   is taken from the JWT server-side, so the client only sends totals/items.
// • PAYMENT stays mocked (no payment gateway wired in this build).
// ──────────────────────────────────────────────────────────────────────────

import api from "../utils/axios";

const ok = (data) => Promise.resolve({ data, status: 200 });

/* ── localStorage helpers (SSR-safe) ───────────────────────────────────── */
const read = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  return value;
};

const CART_KEY = "ojain-cart";
const ADDR_KEY = "ojain-addresses";

const getLocalCart = () => read(CART_KEY, { items: [] });
const setLocalCart = (cart) => write(CART_KEY, cart);

/* =========================================
   CART API (client-side)
========================================= */
export const cartAPI = {
  get: () => ok(getLocalCart()),

  add: async (productId, quantity = 1) => {
    const cart = getLocalCart();
    const items = [...cart.items];
    const idx = items.findIndex((i) => i.product._id === productId);

    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
    } else {
      // Fetch the product so the cart has its name/price/image.
      const { data: product } = await api.get(`/api/products/${productId}`);
      items.push({ product, quantity });
    }
    return ok(setLocalCart({ items }));
  },

  update: (productId, quantity) => {
    const cart = getLocalCart();
    const items = cart.items
      .map((i) => (i.product._id === productId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    return ok(setLocalCart({ items }));
  },

  remove: (productId) => {
    const cart = getLocalCart();
    const items = cart.items.filter((i) => i.product._id !== productId);
    return ok(setLocalCart({ items }));
  },

  clear: () => ok(setLocalCart({ items: [] })),
};

/* =========================================
   ADDRESS API (client-side)
========================================= */
export const addressAPI = {
  getAll: () => ok({ addresses: read(ADDR_KEY, []) }),

  create: (data) => {
    const list = read(ADDR_KEY, []);
    const address = { _id: `addr-${Date.now()}`, ...data };
    // Only one default at a time.
    const next = address.isDefault
      ? list.map((a) => ({ ...a, isDefault: false }))
      : list;
    write(ADDR_KEY, [...next, address]);
    return ok({ address });
  },

  update: (id, data) => {
    const list = read(ADDR_KEY, []).map((a) => (a._id === id ? { ...a, ...data } : a));
    write(ADDR_KEY, list);
    return ok({ address: list.find((a) => a._id === id) });
  },

  remove: (id) => {
    write(ADDR_KEY, read(ADDR_KEY, []).filter((a) => a._id !== id));
    return ok({ success: true });
  },
};

/* =========================================
   USER ORDER API (backend-backed)
========================================= */
export const orderAPI = {
  // Build the order from the local cart + selected address, then persist it.
  // The customer identity is resolved from the JWT on the server.
  create: async (payload = {}) => {
    const cart = getLocalCart();
    const addresses = read(ADDR_KEY, []);
    const address =
      addresses.find((a) => a._id === payload.addressId) ||
      addresses.find((a) => a.isDefault) ||
      null;

    const lineItems = cart.items.map((i) => ({
      productId: i.product._id,
      name: i.product.name,
      price: i.product.price,
      qty: i.quantity,
    }));
    const total = cart.items.reduce(
      (sum, i) => sum + (i.product.price || 0) * i.quantity,
      0
    );
    const payment = payload.paymentMethod === "COD" ? "COD" : "UPI";

    const res = await api.post("/api/orders", {
      lineItems,
      total,
      address,
      payment,
      paymentId: payload.paymentId,
    });

    setLocalCart({ items: [] }); // clear cart on success
    return res;
  },

  // Logged-in customer's own orders
  getAll: () => api.get("/api/orders"),

  // Single order
  getById: (id) => api.get(`/api/orders/${id}`),
};

/* =========================================
   ADMIN ORDER API (backend-backed)
========================================= */
export const adminOrderAPI = {
  getAllOrders: () => api.get("/api/orders"),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  updateOrder: (id, data) => api.put(`/api/orders/${id}`, data),
  updateOrderStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/api/orders/${id}`),
};

/* =========================================
   RAZORPAY PAYMENT API (mocked)
========================================= */
export const paymentAPI = {
  createOrder: async (amount) => ({
    orderId: `mock_order_${amount}`,
    amount: Math.round(amount * 100), // paise
    currency: "INR",
  }),
  verifyPayment: async () => ({ success: true }),
};
