// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import { FaStar, FaShoppingCart, FaArrowLeft, FaPlus, FaMinus, FaLeaf } from "react-icons/fa";
// import { useCategory } from "../../../../hooks/useCategories";
// import { useProduct }  from "../../../../hooks/useProduct";
// import { useCart }     from "../../../../hooks/useCart";
// import { useAuth }     from "../../../contexts/AuthContext";

// const toSlug = (name) => name?.toLowerCase().replace(/\s+/g, "-") ?? "";

// const getImageUrl = (imagePath) => {
//   if (!imagePath) return "/fallback-category.jpg";
//   if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
//   let p = imagePath.replace(/\\/g, "/");
//   if (p.startsWith("/")) p = p.slice(1);
//   const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//   return `${BASE}/${p}`;
// };

// export default function CategoryPage() {
//   const { slug }    = useParams();
//   const router      = useRouter();
//   const { user }    = useAuth();
//   const { categories, fetchCategories } = useCategory();
//   const { products, fetchProductsByCategory, loading } = useProduct();
//   const { addItem, totalItems, totalPrice, cart }      = useCart();

//   const [category, setCategory]   = useState(null);
//   // Track qty per product in local UI (for +/- buttons before adding)
//   const [qtys, setQtys]           = useState({});
//   const [addingId, setAddingId]   = useState(null);

//   useEffect(() => { fetchCategories(); }, [fetchCategories]);

//   useEffect(() => {
//     if (!categories?.length || !slug) return;
//     const match = categories.find((c) => toSlug(c.name) === slug);
//     if (match) {
//       setCategory(match);
//       fetchProductsByCategory(match._id);
//     }
//   }, [categories, slug, fetchProductsByCategory]);

//   /* ── helpers ── */
//   const getQty     = (id) => qtys[id] ?? 1;
//   const changeQty  = (id, delta) => setQtys((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));

//   // How many of this product are already in cart
//   const cartQty = (productId) => {
//     const item = cart?.items?.find((i) => i.product?._id === productId);
//     return item?.quantity ?? 0;
//   };

//   const handleAddToCart = async (product) => {
//     if (!user) {
//       toast.error("Please login to add items to cart");
//       router.push("/customerLogin/login");
//       return;
//     }
//     setAddingId(product._id);
//     try {
//       await addItem(product._id, getQty(product._id));
//       toast.success(`${product.name} added to cart! 🛒`);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to add item");
//     } finally {
//       setAddingId(null);
//     }
//   };

//   /* ── loading skeleton ── */
//   if (!category && loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="h-72 bg-gray-200 animate-pulse w-full" />
//         <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//           {[...Array(8)].map((_, i) => (
//             <div key={i} className="bg-white rounded-3xl overflow-hidden shadow animate-pulse">
//               <div className="h-48 bg-gray-200" />
//               <div className="p-4 space-y-3">
//                 <div className="h-5 bg-gray-200 rounded w-3/4" />
//                 <div className="h-4 bg-gray-200 rounded w-1/2" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (!category && !loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
//         <h1 className="text-3xl font-bold text-gray-800">Category Not Found</h1>
//         <p className="text-gray-500">The category you&apos;re looking for doesn&apos;t exist.</p>
//         <Link href="/" className="flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#E65100] transition">
//           <FaArrowLeft /> Back to Home
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-28">

//       {/* ── HEADER BAR ── */}
//       <div className="sticky top-0 z-40 bg-white shadow-md px-4 sm:px-6 py-4 flex justify-between items-center">
//         <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-brand-orange transition font-semibold text-sm sm:text-base">
//           <FaArrowLeft />
//           <span className="hidden sm:inline">Back</span>
//         </Link>
//         <h1 className="text-lg sm:text-xl font-black text-brand-orange">
//           {category?.name || "Category"}
//         </h1>
//         {/* Cart badge */}
//         <Link href="/cart" className="relative">
//           <div className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-full font-semibold shadow text-sm">
//             <FaShoppingCart />
//             <span>{totalItems}</span>
//           </div>
//         </Link>
//       </div>

