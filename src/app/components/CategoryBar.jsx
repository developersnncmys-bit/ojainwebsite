"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCategory } from "../../../hooks/useCategories";
import { FaArrowRight, FaUtensils, FaChevronRight } from "react-icons/fa";
import ScrollReveal from "./ScrollReveal";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Local /public asset or already-absolute URL — use as-is.
  if (imagePath.startsWith("/") || imagePath.startsWith("blob:") || imagePath.startsWith("http"))
    return imagePath;
  return `/${imagePath.replace(/\\/g, "/")}`;
};

export default function CategoryBar() {
  const { categories, fetchCategories, loading, error } = useCategory();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-6 w-40 bg-gray-100 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-72 bg-gray-100 rounded-xl mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-56 bg-gray-100 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden animate-pulse bg-gray-100 aspect-4/3" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50 text-center">
        <p className="text-gray-500">{error ? `Error: ${error}` : "No categories yet"}</p>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-white">

      {/* Subtle background blobs */}
      <div className="absolute top-0 left-0 w-125 h-125 rounded-full bg-brand-green-pale/30 blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-125 h-125 rounded-full bg-brand-green-pale/20 blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <ScrollReveal animation="fade-up" className="text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 bg-brand-green-pale text-brand-green px-5 py-2 rounded-full text-sm font-bold shadow-sm mb-5">
            <FaUtensils size={12} />
            Browse Categories
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            <span className="text-gray-900">Explore Our</span>{" "}
            <span className="text-brand-green">Food Categories</span>
          </h2>

          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto leading-8">
            Discover handpicked delights — from authentic curries to exotic desserts.
          </p>
        </ScrollReveal>

        {/* ── Category Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat._id} animation="scale-up" delay={i * 70}>
            <Link
              href={`/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-green/40"
              style={{ background: "#0b160d" }}
            >
              {/* Full image — object-contain so nothing is cropped */}
              <div className="aspect-4/3 relative w-full">
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/category1.jpg"; }}
                />

                {/* Scrim — only bottom quarter for text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

                {/* Hover shimmer ring */}
                <div className="absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 ring-brand-green/60 transition-all duration-500 pointer-events-none" />
              </div>

              {/* Card Footer */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
                <h3 className="text-white font-black text-sm md:text-base leading-snug line-clamp-2 drop-shadow-md">
                  {cat.name}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-[#FFA726] text-[11px] font-bold tracking-wide uppercase">
                  <span>Explore</span>
                  <FaChevronRight size={8} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* ── View All CTA ── */}
        <ScrollReveal animation="fade-up" delay={100} className="mt-12 flex justify-center">
          <Link
            href="/categories"
            className="group inline-flex items-center gap-3 bg-brand-green hover:bg-[#1a5c23] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-brand-green/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <FaUtensils size={14} />
            View All Categories
            <FaArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </ScrollReveal>

      </div>
    </section>
  );
}
