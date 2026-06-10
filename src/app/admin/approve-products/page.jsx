"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  MdCheckCircle,
  MdSearch,
  MdRestaurantMenu,
  MdInventory,
} from "react-icons/md";
import { FaLeaf, FaBoxOpen } from "react-icons/fa";
import { useProduct } from "../../../../hooks/useProduct";

/* ── Image URL helper ── */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/no-image.png";
  if (imagePath.startsWith("/") || imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
  return `/${imagePath.replace(/\\/g, "/")}`;
};

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="flex justify-between mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-10 bg-gray-200 rounded-xl mt-2" />
    </div>
  </div>
);

/* ── Empty state ── */
const EmptyState = ({ tab }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: "#EBF5E9" }}
    >
      <FaBoxOpen className="text-4xl" style={{ color: "#66BB6A" }} />
    </div>
    <h3 className="text-lg font-bold mb-1" style={{ color: "#1B5E20" }}>
      No {tab === "pending" ? "Pending" : "Approved"} Products
    </h3>
    <p className="text-sm" style={{ color: "#81C784" }}>
      {tab === "pending"
        ? "All products have been reviewed."
        : "No products approved yet."}
    </p>
  </div>
);

/* ══════════════════════════════════════════ */
export default function ApproveProductsPage() {
  const { products, fetchProducts, approveProduct, loading } = useProduct();
  const [activeTab, setActiveTab]   = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  /* ── Derived lists ── */
  const pending  = products?.filter((p) => !p.isApproved)  || [];
  const approved = products?.filter((p) =>  p.isApproved)  || [];

  const filterBySearch = (list) =>
    list.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const visibleProducts =
    activeTab === "pending"
      ? filterBySearch(pending)
      : filterBySearch(approved);

  /* ── Approve handler ── */
  const handleApprove = async (id) => {
    try {
      await approveProduct(id);
      toast.success("Product approved!");
      fetchProducts();
    } catch {
      toast.error("Approval failed");
    }
  };

  /* ── Tab config ── */
  const tabs = [
    { key: "pending",  label: "Pending",  count: pending.length  },
    { key: "approved", label: "Approved", count: approved.length },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B5E20" }}>
            Product Approvals
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#66BB6A" }}>
            Review and approve vendor product listings
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold"
            style={{ background: "#FFF8E1", borderColor: "#FFD54F", color: "#E65100" }}
          >
            <MdInventory className="text-base" />
            {pending.length} Pending
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold"
            style={{ background: "#EBF5E9", borderColor: "#A5D6A7", color: "#2E7D32" }}
          >
            <MdCheckCircle className="text-base" />
            {approved.length} Approved
          </div>
        </div>
      </div>

      {/* ── Search + Tabs bar ── */}
      <div
        className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: "#FFFFFF", borderColor: "#C8E6C9" }}
      >
        {/* Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl shrink-0"
          style={{ background: "#F0F7F0" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                activeTab === tab.key
                  ? {
                      background: "#2E7D32",
                      color: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(46,125,50,0.25)",
                    }
                  : { color: "#66BB6A" }
              }
            >
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                style={
                  activeTab === tab.key
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "#C8E6C9", color: "#2E7D32" }
                }
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1 rounded-xl px-4 py-2.5 border"
          style={{ background: "#F9FFF6", borderColor: "#C8E6C9" }}
        >
          <MdSearch className="text-xl shrink-0" style={{ color: "#66BB6A" }} />
          <input
            type="text"
            placeholder="Search by name or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm"
            style={{ color: "#333" }}
          />
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

        {/* Empty state */}
        {!loading && visibleProducts.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* Product cards */}
        {!loading &&
          visibleProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onApprove={handleApprove}
              loading={loading}
            />
          ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ */
/* Product Card Component                    */
/* ══════════════════════════════════════════ */
function ProductCard({ product, onApprove, loading }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border flex flex-col transition-all duration-200 group"
      style={{
        borderColor: "#E8F5E9",
        boxShadow: "0 1px 8px rgba(46,125,50,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(46,125,50,0.14)";
        e.currentTarget.style.borderColor = "#A5D6A7";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 8px rgba(46,125,50,0.06)";
        e.currentTarget.style.borderColor = "#E8F5E9";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ── Image ── */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
        <Image
          src={imgError ? "/no-image.png" : getImageUrl(product.images?.[0])}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
          onError={() => setImgError(true)}
        />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {product.isApproved ? (
            <span
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
              style={{ background: "#2E7D32", color: "#fff" }}
            >
              <MdCheckCircle className="text-sm" /> Approved
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
              style={{ background: "#FF8F00", color: "#fff" }}
            >
              ⏳ Pending
            </span>
          )}
        </div>

        {/* Category badge — top right */}
        {product.category?.name && (
          <div className="absolute top-3 right-3">
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.92)", color: "#2E7D32", border: "1px solid #C8E6C9" }}
            >
              <FaLeaf className="text-[9px]" />
              {product.category.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name */}
        <h2
          className="font-bold text-base leading-snug line-clamp-1"
          style={{ color: "#1B5E20" }}
        >
          {product.name}
        </h2>

        {/* Description */}
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#888" }}>
          {product.description || "No description provided."}
        </p>

        {/* Price + Stock row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xl font-extrabold" style={{ color: "#FF8F00" }}>
            ₹{product.price}
          </span>
          <span
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "#F0F7F0", color: "#2E7D32" }}
          >
            <MdRestaurantMenu className="text-sm" />
            Stock: {product.stock ?? "—"}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#F0F7F0" }} />

        {/* CTA Button */}
        {product.isApproved ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
            style={{ background: "#F0F7F0", color: "#A5D6A7" }}
          >
            <MdCheckCircle className="text-base" />
            Already Approved
          </button>
        ) : (
          <button
            onClick={() => onApprove(product._id)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: "#2E7D32", color: "#fff" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1B5E20";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(46,125,50,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2E7D32";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <MdCheckCircle className="text-base" />
            Approve Product
          </button>
        )}
      </div>
    </div>
  );
}
