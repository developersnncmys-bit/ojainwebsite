"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  FaStar, FaShoppingCart, FaArrowLeft, FaHeart,
  FaLeaf, FaFire, FaMinus, FaPlus, FaSpinner,
  FaTimes, FaSearch, FaBoxOpen, FaCheck,
  FaSortAmountDown, FaChevronDown,
} from "react-icons/fa";
import { MdTune } from "react-icons/md";
import { useSearchParams, useRouter } from "next/navigation";
import { useCategory } from "../../../../hooks/useCategories";
import { useProduct }  from "../../../../hooks/useProduct";
import { useCart }     from "../../../../hooks/useCart";
import { useAuth }     from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

/* ────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────── */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/category1.jpg";
  if (imagePath.startsWith("/") || imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
  return `/${imagePath.replace(/\\/g, "/")}`;
};
const toSlug = (name) => name?.toLowerCase().replace(/\s+/g, "-") ?? "";

const SORT_OPTIONS = [
  { key: "default",    label: "Default"            },
  { key: "price_asc",  label: "Price: Low → High"  },
  { key: "price_desc", label: "Price: High → Low"  },
  { key: "rating",     label: "Top Rated"          },
  { key: "name",       label: "Name A → Z"         },
];

/* ────────────────────────────────────────────────────────────
   Skeleton Card
──────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4" />
          <div className="h-9 bg-gray-200 rounded-2xl w-1/3" />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Dropdown – renders its panel below the trigger button
──────────────────────────────────────────────────────────── */
function Dropdown({ trigger, children, open, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      {trigger}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 min-w-[220px] rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            boxShadow: "0 12px 40px rgba(46,125,50,0.18)",
            border: "1px solid #C8E6C9",
            animation: "dropDown 0.18s ease-out",
          }}
        >
          {children}
        </div>
      )}
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Quick-view Modal
──────────────────────────────────────────────────────────── */
function ProductModal({ product, qty, onClose, onAdd, onIncrease, onDecrease }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(product);
    setAdding(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
        >
          <FaTimes size={13} />
        </button>

        <div className="relative h-60 sm:h-72 w-full">
          <Image
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            fill
            className="object-cover rounded-t-[32px]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent rounded-t-[32px]" />
          {product.isVeg && (
            <span className="absolute top-4 left-4 bg-brand-green text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow">
              <FaLeaf size={9} /> Pure Veg
            </span>
          )}
          <div className="absolute top-4 right-14 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-brand-green shadow">
            <FaStar size={9} style={{ color: "#FF8F00" }} /> {product.avgRating || "4.5"}
          </div>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{product.name}</h2>
          </div>
        </div>

        <div className="p-5 sm:p-6 pb-28">
          {product.description && (
            <p className="text-gray-500 text-sm leading-7">{product.description}</p>
          )}
          {product.stock !== undefined && (
            <p className="mt-2 text-xs font-medium" style={{ color: "#66BB6A" }}>
              In Stock: {product.stock ?? "Available"}
            </p>
          )}
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Price</p>
              <p className="text-3xl font-black" style={{ color: "#FF8F00" }}>₹{product.price}</p>
            </div>
            <div
              className="text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: "#EBF5E9", color: "#2E7D32" }}
            >
              🚚 FREE DELIVERY
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          {qty > 0 ? (
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-3"
              style={{ background: "#EBF5E9" }}
            >
              <button
                onClick={() => { onDecrease(product); onClose(); }}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition"
              >
                <FaMinus size={11} />
              </button>
              <span className="font-black text-xl" style={{ color: "#1B5E20" }}>{qty} in cart</span>
              <button
                onClick={() => { onIncrease(product); onClose(); }}
                className="w-10 h-10 rounded-full text-white shadow flex items-center justify-center transition"
                style={{ background: "#FF8F00" }}
              >
                <FaPlus size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full h-14 rounded-2xl text-white font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #FF8F00, #FFB300)" }}
            >
              {adding
                ? <><FaShoppingCart className="animate-bounce" /> Adding…</>
                : <><FaShoppingCart /> Add to Cart · ₹{product.price}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────── */
export default function VendorCategoryProducts() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  const { user }                                       = useAuth();
  const { categories, fetchCategories }                = useCategory();
  const { products, fetchProductsByCategory, loading } = useProduct();
  const { cart, addItem, updateItem, removeItem, totalItems, totalPrice } = useCart();

  const [category, setCategory]               = useState(null);
  const [addingId, setAddingId]               = useState(null);
  const [wishlist, setWishlist]               = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch]                   = useState("");
  const [vegOnly, setVegOnly]                 = useState(false);
  const [sortKey, setSortKey]                 = useState("default");
  const [sortOpen, setSortOpen]               = useState(false);
  const [filterOpen, setFilterOpen]           = useState(false);
  const [maxPrice, setMaxPrice]               = useState("");

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!categories?.length || !categorySlug) return;
    const match = categories.find((c) => toSlug(c.name) === categorySlug);
    if (match) { setCategory(match); fetchProductsByCategory(match._id); }
  }, [categories, categorySlug, fetchProductsByCategory]);

  /* ── cart helpers ── */
  const cartQty = (pid) => {
    const item = cart?.items?.find((i) => i.product?._id === pid);
    return item?.quantity ?? 0;
  };

  const handleAddToCart = async (product) => {
    if (!user) { toast.error("Please login to add items to cart"); router.push("/customerLogin/login"); return; }
    setAddingId(product._id);
    try { await addItem(product._id, 1); toast.success(`${product.name} added! 🛒`); }
    catch (err) { toast.error(err?.response?.data?.message || "Failed to add item"); }
    finally { setAddingId(null); }
  };

  const handleIncrease = async (p) => {
    try { await updateItem(p._id, cartQty(p._id) + 1); }
    catch { toast.error("Failed to update cart"); }
  };

  const handleDecrease = async (p) => {
    const qty = cartQty(p._id);
    try { qty <= 1 ? await removeItem(p._id) : await updateItem(p._id, qty - 1); }
    catch { toast.error("Failed to update cart"); }
  };

  const toggleWishlist = (id) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  /* ── filter + sort ── */
  const filtered = products
    .filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchVeg    = vegOnly ? p.isVeg : true;
      const matchPrice  = maxPrice ? p.price <= Number(maxPrice) : true;
      return matchSearch && matchVeg && matchPrice;
    })
    .sort((a, b) => {
      if (sortKey === "price_asc")  return a.price - b.price;
      if (sortKey === "price_desc") return b.price - a.price;
      if (sortKey === "rating")     return (b.avgRating ?? 4.5) - (a.avgRating ?? 4.5);
      if (sortKey === "name")       return a.name.localeCompare(b.name);
      return 0;
    });

  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort";
  const activeFilters   = (vegOnly ? 1 : 0) + (maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen pb-32" style={{ background: "#F9FFF6" }}>

      {/* ════════════ Sticky Top Bar ════════════ */}
      <div
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: "rgba(255,255,255,0.96)",
          borderBottom: "1px solid #C8E6C9",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 20px rgba(46,125,50,0.09)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: "#EBF5E9", color: "#2E7D32" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#C8E6C9")}
          onMouseLeave={e => (e.currentTarget.style.background = "#EBF5E9")}
        >
          <FaArrowLeft size={11} /> Back
        </button>

        <h1 className="font-black text-base sm:text-lg truncate" style={{ color: "#1B5E20" }}>
          {category?.name ?? "Products"}
        </h1>

        <button
          onClick={() => router.push("/cart")}
          className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #FF8F00, #FFB300)" }}
        >
          <FaShoppingCart size={13} />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
              style={{ background: "#1B5E20", color: "#fff" }}>
              {totalItems}
            </span>
          )}
          <span className="hidden sm:inline">Cart</span>
        </button>
      </div>

      {/* ════════════ Category Hero ════════════ */}
      {category && (
        <div className="relative h-52 sm:h-72 w-full overflow-hidden">
          <img
            src={getImageUrl(category.image)}
            alt={category.name}
            className="w-full h-full object-cover scale-105"
            style={{ filter: "brightness(0.88)" }}
            onError={(e) => { e.target.onerror = null; e.target.src = "/category1.jpg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* orange glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,143,0,0.35) 0%, transparent 70%)" }} />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-3"
                  style={{ background: "rgba(255,143,0,0.28)", color: "#FFD54F", border: "1px solid rgba(255,143,0,0.45)" }}
                >
                  <FaFire size={9} /> Popular Category
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-xl leading-tight">
                  {category.name}
                </h2>
              </div>

              {!loading && (
                <div
                  className="shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl hidden sm:flex"
                  style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                  <span className="text-2xl font-black text-white">{filtered.length}</span>
                  <span className="text-[11px] text-white/70 font-medium">Items</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Search & Filter Form ════════════ */}
      <div className="max-w-7xl mx-auto px-4 -mt-5 relative z-10">
        <div
          className="rounded-2xl p-4 sm:p-5 shadow-xl"
          style={{
            background: "#fff",
            border: "1px solid #C8E6C9",
            boxShadow: "0 8px 32px rgba(46,125,50,0.12)",
          }}
        >
          {/* ── Row 1: Search ── */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
            style={{ background: "#F9FFF6", borderColor: "#C8E6C9" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#2E7D32"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#C8E6C9"}
          >
            <FaSearch size={14} style={{ color: "#66BB6A", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products in this category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm font-medium"
              style={{ color: "#333" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#EBF5E9", color: "#2E7D32" }}
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          {/* ── Row 2: Controls ── */}
          <div className="flex flex-wrap items-center gap-2 mt-3">

            {/* Veg toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all"
              style={
                vegOnly
                  ? { background: "#2E7D32", color: "#fff", borderColor: "#2E7D32", boxShadow: "0 2px 10px rgba(46,125,50,0.3)" }
                  : { background: "#F9FFF6", color: "#2E7D32", borderColor: "#C8E6C9" }
              }
            >
              <FaLeaf size={12} />
              Pure Veg
              {vegOnly && <FaCheck size={10} />}
            </button>

            {/* Sort Dropdown */}
            <Dropdown
              open={sortOpen}
              onClose={() => setSortOpen(false)}
              trigger={
                <button
                  onClick={() => { setSortOpen((v) => !v); setFilterOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all"
                  style={
                    sortKey !== "default"
                      ? { background: "#EBF5E9", color: "#1B5E20", borderColor: "#2E7D32" }
                      : { background: "#F9FFF6", color: "#1B5E20", borderColor: "#C8E6C9" }
                  }
                >
                  <FaSortAmountDown size={12} />
                  <span className="hidden sm:inline">{sortKey !== "default" ? activeSortLabel : "Sort"}</span>
                  <span className="sm:hidden">Sort</span>
                  <FaChevronDown
                    size={10}
                    style={{ transition: "transform 0.2s", transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
              }
            >
              <div className="py-2">
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#81C784" }}>
                  Sort By
                </p>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: sortKey === opt.key ? "#1B5E20" : "#555" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F9FFF6")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {opt.label}
                    {sortKey === opt.key && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#2E7D32" }}>
                        <FaCheck size={9} style={{ color: "#fff" }} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Dropdown>

            {/* Filter Dropdown */}
            <Dropdown
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              trigger={
                <button
                  onClick={() => { setFilterOpen((v) => !v); setSortOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all relative"
                  style={
                    activeFilters > 0
                      ? { background: "#EBF5E9", color: "#1B5E20", borderColor: "#2E7D32" }
                      : { background: "#F9FFF6", color: "#1B5E20", borderColor: "#C8E6C9" }
                  }
                >
                  <MdTune size={15} />
                  Filters
                  {activeFilters > 0 && (
                    <span
                      className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                      style={{ background: "#FF8F00" }}
                    >
                      {activeFilters}
                    </span>
                  )}
                  <FaChevronDown
                    size={10}
                    style={{ transition: "transform 0.2s", transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
              }
            >
              <div className="p-4 space-y-4 min-w-[240px]">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#81C784" }}>
                  Filters
                </p>

                {/* Max price */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "#1B5E20" }}>
                    Max Price (₹)
                  </label>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                    style={{ background: "#F9FFF6", borderColor: "#C8E6C9" }}
                  >
                    <span className="text-sm font-bold" style={{ color: "#66BB6A" }}>₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-transparent outline-none w-full text-sm"
                      style={{ color: "#333" }}
                      min={0}
                    />
                    {maxPrice && (
                      <button onClick={() => setMaxPrice("")}>
                        <FaTimes size={10} style={{ color: "#aaa" }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Veg inside filter too */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "#1B5E20" }}>
                    Diet
                  </label>
                  <button
                    onClick={() => setVegOnly(!vegOnly)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all"
                    style={
                      vegOnly
                        ? { background: "#EBF5E9", color: "#1B5E20", borderColor: "#2E7D32" }
                        : { background: "#F9FFF6", color: "#555", borderColor: "#C8E6C9" }
                    }
                  >
                    <span className="flex items-center gap-2"><FaLeaf size={11} style={{ color: "#2E7D32" }} /> Pure Veg Only</span>
                    {vegOnly && <FaCheck size={11} style={{ color: "#2E7D32" }} />}
                  </button>
                </div>

                {/* Clear button */}
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setVegOnly(false); setMaxPrice(""); }}
                    className="w-full py-2.5 rounded-xl text-sm font-bold border transition-all"
                    style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </Dropdown>

            {/* Results chip — right-aligned */}
            {!loading && (
              <span
                className="ml-auto text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "#EBF5E9", color: "#2E7D32" }}
              >
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* ── Active filter pills ── */}
          {(vegOnly || maxPrice || sortKey !== "default") && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: "1px dashed #C8E6C9" }}>
              {vegOnly && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full cursor-pointer"
                  style={{ background: "#EBF5E9", color: "#1B5E20" }}
                  onClick={() => setVegOnly(false)}
                >
                  <FaLeaf size={9} /> Veg Only <FaTimes size={8} />
                </span>
              )}
              {maxPrice && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full cursor-pointer"
                  style={{ background: "#EBF5E9", color: "#1B5E20" }}
                  onClick={() => setMaxPrice("")}
                >
                  Under ₹{maxPrice} <FaTimes size={8} />
                </span>
              )}
              {sortKey !== "default" && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full cursor-pointer"
                  style={{ background: "#EBF5E9", color: "#1B5E20" }}
                  onClick={() => setSortKey("default")}
                >
                  {activeSortLabel} <FaTimes size={8} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════ Product Grid ════════════ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#EBF5E9" }}
            >
              <FaBoxOpen size={30} style={{ color: "#66BB6A" }} />
            </div>
            <p className="text-lg font-black" style={{ color: "#1B5E20" }}>No products found</p>
            <p className="text-sm text-center max-w-xs" style={{ color: "#66BB6A" }}>
              {search
                ? `No results for "${search}". Try a different keyword.`
                : "No products match your current filters."}
            </p>
            <button
              onClick={() => { setSearch(""); setVegOnly(false); setMaxPrice(""); setSortKey("default"); }}
              className="mt-1 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
            >
              Reset All
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => {
              const qty      = cartQty(product._id);
              const isAdding = addingId === product._id;

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-[28px] overflow-hidden flex flex-col hover:-translate-y-1.5 transition-all duration-300"
                  style={{
                    border: "1px solid #E8F5E9",
                    boxShadow: "0 2px 16px rgba(46,125,50,0.07)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 12px 36px rgba(46,125,50,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 16px rgba(46,125,50,0.07)")}
                >
                  {/* ── Image ── */}
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative h-44 sm:h-52 w-full bg-gray-100">
                      <Image
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    {/* Veg badge */}
                    {product.isVeg ? (
                      <div
                        className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow"
                        style={{ background: "#2E7D32", color: "#fff" }}
                      >
                        <FaLeaf size={8} /> Veg
                      </div>
                    ) : (
                      <div
                        className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow"
                        style={{ background: "#B71C1C", color: "#fff" }}
                      >
                        Non-Veg
                      </div>
                    )}

                    {/* Rating */}
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.93)", color: "#1B5E20", backdropFilter: "blur(4px)" }}
                    >
                      <FaStar size={9} style={{ color: "#FF8F00" }} />
                      {product.avgRating ?? "4.5"}
                    </div>

                    {/* Wishlist */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: "rgba(255,255,255,0.92)", color: wishlist.includes(product._id) ? "#EF4444" : "#bbb" }}
                    >
                      <FaHeart size={12} />
                    </button>
                  </div>

                  {/* ── Card Body ── */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-black text-gray-900 text-[14px] sm:text-[15px] leading-snug line-clamp-1 cursor-pointer hover:text-brand-green transition-colors"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-gray-400 text-[11px] sm:text-xs mt-1 line-clamp-2 leading-[1.55rem] flex-1">
                        {product.description}
                      </p>
                    )}

                    {/* Price + CTA */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[18px] sm:text-xl font-black leading-none" style={{ color: "#FF8F00" }}>
                          ₹{product.price}
                        </p>
                        {product.stock !== undefined && (
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: "#66BB6A" }}>
                            Stock: {product.stock}
                          </p>
                        )}
                      </div>

                      {qty > 0 ? (
                        <div
                          className="flex items-center gap-1 rounded-xl px-1.5 py-1"
                          style={{ background: "#EBF5E9" }}
                        >
                          <button
                            onClick={() => handleDecrease(product)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors font-bold"
                            style={{ background: "#fff", color: "#2E7D32" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#C8E6C9")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                          >
                            <FaMinus size={8} />
                          </button>
                          <span className="font-black text-sm min-w-[18px] text-center" style={{ color: "#1B5E20" }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => handleIncrease(product)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-colors font-bold"
                            style={{ background: "#FF8F00" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#E65100")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#FF8F00")}
                          >
                            <FaPlus size={8} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding}
                          className="flex items-center gap-1.5 text-white px-3 py-2 rounded-xl font-bold text-xs transition-all disabled:opacity-60 hover:scale-105 active:scale-95"
                          style={{ background: "linear-gradient(135deg, #FF8F00, #FFB300)", boxShadow: "0 3px 10px rgba(255,143,0,0.35)" }}
                        >
                          {isAdding
                            ? <FaSpinner className="animate-spin" size={10} />
                            : <FaShoppingCart size={10} />}
                          {isAdding ? "Adding…" : "Add"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════ View Cart sticky bar ════════════ */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 z-50 pointer-events-none">
          <button
            onClick={() => router.push("/cart")}
            className="pointer-events-auto w-full max-w-lg mx-auto flex items-center justify-between px-5 py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
              display: "flex",
              boxShadow: "0 8px 36px rgba(27,94,32,0.5)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                {totalItems}
              </div>
              <div>
                <p className="text-sm font-bold leading-none">
                  {totalItems} item{totalItems > 1 ? "s" : ""} in cart
                </p>
                <p className="text-[11px] text-white/70 mt-0.5">Tap to review your order</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-black">
              <span>₹{totalPrice}</span>
              <span className="text-white/60">→</span>
            </div>
          </button>
        </div>
      )}

      {/* ════════════ Quick-view Modal ════════════ */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          qty={cartQty(selectedProduct._id)}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddToCart}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
        />
      )}
    </div>
  );
}