//       {/* ── CATEGORY HERO ── */}
//       {category && (
//         <div className="relative h-52 sm:h-64 md:h-80 w-full overflow-hidden">
//           <img
//             src={getImageUrl(category.image)}
//             alt={category.name}
//             className="w-full h-full object-cover"
//             onError={(e) => (e.target.src = "/fallback-category.jpg")}
//           />
//           <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
//           <div className="absolute bottom-6 left-4 sm:left-8">
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{category.name}</h2>
//             {category.description && (
//               <p className="mt-2 text-white/70 text-sm sm:text-base">{category.description}</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── PRODUCTS SECTION ── */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
//             {loading
//               ? "Loading products..."
//               : `${products.length} Product${products.length !== 1 ? "s" : ""}`}
//           </h3>
//         </div>

//         {/* Loading skeleton */}
//         {loading && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//             {[...Array(8)].map((_, i) => (
//               <div key={i} className="bg-white rounded-3xl overflow-hidden shadow animate-pulse">
//                 <div className="h-48 bg-gray-200" />
//                 <div className="p-4 space-y-3">
//                   <div className="h-5 bg-gray-200 rounded w-3/4" />
//                   <div className="h-4 bg-gray-200 rounded w-1/2" />
//                   <div className="h-10 bg-gray-200 rounded-xl" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Empty state */}
//         {!loading && products.length === 0 && (
//           <div className="bg-white rounded-3xl p-14 text-center shadow-md">
//             <p className="text-gray-400 text-lg">No products found in this category yet.</p>
//             <Link href="/" className="mt-6 inline-block bg-brand-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-[#E65100] transition">
//               Browse Other Categories
//             </Link>
//           </div>
//         )}

//         {/* Product Grid */}
//         {!loading && products.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
//             {products.map((product) => {
//               const inCart  = cartQty(product._id);
//               const isAdding = addingId === product._id;

//               return (
//                 <div
//                   key={product._id}
//                   className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
//                 >
//                   {/* Product image */}
//                   <div className="relative h-48 sm:h-52 w-full shrink-0">
//                     <Image
//                       src={getImageUrl(product.images?.[0])}
//                       alt={product.name}
//                       fill
//                       className="object-cover"
//                       unoptimized
//                     />
//                     {/* Veg badge */}
//                     {product.isVeg && (
//                       <div className="absolute top-3 left-3 bg-brand-green text-white text-xs px-3 py-1 rounded-full font-bold shadow flex items-center gap-1">
//                         <FaLeaf size={9} /> Pure Veg
//                       </div>
//                     )}
//                     {/* Rating */}
//                     <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur text-brand-green px-2 py-1 rounded-full text-xs font-bold shadow">
//                       <FaStar size={9} />
//                       {product.avgRating || "4.5"}
//                     </div>
//                   </div>

//                   {/* Product info */}
//                   <div className="p-4 flex flex-col flex-1">
//                     <h4 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">{product.name}</h4>
//                     <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 flex-1">{product.description}</p>
//                     <p className="text-xs text-gray-400 mt-1">Stock: {product.stock ?? "Available"}</p>

//                     {/* Price + Add to Cart */}
//                     <div className="mt-4 flex items-center justify-between gap-2">
//                       <p className="text-xl sm:text-2xl font-black text-brand-orange">₹{product.price}</p>

