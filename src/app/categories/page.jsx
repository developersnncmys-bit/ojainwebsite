"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FaArrowRight, FaUtensils } from "react-icons/fa";
import { useCategory } from "../../../hooks/useCategories";

const toSlug = (name) => name?.toLowerCase().replace(/\s+/g, "-") ?? "";

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "/category1.jpg";
  }

  // Local /public asset or already-absolute URL — use as-is.
  if (
    imagePath.startsWith("/") ||
    imagePath.startsWith("http") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  return `/${imagePath.replace(/\\/g, "/")}`;
};

export default function CategoriesPage() {
  const { categories, fetchCategories, loading, error } = useCategory();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse mb-4" />
            <div className="h-5 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[28px] overflow-hidden shadow animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-5 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-5">
            <FaUtensils />
            All Categories
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Browse All <span className="text-orange-500">Product Categories</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl">
            Explore our full range of pure Jain &amp; Satvik O-Jain premix product categories.
          </p>
        </div>

        {/* Category Grid */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-3xl p-14 text-center shadow">
            <p className="text-gray-400 text-lg">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${toSlug(cat.name)}`}
                className="group relative block bg-white rounded-[28px] shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-green-50"
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-110"
                    onError={(e) => (e.target.src = "/category1.jpg")}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-xl font-bold tracking-tight">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-white/70 text-sm mt-1 line-clamp-1">{cat.description}</p>
                  )}
                  <div className="mt-3 flex items-center text-orange-400 font-semibold text-sm group-hover:text-orange-300 transition">
                    <span>Explore now</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-semibold transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
