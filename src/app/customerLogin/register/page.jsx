"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";
import { useCustomer } from "../../../../hooks/useCustomer";
import { validateName, validateEmail, validateMobile, validatePassword } from "../../../../shared/validation";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { registerCustomer, loading, error } = useCustomer();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [validationErrors, setValidationErrors] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationErrors({ ...validationErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      name:     validateName(formData.name),
      email:    validateEmail(formData.email),
      password: validatePassword(formData.password),
      phone:    validateMobile(formData.phone),
    };
    setValidationErrors(errors);
    if (Object.values(errors).some(Boolean)) { toast.error("Please fix validation errors"); return; }
    try {
      await registerCustomer(formData);
      toast.success("Registration Successful");
      router.push("/customerLogin/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration Failed");
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-green-mid focus:border-brand-green transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-pale via-white to-brand-bg flex items-center justify-center px-4 py-10">

      {/* BG GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-green-mid/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#1B5E20] via-brand-green to-[#43A047] text-white p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md mb-6">
              🍲 Food Delivery
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Taste The <br /> Love Of <br /> Home Cooking
            </h1>
            <p className="text-lg text-white/80 leading-8 max-w-md">
              Fresh meals prepared with care by local chefs. Healthy, hygienic, and delivered straight to your doorstep.
            </p>
            <div className="mt-10 space-y-4">
              {[["🥘","Fresh Daily Meals"],["🚚","Fast Delivery"],["❤️","Healthy & Hygienic Food"]].map(([emoji, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">{emoji}</div>
                  <span className="text-lg">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                <div className="text-4xl mb-3">🥗</div>
                <h3 className="font-semibold text-lg">Healthy Meals</h3>
                <p className="text-sm text-white/70 mt-2 leading-6">Fresh vegetables and authentic recipes prepared daily.</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                <div className="text-4xl mb-3">🍱</div>
                <h3 className="font-semibold text-lg">Authentic Taste</h3>
                <p className="text-sm text-white/70 mt-2 leading-6">Enjoy authentic home-style food with traditional flavors.</p>
              </div>
            </div>
            <div className="mt-8 bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20">
              <p className="text-lg italic leading-8 text-white/80">"Good food is the foundation of genuine happiness."</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="p-8 md:p-12 bg-white">

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-green-pale text-brand-green px-5 py-2 rounded-full text-sm font-bold mb-5">
              <FaLeaf size={11} /> New Customer
            </div>
            <h2 className="text-4xl font-black text-gray-900 leading-tight">
              <span className="text-brand-green">Create</span> Account
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Join now and enjoy delicious food.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
              <input type="text" name="name" placeholder="Enter your full name"
                value={formData.name} onChange={handleChange} className={inputClass} />
              {validationErrors.name && <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
              <input type="email" name="email" placeholder="Enter your email"
                value={formData.email} onChange={handleChange} className={inputClass} />
              {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password"
                  value={formData.password} onChange={handleChange} className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
              <input type="text" name="phone" placeholder="Enter your phone number"
                value={formData.phone} onChange={handleChange} className={inputClass} />
              {validationErrors.phone && <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>}
            </div>

            {error && <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-green hover:bg-[#1B5E20] text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl transition duration-300">
              {loading ? "Creating Account..." : "Register Now"}
            </button>

          </form>

          <p className="text-center text-gray-600 mt-8">
            Already have an account?{" "}
            <Link href="/customerLogin/login" className="text-brand-green font-semibold hover:underline">Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