//                       {/* If already in cart — show qty controls */}
//                       {inCart > 0 ? (
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => handleAddToCart({ ...product, _qty: inCart - 1 })}
//                             className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
//                           >
//                             <FaMinus size={10} />
//                           </button>
//                           <span className="font-bold text-brand-green min-w-5 text-center">{inCart}</span>
//                           <button
//                             onClick={() => handleAddToCart(product)}
//                             disabled={isAdding}
//                             className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-[#E65100] transition"
//                           >
//                             {isAdding ? <FaShoppingCart size={10} className="animate-bounce" /> : <FaPlus size={10} />}
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => handleAddToCart(product)}
//                           disabled={isAdding}
//                           className="flex items-center gap-2 bg-brand-orange hover:bg-[#E65100] text-white px-4 py-2 rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-70 whitespace-nowrap"
//                         >
//                           {isAdding
//                             ? <><FaShoppingCart className="animate-bounce" /> Adding...</>
//                             : <><FaShoppingCart /> Add</>
//                           }
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ── STICKY VIEW CART BAR (mobile-first) ── */}
//       {totalItems > 0 && (
//         <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
//           <button
//             onClick={() => router.push("/cart")}
//             className="w-full max-w-lg mx-auto flex items-center justify-between bg-brand-green text-white px-6 py-4 rounded-2xl shadow-2xl hover:bg-[#1B5E20] transition-all duration-300"
//             style={{ display: "flex" }}
//           >
//             <div className="flex items-center gap-3">
//               <span className="bg-white text-brand-green font-black text-sm w-7 h-7 rounded-full flex items-center justify-center">
//                 {totalItems}
//               </span>
//               <span className="font-bold text-[15px]">{totalItems} item{totalItems > 1 ? "s" : ""} added</span>
//             </div>
//             <div className="flex items-center gap-2 font-black text-[15px]">
//               View Cart • ₹{totalPrice} →
//             </div>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Image from "next/image";

import Link from "next/link";

import toast from "react-hot-toast";

import {
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaLeaf,
} from "react-icons/fa";

import { useCategory } from "../../../../hooks/useCategories";

import { useProduct } from "../../../../hooks/useProduct";

import { useCart } from "../../../../hooks/useCart";

import { useAuth } from "../../../contexts/AuthContext";

const toSlug = (name) =>
  name?.toLowerCase().replace(/\s+/g, "-") ?? "";

