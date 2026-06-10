"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useProduct } from "../../../../hooks/useProduct";
import { useCategory } from "../../../../hooks/useCategories";
import toast from "react-hot-toast";
import {
  MdRestaurantMenu, MdAttachMoney, MdInventory,
  MdCategory, MdImage, MdLabel, MdClose,
  MdEdit, MdDelete, MdAdd, MdSave, MdRefresh,
  MdCheckCircle, MdCancel, MdInfo,
} from "react-icons/md";
import {
  FaLeaf, FaFire, FaBoxOpen, FaSearch,
  FaCheck, FaSpinner,
} from "react-icons/fa";

/* ── image helper ─────────────────────────────────────── */
const getImageUrl = (p) => {
  if (!p) return "/category1.jpg";
  if (p.startsWith("/") || p.startsWith("http") || p.startsWith("blob:")) return p;
  return `/${p.replace(/\\/g, "/")}`;
};

/* ── field wrapper ────────────────────────────────────── */
function Field({ label, icon, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "#1B5E20" }}>
        {icon && <span style={{ color: "#66BB6A" }}>{icon}</span>}
        {label}
        {required && <span style={{ color: "#FF8F00" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: "#81C784" }}>{hint}</p>}
    </div>
  );
}

/* ── styled input ─────────────────────────────────────── */
const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none border transition-all";
const inputStyle = { background: "#F9FFF6", borderColor: "#C8E6C9", color: "#333" };
function useInputFocus() {
  return {
    onFocus: (e) => { e.currentTarget.style.borderColor = "#2E7D32"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.12)"; },
    onBlur: (e) => { e.currentTarget.style.borderColor = "#C8E6C9"; e.currentTarget.style.boxShadow = "none"; },
  };
}

/* ── section header ───────────────────────────────────── */
function SectionHeader({ icon, title, color = "#2E7D32" }) {
  return (
    <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px dashed #C8E6C9" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: color }}>
        {icon}
      </div>
      <span className="font-black text-sm" style={{ color: "#1B5E20" }}>{title}</span>
    </div>
  );
}

