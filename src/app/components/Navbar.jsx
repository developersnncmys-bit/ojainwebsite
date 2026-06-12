"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaShoppingCart, FaMapMarkerAlt, FaUserCircle,
  FaBars, FaTimes, FaSpinner, FaChevronDown, FaSignOutAlt,
} from "react-icons/fa";
import useCartStore from "../../../store/cartStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { useAuth } from "../../contexts/AuthContext";
import getImageUrl from "../../../utils/getImageUrl";

const toSlug = (name) => name?.toLowerCase().replace(/\s+/g, "-") ?? "";

const fetchLocationSuggestions = async (query) => {
  if (!query.trim() || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8`
    );
    const data = await res.json();
    return data.map((item) => ({
      displayName: item.display_name.split(",")[0],
      fullName: item.display_name,
    }));
  } catch {
    return [];
  }
};

function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [location, setLocation] = useState("Set location");
  const [locOpen, setLocOpen] = useState(false);
  const [locQuery, setLocQuery] = useState("");
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [locSearching, setLocSearching] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  const locRef = useRef(null);
  const userRef = useRef(null);
  // const loginRef = useRef(null);

  const totalItems = useCartStore((s) => s.totalItems());
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) setLocation(saved);
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const name =
            data.address.city || data.address.town || data.address.state || "Current Location";
          setLocation(name);
          localStorage.setItem("userLocation", name);
          setLocOpen(false);
        } catch { }
      },
      () => { }
    );
  };

  useEffect(() => {
    const id = setTimeout(async () => {
      if (locQuery.length >= 2) {
        setLocSearching(true);
        const results = await fetchLocationSuggestions(locQuery);
        setLocSuggestions(results);
        setLocSearching(false);
      } else {
        setLocSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [locQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (locRef.current && !locRef.current.contains(e.target)) setLocOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
      // if (loginRef.current && !loginRef.current.contains(e.target)) setLoginMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-brand-green text-white text-[11px] py-2 text-center font-semibold tracking-widest uppercase">
        🌿 Be O-Jain. Live O-Jain. &nbsp;·&nbsp; Pure Jain &amp; Satvik Premix Products &nbsp;·&nbsp; A Brand That Serves Pure 👑
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-10">

          {/* ── TOP ROW ── */}
          <div className="flex items-center h-16 md:h-[72px] gap-3 md:gap-5">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="/logo.png"
                alt="OJAIN"
                className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover ring-2 ring-brand-green/25 group-hover:ring-brand-green/50 transition"
              />
              <div className="hidden sm:block leading-none">
                <p className="text-[17px] font-black text-brand-green tracking-tight">OJAIN</p>
                <p className="text-[9px] font-bold text-brand-orange tracking-[0.18em] uppercase mt-0.5">Pure Veg</p>
              </div>
            </Link>

            {/* LOCATION — desktop */}
            <div className="hidden lg:block relative shrink-0" ref={locRef}>
              <button
                onClick={() => setLocOpen(!locOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition group"
              >
                <FaMapMarkerAlt className="text-brand-orange shrink-0" size={14} />
                <div className="text-left">
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">
                    Delivering to
                  </p>
                  <p className="text-[13px] font-bold text-gray-800 max-w-[110px] truncate group-hover:text-brand-green transition leading-none">
                    {location}
                  </p>
                </div>
                <FaChevronDown
                  size={9}
                  className={`text-gray-400 transition-transform ${locOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Location dropdown */}
              {locOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <FaSearch size={11} className="text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={locQuery}
                        onChange={(e) => setLocQuery(e.target.value)}
                        placeholder="Search city or area..."
                        className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    onClick={detectLocation}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-green-pale transition border-b border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-green-pale flex items-center justify-center shrink-0">
                      <FaMapMarkerAlt className="text-brand-green" size={13} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-brand-green">Use current location</p>
                      <p className="text-xs text-gray-400">Detect via GPS</p>
                    </div>
                  </button>
                  <div className="max-h-52 overflow-y-auto">
                    {locSearching ? (
                      <div className="px-4 py-4 flex items-center gap-2 text-sm text-gray-400">
                        <FaSpinner className="animate-spin text-brand-green" /> Searching...
                      </div>
                    ) : locSuggestions.length > 0 ? (
                      locSuggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setLocation(s.displayName);
                            localStorage.setItem("userLocation", s.displayName);
                            setLocQuery("");
                            setLocOpen(false);
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                        >
                          <FaMapMarkerAlt className="text-gray-300 mt-0.5 shrink-0" size={12} />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{s.displayName}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[220px]">{s.fullName}</p>
                          </div>
                        </button>
                      ))
                    ) : locQuery.length >= 2 ? (
                      <p className="px-4 py-4 text-sm text-gray-400">No locations found</p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* SEARCH BAR — desktop */}
            <div className="hidden md:flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-11 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/15 transition-all">
              <FaSearch className="ml-4 text-gray-400 shrink-0" size={13} />
              <input
                type="text"
                placeholder="Search for biryani, thali, sweets..."
                className="flex-1 px-3 py-0 h-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
              />
              <button className="h-full bg-brand-green hover:bg-[#1B5E20] text-white px-5 text-[13px] font-bold transition-colors whitespace-nowrap">
                Search
              </button>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0 shrink-0">

              {/* About — desktop */}
              <Link
                href="/about"
                className="hidden lg:flex items-center gap-2 bg-brand-green-pale hover:bg-brand-green text-brand-green hover:text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 border border-brand-green/20 hover:border-brand-green group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">🍲</span>
                About Us
              </Link>

              {/* USER / LOGIN */}
              <div className="relative hidden md:block" ref={userRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-brand-green-pale hover:bg-brand-green/15 text-brand-green px-3 py-2 rounded-xl transition"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center text-[12px] font-black shrink-0">
                        {(user.name || "U")[0].toUpperCase()}
                      </div>
                      <span className="text-[13px] font-bold max-w-[90px] truncate">
                        {user.name?.split(" ")[0] || "Account"}
                      </span>
                      <FaChevronDown size={11} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-3 bg-brand-green-pale">
                          <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setUserMenuOpen(false); router.push("/cart"); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          🛒 My Cart
                        </button>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); router.push("/"); }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <FaSignOutAlt size={13} /> Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/customerLogin/login"
                    className="flex items-center gap-2 bg-brand-green hover:bg-[#1B5E20] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold transition shadow-sm"
                  >
                    <FaUserCircle size={14} />
                    Login
                  </Link>
                )}
              </div>
              {/* CART */}
              <button
                onClick={() => router.push("/cart")}
                className="relative flex items-center gap-2 bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange px-3 py-2.5 rounded-xl transition"
                aria-label="View cart"
              >
                <FaShoppingCart size={16} />
                {mounted && totalItems > 0 && (
                  <span className="text-[12px] font-black leading-none">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              {/* MOBILE TOGGLE */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
              </button>
            </div>
          </div>

          {/* ── DESKTOP CATEGORY STRIP ── */}
          <div className="hidden md:block border-t border-gray-100 py-1.5 overflow-hidden relative">

            {/* Skeleton while loading */}
            {categories.length === 0 && (
              <div className="flex items-center gap-4 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-7 w-20 rounded-full bg-gray-100 animate-pulse shrink-0" />
                ))}
              </div>
            )}

            {/* Marquee — duplicated for seamless loop */}
            {categories.length > 0 && (
              <div className="animate-marquee flex items-center gap-2 w-max">
                {[...categories, ...categories].map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/category/${toSlug(cat.name)}`}
                    tabIndex={idx >= categories.length ? -1 : 0}
                    aria-hidden={idx >= categories.length}
                    className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-gray-500 hover:text-brand-green hover:bg-brand-green-pale transition whitespace-nowrap shrink-0"
                  >
                    {cat.image ? (
                      <img
                        src={getImageUrl(cat.image)}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="text-base">🍽</span>
                    )}
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE SEARCH ── */}
        <div className="md:hidden px-4 pb-2 border-t border-gray-100 pt-2">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-10">
            <FaSearch className="ml-3 text-gray-400 shrink-0" size={12} />
            <input
              type="text"
              placeholder="Search food..."
              className="flex-1 px-3 h-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
        </div>

        {/* ── MOBILE CATEGORY STRIP ── */}
        <div className="md:hidden overflow-hidden pb-3 border-t border-gray-100 pt-2">
          {/* Skeleton */}
          {categories.length === 0 && (
            <div className="flex items-center gap-4 px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                  <div className="h-2 w-10 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Marquee — duplicated for seamless loop */}
          {categories.length > 0 && (
            <div className="animate-marquee-mobile flex items-center gap-4 w-max px-4">
              {[...categories, ...categories].map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/category/${toSlug(cat.name)}`}
                  tabIndex={idx >= categories.length ? -1 : 0}
                  aria-hidden={idx >= categories.length}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    {cat.image ? (
                      <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-green-pale flex items-center justify-center text-xl">🍽</div>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 max-w-14 truncate text-center">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── MOBILE MENU PANEL ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-xl animate-fade-up">
            <div className="px-4 py-4 space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                Account
              </p>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-brand-green-pale rounded-2xl">
                    <div className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center font-black text-sm shrink-0">
                      {(user.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-[14px] font-semibold text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <FaSignOutAlt size={14} /> Sign Out
                  </button>
                </>
              ) : (
                [
                  { href: "/customerLogin/login", label: "👤 Customer Login" },
                  { href: "/adminlogin", label: "🔐 Admin Login" },
                  { href: "/vendorLogin/login", label: "🏪 Vendor Login" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-3 text-[14px] font-semibold text-gray-700 hover:text-brand-green hover:bg-brand-green-pale rounded-xl transition"
                  >
                    {label}
                  </Link>
                ))
              )}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-linear-to-r from-brand-green-pale to-white border border-brand-green/15 hover:border-brand-green/40 hover:bg-brand-green-pale transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center text-white text-base shrink-0 group-hover:scale-110 transition-transform">
                    🍲
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-800 group-hover:text-brand-green transition">About OJAIN</p>
                    <p className="text-[10px] text-gray-400 font-medium">Our story, mission & values</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;