const getImageUrl = (imagePath) => {

  if (!imagePath) {
    return "/fallback-category.jpg";
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

export default function CategoryPage() {

  const { slug } =
    useParams();

  const router =
    useRouter();

  const { user } =
    useAuth();

  const {
    categories,
    fetchCategories,
  } = useCategory();

  const {
    products,
    fetchProductsByCategory,
    loading,
  } = useProduct();

  const {
    cart,
    addItem,
    updateItem,
    removeItem,
    totalItems,
  } = useCart();

  const [category, setCategory] =
    useState(null);

  const [addingId, setAddingId] =
    useState(null);

  // FETCH CATEGORIES
  useEffect(() => {

    fetchCategories();

  }, [fetchCategories]);

  // FETCH PRODUCTS
  useEffect(() => {

    if (
      !categories?.length ||
      !slug
    ) {
      return;
    }

    const match =
      categories.find(
        (c) =>
          toSlug(c.name) === slug
      );

    if (match) {

      setCategory(match);

      fetchProductsByCategory(
        match._id
      );
    }

  }, [
    categories,
    slug,
    fetchProductsByCategory,
  ]);

  // CART QUANTITY
  const cartQty = (
    productId
  ) => {

    const item =
      cart?.items?.find(
        (i) =>
          i.product?._id ===
          productId
      );

    return item?.quantity ?? 0;
  };

  // ADD TO CART
  const handleAddToCart =
    async (product) => {

      if (!user) {

        toast.error(
          "Please login to add items to cart"
        );

        router.push(
          "/customerLogin/login"
        );

        return;
      }

      setAddingId(product._id);

      try {

        await addItem(
          product._id,
          1
        );

        toast.success(
          `${product.name} added to cart!`
        );

      } catch (err) {

        toast.error(
          err?.response?.data?.message ||
          "Failed to add item"
        );

      } finally {

        setAddingId(null);
      }
    };

  // INCREASE QUANTITY
  const handleIncrease =
    async (product) => {

      try {

        const quantity =
          cartQty(product._id);

        await updateItem(
          product._id,
          quantity + 1
        );

      } catch (err) {

        toast.error(
          "Failed to update cart"
        );
      }
    };

  // DECREASE QUANTITY
  const handleDecrease =
    async (product) => {

      try {

        const quantity =
          cartQty(product._id);

        // REMOVE ITEM
        if (quantity <= 1) {

          await removeItem(
            product._id
          );

        } else {

          await updateItem(
            product._id,
            quantity - 1
          );
        }

      } catch (err) {

        toast.error(
          "Failed to update cart"
        );
      }
    };

  // LOADING
  if (!category && loading) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white shadow-md px-4 sm:px-6 py-4 flex justify-between items-center">

        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-brand-orange transition font-semibold text-sm sm:text-base"
        >
          <FaArrowLeft />
          Back
        </Link>

        <h1 className="text-lg sm:text-xl font-black text-brand-orange">
          {category?.name ||
            "Category"}
        </h1>

        {/* CART */}
        <Link
          href="/cart"
          className="relative"
        >

          <div className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-full font-semibold shadow text-sm">

            <FaShoppingCart />

            <span>
              {totalItems}
            </span>

          </div>
        </Link>
      </div>

      {/* HERO */}
      {category && (

        <div className="relative h-52 sm:h-64 md:h-80 w-full overflow-hidden">

          <img
            src={getImageUrl(
              category.image
            )}
            alt={category.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-6 left-4 sm:left-8">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
              {category.name}
            </h2>

          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {products.length === 0 ? (

          <div className="text-center py-16 text-gray-400">
            No products found
          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">

            {products.map(
              (product) => {

                const quantity =
                  cartQty(
                    product._id
                  );

                const isAdding =
                  addingId ===
                  product._id;

                return (

                  <div
                    key={product._id}
                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >

                    {/* IMAGE */}
                    <div className="relative h-48 sm:h-52 w-full shrink-0">

                      <Image
                        src={getImageUrl(
                          product.images?.[0]
                        )}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      {/* VEG */}
                      {product.isVeg && (

                        <div className="absolute top-3 left-3 bg-brand-green text-white text-xs px-3 py-1 rounded-full font-bold shadow flex items-center gap-1">

                          <FaLeaf size={9} />

                          Pure Veg

                        </div>
                      )}

                      {/* RATING */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur text-brand-green px-2 py-1 rounded-full text-xs font-bold shadow">

                        <FaStar size={9} />

                        {product.avgRating ||
                          "4.5"}

                      </div>
                    </div>

                    {/* INFO */}
                    <div className="p-4 flex flex-col flex-1">

                      <h4 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                        {product.name}
                      </h4>

                      <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 flex-1">
                        {product.description}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Stock:
                        {" "}
                        {product.stock ??
                          "Available"}
                      </p>

                      {/* PRICE */}
                      <div className="mt-4 flex items-center justify-between gap-2">

                        <p className="text-xl sm:text-2xl font-black text-brand-orange">
                          ₹{product.price}
                        </p>

                        {/* BUTTONS */}
                        {quantity > 0 ? (

                          <div className="flex items-center gap-2">

                            {/* MINUS */}
                            <button
                              onClick={() =>
                                handleDecrease(
                                  product
                                )
                              }
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                            >

                              <FaMinus size={10} />

                            </button>

                            {/* QTY */}
                            <span className="font-bold text-brand-green min-w-5 text-center">

                              {quantity}

                            </span>

                            {/* PLUS */}
                            <button
                              onClick={() =>
                                handleIncrease(
                                  product
                                )
                              }
                              className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-[#E65100] transition"
                            >

                              <FaPlus size={10} />

                            </button>

                          </div>

                        ) : (

                          <button
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                            disabled={
                              isAdding
                            }
                            className="flex items-center gap-2 bg-brand-orange hover:bg-[#E65100] text-white px-4 py-2 rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-70 whitespace-nowrap"
                          >

                            {isAdding ? (

                              <>
                                <FaShoppingCart className="animate-bounce" />
                                Adding...
                              </>

                            ) : (

                              <>
                                <FaShoppingCart />
                                Add
                              </>

                            )}

                          </button>

                        )}

                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* STICKY CART — handled globally by ViewCartBar in ClientLayout */}
    </div>
  );
}