/* ── toggle switch ────────────────────────────────────── */
function Toggle({ checked, onChange, label, color = "#2E7D32" }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left"
      style={
        checked
          ? { background: "rgba(46,125,50,0.08)", borderColor: color, color: "#1B5E20" }
          : { background: "#F9FFF6", borderColor: "#C8E6C9", color: "#666" }
      }
    >
      <div
        className="relative w-10 h-5 rounded-full transition-all shrink-0"
        style={{ background: checked ? color : "#D1D5DB" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </div>
      <span className="text-sm font-semibold">{label}</span>
      {checked && <FaCheck size={10} className="ml-auto" style={{ color }} />}
    </button>
  );
}

/* ── skeleton card ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid #E8F5E9" }}>
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
export default function ProductManager() {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProduct();
  const { categories, fetchCategories } = useCategory();

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const focus = useInputFocus();

  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", category: "",
    price: "", images: "", isVeg: true,
    isAvailable: true, status: "active",
    stock: "", servingSize: "", tags: "",
  });

  /* revoke object URLs on unmount / preview change */
  useEffect(() => () => imagePreviews.forEach(URL.revokeObjectURL), [imagePreviews]);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ── file pick ── */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    imagePreviews.forEach(URL.revokeObjectURL);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((p) => p.filter((_, i) => i !== idx));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Name, price and category are required");
      return;
    }
    setSaving(true);
    try {
      let payload;
      if (imageFiles.length > 0) {
        payload = new FormData();

        payload.append("name", form.name.trim());
        payload.append("description", form.description);
        payload.append("category", form.category);
        payload.append("price", Number(form.price));
        payload.append("stock", Number(form.stock) || 0);
        payload.append("isVeg", form.isVeg);
        payload.append("isAvailable", form.isAvailable);
        payload.append("status", form.status);
        payload.append("servingSize", form.servingSize);

        form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((t) => payload.append("tags", t));

        // Upload only files
        imageFiles.forEach((file) => {
          payload.append("images", file);
        });

        // Debug
        for (const pair of payload.entries()) {
          console.log(pair[0], pair[1]);
        }
      }



      else {
        payload = {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock) || 0,
          images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
          tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        };
      }

      if (editId) {
        await updateProduct(editId, payload);
        toast.success("Product updated successfully! ✅");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully! 🎉");
      }
      resetForm();
      fetchProducts(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  /* ── edit ── */
  const handleEdit = (p) => {

    setExistingImages(
      p.images || []
    );
    setEditId(p._id);
    setForm({
      name: p.name, description: p.description,
      category: p.category?._id || p.category,
      price: p.price, images: p.images?.join(", ") ?? "",
      isVeg: p.isVeg, isAvailable: p.isAvailable,
      status: p.status, stock: p.stock,
      servingSize: p.servingSize ?? "", tags: p.tags?.join(", ") ?? "",
    });
    scrollToForm();
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  /* ── reset ── */
  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", description: "", category: "", price: "", images: "", isVeg: true, isAvailable: true, status: "active", stock: "", servingSize: "", tags: "" });
    imagePreviews.forEach(URL.revokeObjectURL);
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── filtered list ── */
  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8" style={{ color: "#333" }}>

      {/* ════ Page Header ════ */}
      <div
        className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)",
          boxShadow: "0 4px 20px rgba(27,94,32,0.25)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "rgba(255,143,0,0.2)", border: "1.5px solid rgba(255,143,0,0.5)" }}>
            <MdRestaurantMenu className="text-2xl" style={{ color: "#FF8F00" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-none">Products</h1>
            <p className="text-sm mt-0.5" style={{ color: "#A5D6A7" }}>
              Manage your menu items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
            {products.length} Products
          </div>
          <button
            onClick={() => { resetForm(); scrollToForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FF8F00, #FFB300)", color: "#fff", boxShadow: "0 3px 12px rgba(255,143,0,0.4)" }}
          >
            <MdAdd className="text-lg" /> Add Product
          </button>
        </div>
      </div>

      {/* ════ Form Card ════ */}
      <div
        ref={formRef}
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #C8E6C9", boxShadow: "0 4px 24px rgba(46,125,50,0.1)" }}
      >
        {/* Form header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: editId
              ? "linear-gradient(90deg, rgba(255,143,0,0.08), rgba(255,143,0,0.02))"
              : "linear-gradient(90deg, rgba(46,125,50,0.08), rgba(46,125,50,0.02))",
            borderBottom: "1px solid #C8E6C9",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ background: editId ? "#FF8F00" : "#2E7D32" }}
            >
              {editId ? <MdEdit className="text-lg" /> : <MdAdd className="text-xl" />}
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: "#1B5E20" }}>
                {editId ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs" style={{ color: "#66BB6A" }}>
                {editId ? "Update the product details below" : "Fill in the details to add a product to your menu"}
              </p>
            </div>
          </div>
          {editId && (
            <button onClick={resetForm} className="p-2 rounded-xl transition-colors" style={{ background: "#EBF5E9", color: "#2E7D32" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#C8E6C9")}
              onMouseLeave={e => (e.currentTarget.style.background = "#EBF5E9")}>
              <MdClose className="text-xl" />
            </button>
          )}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 bg-white space-y-7">

          {/* ── Section 1: Basic Info ── */}
          <div className="space-y-4">
            <SectionHeader icon={<MdInfo />} title="Basic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Name" icon={<MdRestaurantMenu />} required>
                <input
                  name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="e.g. Paneer Butter Masala"
                  className={inputCls} style={inputStyle} {...focus} required
                />
              </Field>

              <Field label="Category" icon={<MdCategory />} required>
                <select
                  name="category" value={form.category} onChange={handleChange}
                  className={inputCls} style={{ ...inputStyle, cursor: "pointer" }} {...focus} required
                >
                  <option value="">— Select a category —</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description" icon={<MdLabel />} required>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your product — ingredients, taste, occasion…"
                rows={3}
                className={inputCls + " resize-none leading-6"} style={inputStyle} {...focus}
              />
            </Field>
          </div>

          {/* ── Section 2: Pricing & Inventory ── */}
          <div className="space-y-4">
            <SectionHeader icon={<MdAttachMoney />} title="Pricing & Inventory" color="#FF8F00" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Price (₹)" icon={<MdAttachMoney />} required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm" style={{ color: "#FF8F00" }}>₹</span>
                  <input
                    name="price" type="number" min="0" value={form.price} onChange={handleChange}
                    placeholder="0"
                    className={inputCls + " pl-8"} style={inputStyle} {...focus} required
                  />
                </div>
              </Field>

              <Field label="Stock Quantity" icon={<MdInventory />}>
                <input
                  name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                  placeholder="e.g. 50"
                  className={inputCls} style={inputStyle} {...focus}
                />
              </Field>

              <Field label="Serving Size" hint="e.g. 250g, 1 plate, 2 pcs">
                <input
                  name="servingSize" type="text" value={form.servingSize} onChange={handleChange}
                  placeholder="250g / 1 plate"
                  className={inputCls} style={inputStyle} {...focus}
                />
              </Field>
            </div>
          </div>

          {/* ── Section 3: Media & Tags ── */}
          <div className="space-y-4">
            <SectionHeader icon={<MdImage />} title="Media & Tags" color="#7B1FA2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* File Upload */}
              <Field label="Product Images" icon={<MdImage />} hint="JPG, PNG, WEBP. First image used as cover.">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all py-5"
                  style={{ borderColor: "#C8E6C9", background: "#F9FFF6" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2E7D32"; e.currentTarget.style.background = "#EBF5E9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C8E6C9"; e.currentTarget.style.background = "#F9FFF6"; }}
                >
                  <MdImage className="text-3xl" style={{ color: "#66BB6A" }} />
                  <p className="text-sm font-bold" style={{ color: "#2E7D32" }}>
                    {imageFiles.length > 0 ? `${imageFiles.length} file${imageFiles.length > 1 ? "s" : ""} selected` : "Click to select images"}
                  </p>
                  <p className="text-[11px]" style={{ color: "#81C784" }}>Multiple files allowed</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </Field>

              <Field label="Tags" icon={<MdLabel />} hint="Comma-separated keywords for search">
                <input
                  name="tags" type="text" value={form.tags} onChange={handleChange}
                  placeholder="spicy, fresh, healthy"
                  className={inputCls} style={inputStyle} {...focus}
                />
              </Field>
            </div>

            {/* Image previews */}
            {(imagePreviews.length > 0 || (editId && form.images)) && (
              <div className="flex flex-wrap gap-3">
                {/* Newly selected files */}
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ border: "1px solid #C8E6C9" }}>
                    <Image src={url} alt={`Preview ${i + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: "rgba(220,38,38,0.85)" }}
                    >
                      <MdClose size={11} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white py-0.5" style={{ background: "rgba(46,125,50,0.85)" }}>Cover</span>
                    )}
                  </div>
                ))}

                {/* Existing images (edit mode, no new files selected) */}
                {imagePreviews.length === 0 && editId && form.images &&
                  form.images.split(",").filter(Boolean).map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ border: "1px solid #C8E6C9" }}>
                      <Image src={getImageUrl(url.trim())} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized
                        onError={(e) => (e.target.style.display = "none")} />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white py-0.5" style={{ background: "rgba(46,125,50,0.85)" }}>Cover</span>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* ── Section 4: Settings ── */}
          <div className="space-y-4">
            <SectionHeader icon={<MdCheckCircle />} title="Settings" color="#1565C0" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Status select */}
              <Field label="Status">
                <select
                  name="status" value={form.status} onChange={handleChange}
                  className={inputCls} style={{ ...inputStyle, cursor: "pointer" }} {...focus}
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">⏸ Inactive</option>
                </select>
              </Field>

              {/* Veg toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1B5E20" }}>Diet Type</label>
                <Toggle
                  checked={form.isVeg}
                  onChange={(v) => setField("isVeg", v)}
                  label={form.isVeg ? "🌿 Pure Veg" : "🍖 Non-Veg"}
                  color="#2E7D32"
                />
              </div>

              {/* Available toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1B5E20" }}>Availability</label>
                <Toggle
                  checked={form.isAvailable}
                  onChange={(v) => setField("isAvailable", v)}
                  label={form.isAvailable ? "🟢 Available" : "🔴 Unavailable"}
                  color="#FF8F00"
                />
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5"
            style={{ borderTop: "1px solid #E8F5E9" }}
          >
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{
                background: editId
                  ? "linear-gradient(135deg, #FF8F00, #FFB300)"
                  : "linear-gradient(135deg, #1B5E20, #2E7D32)",
                boxShadow: editId
                  ? "0 4px 16px rgba(255,143,0,0.35)"
                  : "0 4px 16px rgba(27,94,32,0.35)",
              }}
            >
              {saving
                ? <><FaSpinner className="animate-spin" size={14} /> Saving…</>
                : editId
                  ? <><MdSave className="text-lg" /> Update Product</>
                  : <><MdAdd className="text-lg" /> Create Product</>}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all hover:scale-[1.02]"
              style={{ background: "#F9FFF6", color: "#2E7D32", borderColor: "#C8E6C9" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#EBF5E9")}
              onMouseLeave={e => (e.currentTarget.style.background = "#F9FFF6")}
            >
              <MdRefresh className="text-lg" />
              {editId ? "Cancel Edit" : "Reset Form"}
            </button>
          </div>
        </form>
      </div>

      {/* ════ Product List ════ */}
      <div>
        {/* List header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#1B5E20" }}>Your Products</h2>
            <p className="text-sm" style={{ color: "#66BB6A" }}>{products.length} product{products.length !== 1 ? "s" : ""} in your menu</p>
          </div>
          {/* Search */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border w-full sm:w-72"
            style={{ background: "#fff", borderColor: "#C8E6C9" }}
          >
            <FaSearch size={13} style={{ color: "#66BB6A" }} />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: "#333" }}
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl border"
            style={{ background: "#fff", borderColor: "#C8E6C9" }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EBF5E9" }}>
              <FaBoxOpen size={26} style={{ color: "#66BB6A" }} />
            </div>
            <p className="font-black text-lg" style={{ color: "#1B5E20" }}>
              {search ? "No products found" : "No products yet"}
            </p>
            <p className="text-sm mt-1 text-center max-w-xs" style={{ color: "#66BB6A" }}>
              {search ? `Nothing matches "${search}"` : "Add your first product using the form above"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{ border: "1px solid #E8F5E9", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 10px 32px rgba(46,125,50,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(46,125,50,0.07)")}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <Image
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                    onError={(e) => { e.target.onerror = null; e.target.src = "/category1.jpg"; }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                  {/* Veg / Non-veg badge */}
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow"
                    style={{ background: product.isVeg ? "#2E7D32" : "#B71C1C", color: "#fff" }}
                  >
                    {product.isVeg ? <FaLeaf size={8} /> : null}
                    {product.isVeg ? "Veg" : "Non-Veg"}
                  </div>

                  {/* Status badge */}
                  <div
                    className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow"
                    style={
                      product.status === "active"
                        ? { background: "rgba(46,125,50,0.85)", color: "#fff" }
                        : { background: "rgba(100,100,100,0.8)", color: "#fff" }
                    }
                  >
                    {product.status === "active" ? "● Active" : "● Inactive"}
                  </div>

                  {/* Price tag */}
                  <div
                    className="absolute bottom-3 left-3 font-black text-base px-3 py-1 rounded-full shadow"
                    style={{ background: "rgba(255,143,0,0.92)", color: "#fff" }}
                  >
                    ₹{product.price}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-black text-[14px] leading-snug line-clamp-1 mb-1" style={{ color: "#1B5E20" }}>
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-[11px] line-clamp-2 leading-[1.55rem] flex-1" style={{ color: "#888" }}>
                      {product.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {product.category?.name && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#EBF5E9", color: "#2E7D32" }}
                      >
                        {product.category.name}
                      </span>
                    )}
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "#FFF8E1", color: "#FF8F00" }}
                    >
                      Stock: {product.stock ?? 0}
                    </span>
                    {product.servingSize && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#F3E5F5", color: "#7B1FA2" }}
                      >
                        {product.servingSize}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all hover:scale-[1.03]"
                      style={{ background: "#EBF5E9", color: "#1B5E20", border: "1px solid #C8E6C9" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#C8E6C9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#EBF5E9")}
                    >
                      <MdEdit size={13} /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleting === product._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all hover:scale-[1.03] disabled:opacity-60"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.25)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.16)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                    >
                      {deleting === product._id
                        ? <FaSpinner className="animate-spin" size={11} />
                        : <MdDelete size={13} />}
                      {deleting === product._id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
