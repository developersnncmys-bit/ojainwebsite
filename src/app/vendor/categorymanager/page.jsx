"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCategory } from "../../../../hooks/useCategories";
import toast from "react-hot-toast";
import {
  MdCategory, MdAdd, MdEdit, MdDelete,
  MdClose, MdSave, MdRefresh, MdImage,
  MdLabel, MdStorefront, MdArrowForward,
} from "react-icons/md";
import {
  FaSearch, FaBoxOpen, FaSpinner,
  FaCloudUploadAlt, FaCheck, FaTimes,
} from "react-icons/fa";

/* ── image url helper ─────────────────────────────── */
const getImageUrl = (p) => {
  if (!p) return "/category1.jpg";
  if (p.startsWith("/") || p.startsWith("blob:") || p.startsWith("http")) return p;
  return `/${p.replace(/\\/g, "/")}`;
};

/* ── field wrapper ────────────────────────────────── */
function Field({ label, icon, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
        style={{ color: "#1B5E20" }}
      >
        {icon && <span style={{ color: "#66BB6A" }}>{icon}</span>}
        {label}
        {required && <span style={{ color: "#FF8F00" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: "#81C784" }}>{hint}</p>}
    </div>
  );
}

/* ── shared input classes ─────────────────────────── */
const inputBase =
  "w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none border transition-all";
const inputStyle = { background: "#F9FFF6", borderColor: "#C8E6C9", color: "#333" };
const inputFocus = {
  onFocus: (e) => {
    e.currentTarget.style.borderColor = "#2E7D32";
    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(46,125,50,0.12)";
  },
  onBlur: (e) => {
    e.currentTarget.style.borderColor = "#C8E6C9";
    e.currentTarget.style.boxShadow   = "none";
  },
};

/* ── skeleton card ────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden animate-pulse"
      style={{ border: "1px solid #E8F5E9" }}
    >
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
        <div className="h-3 bg-gray-200 rounded-lg w-full" />
        <div className="h-3 bg-gray-200 rounded-lg w-4/5" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
          <div className="h-8 bg-gray-200 rounded-xl w-10" />
          <div className="h-8 bg-gray-200 rounded-xl w-10" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════ */
