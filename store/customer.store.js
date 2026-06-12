// store/customer.store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  registerCustomerService,
  loginCustomerService,
  getCustomerProfileService,
  updateCustomerProfileService,
  logoutCustomerService,
} from "../services/customer.service";

// Helper: save / clear token in localStorage
const saveToken  = (token) => { if (typeof window !== "undefined") localStorage.setItem("token", token); };
const clearToken = ()      => { if (typeof window !== "undefined") localStorage.removeItem("token"); };

let profileRequest = null;

export const useCustomerStore = create(
  persist(
    (set, get) => ({
  customer: null,
  loading:  false,
  error:    null,

  /* ── REGISTER ── */
  registerCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await registerCustomerService(data);
      // Backend returns { token, customer } or { token, user }
      if (res?.token) saveToken(res.token);
      const customer = res?.customer || res?.user || res;
      set({ customer, loading: false });
      return res;
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  /* ── LOGIN ── */
  loginCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await loginCustomerService(data);
      if (res?.token) saveToken(res.token);
      const customer = res?.customer || res?.user || res;
      set({ customer, loading: false });
      return res;
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  /* ── FETCH PROFILE ── */
  fetchCustomerProfile: async () => {
    if (profileRequest) return profileRequest;
    profileRequest = (async () => {
      try {
        set({ loading: true, error: null });
        const res = await getCustomerProfileService();
        const customer = res?.customer || res?.user || res;
        set({ customer, loading: false });
        return customer;
      } catch (err) {
        set({ error: err?.response?.data?.message || err.message, loading: false });
        throw err;
      } finally {
        profileRequest = null;
      }
    })();
    return profileRequest;
  },

  /* ── UPDATE PROFILE ── */
  updateCustomerProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateCustomerProfileService(data);
      await get().fetchCustomerProfile();
      set({ loading: false });
      return updated;
    } catch (err) {
      set({ error: err?.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  /* ── LOGOUT ── */
  logoutCustomer: async () => {
    set({ loading: true, error: null });
    try {
      await logoutCustomerService();
    } catch (_) {}
    clearToken();
    set({ customer: null, loading: false });
  },

  /* ── UTILS ── */
  clearError: () => set({ error: null }),
  reset: () => {
    clearToken();
    profileRequest = null;
    set({ customer: null, loading: false, error: null });
  },
    }),
    {
      name: "ojain-customer",
      storage: createJSONStorage(() => localStorage),
      // Persist only the logged-in customer, not transient loading/error state.
      partialize: (state) => ({ customer: state.customer }),
    }
  )
);
