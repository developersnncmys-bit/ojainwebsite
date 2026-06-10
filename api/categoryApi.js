import api from "../utils/axios";

// Backend mounts categories at /api/categories (REST). GET is public; writes
// require an admin token (attached automatically from localStorage).
const CATEGORY_BASE = "/api/categories";

// Get all categories — interceptor already unwraps { success, data } -> array.
export const getAllCategories = async () => {
  const response = await api.get(CATEGORY_BASE);
  return response.data || [];
};

// Get single category by ID
export const getSingleCategory = async (categoryId) => {
  const response = await api.get(`${CATEGORY_BASE}/${categoryId}`);
  return response.data;
};

// Create category (JSON body; `image` may be a URL or base64 string)
export const createCategory = async (data) => {
  const response = await api.post(CATEGORY_BASE, data);
  return response.data;
};

// Update category
export const updateCategory = async (categoryId, data) => {
  const response = await api.put(`${CATEGORY_BASE}/${categoryId}`, data);
  return response.data;
};

// Delete category
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`${CATEGORY_BASE}/${categoryId}`);
  return response.data;
};
