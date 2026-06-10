"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FaStar, FaHeart, FaTimes, FaMinus, FaPlus,
  FaShoppingCart, FaFireAlt, FaLeaf, FaSpinner,
} from "react-icons/fa";
import ScrollReveal from "./ScrollReveal";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";
import { useProduct } from "../../../hooks/useProduct";
import getImageUrl from "../../../utils/getImageUrl";

/* ─────────────────────────────────────────────────────────
   Quick-view modal — uses real product data from backend
───────────────────────────────────────────────────────── */
function ProductModal({ product, cartQty, onClose, onAdd, onIncrease, onDecrease }) {
  const qty = cartQty(product._id);

  const [adding, setAdding] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product?._id) return;
    // No backend in this UI-only build — start with no reviews.
    setReviews([]);
  }, [product]);

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(product);
    setAdding(false);
    onClose();
  };
  const submitReview = async () => {
    // No backend in this UI-only build — keep the review in local state.
    setSubmittingReview(true);
    const newReview = {
      _id: `review-${Date.now()}`,
      rating,
      comment,
      customerId: { name: "You" },
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setComment("");
    setRating(5);
    toast.success("Review submitted");
    setSubmittingReview(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-4xl sm:rounded-4xl bg-white shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
        >
          <FaTimes size={14} />
        </button>

        {/* Hero image */}
        <div className="relative h-56 sm:h-72 w-full">
          <Image
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            fill
            className="object-cover rounded-t-4xl sm:rounded-t-4xl"
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent rounded-t-4xl" />

          {/* Veg badge */}
          {product.isVeg && (
            <span className="absolute top-4 left-4 bg-brand-green text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow">
              <FaLeaf size={9} /> Pure Veg
            </span>
          )}

          {/* Rating */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-brand-green shadow">
            <FaStar size={9} />
            {product.avgRating || 0}
            <span className="text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{product.name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 pb-48">
          {product.description && (
            <p className="text-gray-500 text-sm leading-7">{product.description}</p>
          )}

          {/* Stock */}
          {product.stock !== undefined && (
            <p className="mt-3 text-xs text-gray-400">Stock: {product.stock ?? "Available"}</p>
          )}

          {/* Price */}
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Price</p>
              <p className="text-3xl font-black text-brand-orange">₹{product.price}</p>
            </div>
            <div className="bg-brand-green-pale text-brand-green text-xs font-bold px-3 py-1.5 rounded-full">
              FREE DELIVERY
            </div>
          </div>
          {/* Write Review */}
          <div className="mt-8 border rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">
              Write a Review
            </h3>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border rounded-lg p-3 mb-3"
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>

            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
              className="w-full border rounded-lg p-3 mb-3"
            />

            <button
              onClick={submitReview}
              disabled={submittingReview || !comment.trim()}
              className="bg-brand-green text-white px-5 py-3 rounded-xl font-bold"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          {/* Customer Reviews */}
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-4">
              Customer Reviews
            </h3>

            {reviewsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <FaSpinner className="animate-spin" />
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-gray-400 text-sm">
                No reviews yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border-b border-gray-100 pb-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        {review.customerId?.name}
                      </span>

                      <span className="text-yellow-500 text-sm">
                        {"⭐".repeat(review.rating)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      {review.comment}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky CTA */}
        {/* <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4"> */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          {qty > 0 ? (
            <div className="flex items-center justify-between bg-brand-green-pale rounded-2xl px-5 py-3">
              <button
                onClick={() => { onDecrease(product); onClose(); }}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition"
              >
                <FaMinus size={11} />
              </button>
              <span className="font-black text-brand-green text-xl">{qty} in cart</span>
              <button
                onClick={() => { onIncrease(product); onClose(); }}
                className="w-10 h-10 rounded-full bg-brand-orange text-white shadow flex items-center justify-center hover:bg-[#E65100] transition"
              >
                <FaPlus size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full h-13 rounded-2xl bg-brand-orange hover:bg-[#E65100] text-white font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
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

/* ─────────────────────────────────────────────────────────
   Skeleton card shown while products load
───────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-10 bg-gray-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
function FeaturedProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, addItem, updateItem, removeItem } = useCart();
  const { products, loading, fetchProducts } = useProduct();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [addingId, setAddingId] = useState(null);


  // Fetch products on mount
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Show first 4 products
  const featured = products.slice(0, 4);

  /* ── cart helpers (same logic as category page) ── */
  const cartQty = (productId) => {
    const item = cart?.items?.find((i) => i.product?._id === productId);
    return item?.quantity ?? 0;
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/customerLogin/login");
      return;
    }
    setAddingId(product._id);
    try {
      await addItem(product._id, 1);
      toast.success(`${product.name} added! 🛒`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add item");
    } finally {
      setAddingId(null);
    }
  };

  const handleIncrease = async (product) => {
    try {
      await updateItem(product._id, cartQty(product._id) + 1);
    } catch {
      toast.error("Failed to update cart");
    }
  };


  const handleDecrease = async (product) => {
    const qty = cartQty(product._id);
    try {
      if (qty <= 1) await removeItem(product._id);
      else await updateItem(product._id, qty - 1);
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <>
      <section className="relative py-16 md:py-20 overflow-hidden bg-[#f8f8f8]">

        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green-pale/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-green-pale/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <ScrollReveal animation="fade-up" className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-green-pale text-brand-green px-5 py-2 rounded-full text-sm font-bold shadow-sm">
                <FaFireAlt /> Trending Foods
              </div>
              <h2 className="mt-5 text-4xl md:text-5xl font-black leading-tight tracking-tight">
                <span className="text-brand-green">Popular</span>{" "}
                <span className="text-gray-900">Foods</span>
                <br />
                <span className="text-gray-900">Near</span>{" "}
                <span className="text-brand-green">You</span>
              </h2>
              <p className="mt-4 text-base text-gray-500 max-w-xl leading-7">
                Discover authentic meals from top-rated chefs near you.
              </p>
            </div>
            <button
              onClick={() => router.push("/categories")}
              className="hidden lg:flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-7 py-4 rounded-2xl font-bold shadow-xl transition-all"
            >
              <FaFireAlt /> Explore All
            </button>
          </ScrollReveal>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Loading skeletons */}
            {loading && featured.length === 0 &&
              [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
            }

            {/* Empty state */}
            {!loading && featured.length === 0 && (
              <div className="col-span-4 text-center py-16 text-gray-400 text-lg">
                No products found.
              </div>
            )}

            {/* Real product cards */}
            {featured.map((product, i) => {
              const qty = cartQty(product._id);
              const isAdding = addingId === product._id;

              return (
                <ScrollReveal key={product._id} animation="scale-up" delay={i * 100}>
                  <div
                    className="group bg-white rounded-[28px] overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
                  >
                    {/* ── Image ── */}
                    <div
                      className="relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative h-56 w-full">
                        <Image
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-700"
                          unoptimized
                        />
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

                      {/* Veg badge */}
                      {product.isVeg && (
                        <div className="absolute top-4 left-4 bg-brand-green text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <FaLeaf size={9} /> Pure Veg
                        </div>
                      )}

                      {/* Rating */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-brand-green shadow">
                        <>
                          <FaStar size={9} />
                          {product.avgRating || 0}
                          <span className="text-gray-500">
                            ({product.reviewCount || 0})
                          </span>
                        </>
                      </div>

                      {/* Wishlist */}
                      {/* <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                        className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition-all ${wishlist.includes(product._id) ? "text-red-500" : "text-gray-400"
                          }`}
                      >
                        <FaHeart size={13} />
                      </button> */}
                    </div>

                    {/* ── Content ── */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3
                        className="text-xl font-black text-gray-900 leading-tight truncate cursor-pointer hover:text-brand-green transition"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-5 flex-1">
                          {product.description}
                        </p>
                      )}

                      {/* Price + Cart controls */}
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <p className="text-2xl font-black text-brand-orange">₹{product.price}</p>

                        {qty > 0 ? (
                          /* ── In-cart: show +/− ── */
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecrease(product)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                            >
                              <FaMinus size={10} />
                            </button>
                            <span className="font-black text-brand-green min-w-5 text-center text-base">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleIncrease(product)}
                              className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-[#E65100] transition"
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        ) : (
                          /* ── Not in cart: Add button ── */
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isAdding}
                            className="flex items-center gap-2 bg-brand-orange hover:bg-[#E65100] text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all disabled:opacity-70 whitespace-nowrap"
                          >
                            {isAdding
                              ? <FaSpinner className="animate-spin" />
                              : <FaShoppingCart size={12} />}
                            {isAdding ? "Adding…" : "Add"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Mobile CTA */}
          <ScrollReveal animation="fade-up" delay={100} className="mt-10 flex justify-center lg:hidden">
            <button
              onClick={() => router.push("/categories")}
              className="flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-7 py-4 rounded-2xl font-bold shadow-xl transition"
            >
              <FaFireAlt /> Explore All Categories
            </button>
          </ScrollReveal>

        </div>
      </section>

      {/* Quick-view modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cartQty={cartQty}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddToCart}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
        />
      )}
    </>
  );
}

export default FeaturedProducts;