export default function CategoryManager() {
  const router = useRouter();
  const {
    categories, fetchCategories,
    createCategory, updateCategory, deleteCategory,
    loading, error,
  } = useCategory();

  const formRef  = useRef(null);
  const fileRef  = useRef(null);

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId]     = useState(null);
  const [formError, setFormError]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(null);
  const [search, setSearch]           = useState("");
  const [dragOver, setDragOver]       = useState(false);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ── reset ── */
  const resetForm = () => {
    setName(""); setDescription(""); setImageFile(null);
    setImagePreview(null); setEditingId(null); setFormError("");
  };

  /* ── image pick ── */
  const applyFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const handleImageChange = (e) => applyFile(e.target.files[0]);

  /* ── drag & drop ── */
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) applyFile(file);
    else toast.error("Please drop an image file");
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Category name is required"); return; }

    setSaving(true);
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editingId) {
        await updateCategory(editingId, fd);
        toast.success("Category updated! ✅");
      } else {
        await createCategory(fd);
        toast.success("Category created! 🎉");
      }
      resetForm();
      await fetchCategories();
    } catch (err) {
      const msg = err.message || "Something went wrong";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── edit ── */
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setImagePreview(cat.image ? cat.image : null);
    setImageFile(null);
    setFormError("");
    scrollToForm();
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  /* ── filtered list ── */
  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* ════ Page Header ════ */}
      <div
        className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)",
          boxShadow: "0 4px 20px rgba(27,94,32,0.25)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: "rgba(255,143,0,0.2)",
              border: "1.5px solid rgba(255,143,0,0.5)",
            }}
          >
            <MdCategory className="text-2xl" style={{ color: "#FF8F00" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-none">Categories</h1>
            <p className="text-sm mt-0.5" style={{ color: "#A5D6A7" }}>
              Organise your menu into groups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          >
            {categories.length} Categories
          </div>
          <button
            onClick={() => { resetForm(); scrollToForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #FF8F00, #FFB300)",
              color: "#fff",
              boxShadow: "0 3px 12px rgba(255,143,0,0.4)",
            }}
          >
            <MdAdd className="text-lg" /> Add Category
          </button>
        </div>
      </div>

      {/* ════ Form Card ════ */}
      <div
        ref={formRef}
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #C8E6C9",
          boxShadow: "0 4px 24px rgba(46,125,50,0.10)",
        }}
      >
        {/* Form header bar */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: editingId
              ? "linear-gradient(90deg, rgba(255,143,0,0.08), rgba(255,143,0,0.02))"
              : "linear-gradient(90deg, rgba(46,125,50,0.08), rgba(46,125,50,0.02))",
            borderBottom: "1px solid #C8E6C9",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ background: editingId ? "#FF8F00" : "#2E7D32" }}
            >
              {editingId ? <MdEdit className="text-lg" /> : <MdAdd className="text-xl" />}
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: "#1B5E20" }}>
                {editingId ? "Edit Category" : "Create New Category"}
              </h2>
              <p className="text-xs" style={{ color: "#66BB6A" }}>
                {editingId
                  ? "Update the category details below"
                  : "Add a new category to organise your products"}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className="p-2 rounded-xl transition-colors"
              style={{ background: "#EBF5E9", color: "#2E7D32" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#C8E6C9")}
              onMouseLeave={e => (e.currentTarget.style.background = "#EBF5E9")}
            >
              <MdClose className="text-xl" />
            </button>
          )}
        </div>

        {/* Error banner */}
        {formError && (
          <div
            className="mx-6 mt-5 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <FaTimes size={13} />
            {formError}
            <button className="ml-auto" onClick={() => setFormError("")}>
              <FaTimes size={11} />
            </button>
          </div>
        )}

        {/* Form body — two-column on md+ */}
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* ── LEFT: text fields ── */}
          <div className="space-y-5">

            <Field label="Category Name" icon={<MdLabel />} required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masala Dishes, Beverages, Snacks"
                className={inputBase}
                style={inputStyle}
                {...inputFocus}
                required
              />
            </Field>

            <Field
              label="Description"
              icon={<MdCategory />}
              hint="Help customers understand what's in this category"
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the category — type of cuisine, occasion, ingredients…"
                className={inputBase + " resize-none leading-6"}
                style={inputStyle}
                {...inputFocus}
              />
            </Field>

            {/* Action buttons inside left col */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: editingId
                    ? "linear-gradient(135deg, #FF8F00, #FFB300)"
                    : "linear-gradient(135deg, #1B5E20, #2E7D32)",
                  boxShadow: editingId
                    ? "0 4px 16px rgba(255,143,0,0.35)"
                    : "0 4px 16px rgba(27,94,32,0.35)",
                }}
              >
                {saving ? (
                  <><FaSpinner className="animate-spin" size={13} /> Saving…</>
                ) : editingId ? (
                  <><MdSave className="text-lg" /> Update Category</>
                ) : (
                  <><MdAdd className="text-lg" /> Create Category</>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all hover:scale-[1.02]"
                style={{ background: "#F9FFF6", color: "#2E7D32", borderColor: "#C8E6C9" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EBF5E9")}
                onMouseLeave={e => (e.currentTarget.style.background = "#F9FFF6")}
              >
                <MdRefresh className="text-lg" />
                {editingId ? "Cancel" : "Reset"}
              </button>
            </div>
          </div>

          {/* ── RIGHT: image upload ── */}
          <div className="flex flex-col gap-4">
            <Field label="Category Image" icon={<MdImage />} hint="JPG, PNG or WebP · max 5 MB">
              {/* Drag-and-drop zone */}
              <div
                className="relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden"
                style={{
                  borderColor: dragOver ? "#2E7D32" : "#C8E6C9",
                  background: dragOver ? "rgba(46,125,50,0.05)" : "#F9FFF6",
                  minHeight: "180px",
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  /* Image preview */
                  <>
                    <Image
                      src={getImageUrl(imagePreview)}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    {/* Replace overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.45)" }}>
                      <FaCloudUploadAlt className="text-white text-3xl mb-1" />
                      <span className="text-white text-xs font-bold">Click to replace</span>
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors z-10"
                      style={{ background: "rgba(239,68,68,0.85)" }}
                    >
                      <FaTimes size={10} />
                    </button>
                    {/* File name tag */}
                    {imageFile && (
                      <div
                        className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white"
                        style={{ background: "rgba(46,125,50,0.85)" }}
                      >
                        <FaCheck size={9} /> {imageFile.name}
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-10 px-4 text-center pointer-events-none">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: dragOver ? "rgba(46,125,50,0.15)" : "#EBF5E9",
                        border: "1.5px solid #C8E6C9",
                      }}
                    >
                      <FaCloudUploadAlt
                        size={26}
                        style={{ color: dragOver ? "#2E7D32" : "#66BB6A" }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#1B5E20" }}>
                        {dragOver ? "Drop image here" : "Click or drag image here"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#81C784" }}>
                        Supports JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </Field>

            {/* Tips card */}
            <div
              className="rounded-xl p-4 space-y-1.5"
              style={{ background: "#F9FFF6", border: "1px solid #C8E6C9" }}
            >
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: "#2E7D32" }}>
                💡 Tips
              </p>
              {[
                "Use a square image for best display",
                "Name should be short and clear",
                "Description helps customers find products",
              ].map((tip) => (
                <p key={tip} className="text-[11px] flex items-start gap-1.5" style={{ color: "#66BB6A" }}>
                  <FaCheck size={9} className="mt-0.5 shrink-0" /> {tip}
                </p>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* ════ Category Grid ════ */}
      <div>
        {/* List header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#1B5E20" }}>
              All Categories
            </h2>
            <p className="text-sm" style={{ color: "#66BB6A" }}>
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"} in your menu
            </p>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border w-full sm:w-72"
            style={{ background: "#fff", borderColor: "#C8E6C9" }}
          >
            <FaSearch size={13} style={{ color: "#66BB6A" }} />
            <input
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: "#333" }}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <FaTimes size={11} style={{ color: "#aaa" }} />
              </button>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl border"
            style={{ background: "#fff", borderColor: "#C8E6C9" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#EBF5E9" }}
            >
              <FaBoxOpen size={26} style={{ color: "#66BB6A" }} />
            </div>
            <p className="font-black text-lg" style={{ color: "#1B5E20" }}>
              {search ? "No categories found" : "No categories yet"}
            </p>
            <p className="text-sm mt-1 text-center max-w-xs" style={{ color: "#66BB6A" }}>
              {search
                ? `Nothing matches "${search}"`
                : "Create your first category using the form above"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "#2E7D32" }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((cat, idx) => (
              <div
                key={cat._id || idx}
                className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid #E8F5E9",
                  boxShadow: "0 2px 12px rgba(46,125,50,0.07)",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 10px 32px rgba(46,125,50,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(46,125,50,0.07)")}
              >
                {/* ── Image ── */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  {cat.image ? (
                    <Image
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized={cat.image?.includes("\\") || cat.image?.startsWith("http")}
                    />
                  ) : (
                    /* placeholder when no image */
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #EBF5E9, #C8E6C9)" }}
                    >
                      <MdCategory className="text-5xl" style={{ color: "#A5D6A7" }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent" />

                  {/* Category index badge */}
                  <div
                    className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow"
                    style={{ background: "rgba(46,125,50,0.85)" }}
                  >
                    {idx + 1}
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-black text-white text-base leading-tight drop-shadow-md line-clamp-1">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col flex-1">
                  {cat.description ? (
                    <p
                      className="text-xs leading-[1.6rem] line-clamp-2 flex-1"
                      style={{ color: "#666" }}
                    >
                      {cat.description}
                    </p>
                  ) : (
                    <p className="text-xs italic flex-1" style={{ color: "#aaa" }}>
                      No description added
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {/* View Products */}
                    <button
                      onClick={() =>
                        router.push(
                          `/vendor/category-products?category=${cat.name?.toLowerCase().replace(/\s+/g, "-")}`
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all hover:scale-[1.03]"
                      style={{
                        background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(27,94,32,0.25)",
                      }}
                    >
                      <MdStorefront size={13} />
                      Products
                      <MdArrowForward size={11} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(cat)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: "#EBF5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#C8E6C9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#EBF5E9")}
                      title="Edit"
                    >
                      <MdEdit size={15} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={deleting === cat._id}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        color: "#DC2626",
                        border: "1px solid rgba(239,68,68,0.25)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                      title="Delete"
                    >
                      {deleting === cat._id
                        ? <FaSpinner className="animate-spin" size={12} />
                        : <MdDelete size={15} />}
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
