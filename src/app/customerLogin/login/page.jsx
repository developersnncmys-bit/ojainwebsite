"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaPhoneAlt, FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";
import { useCustomer } from "../../../../hooks/useCustomer";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { loginCustomer, loading, error } = useCustomer();

  const [loginType, setLoginType] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", mobile: "", password: "", otp: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = () => {
    if (!formData.mobile) { toast.error("Enter mobile number"); return; }
    toast.success("OTP Sent Successfully");
    setOtpSent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = loginType === "email"
        ? { email: formData.email, password: formData.password }
        : { mobile: formData.mobile, otp: formData.otp };
      const res = await loginCustomer(payload);

      // Backend returns { success, token, customer }. A successful response
      // (the store didn't throw) means the customer is authenticated.
      const account = res?.customer || res?.user;
      if (res?.token || account) {
        toast.success("Login Successful");
        router.push("/");
      } else {
        toast.error("Login failed — please try again");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-pale via-white to-brand-bg flex items-center justify-center px-4 py-10 overflow-hidden relative">

      {/* BG GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-green-mid/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">

        {/* ── LEFT PANEL — green gradient ── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#1B5E20] via-brand-green to-[#43A047] text-white p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md mb-6">
              🍲 Food Platform
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Welcome <br /> Back To <br /> Home Taste
            </h1>
            <p className="text-lg text-white/80 leading-8 max-w-md">
              Login to explore healthy meals prepared with love by trusted chefs near you.
            </p>
            <div className="mt-10 space-y-4">
              {[["🥘", "Fresh Daily Meals"], ["🚚", "Fast & Safe Delivery"], ["❤️", "Healthy & Fresh Food"]].map(([emoji, label]) => (
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
                <p className="text-sm text-white/70 mt-2 leading-6">Nutritious authentic recipes made fresh every day.</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                <div className="text-4xl mb-3">🍱</div>
                <h3 className="font-semibold text-lg">Authentic Taste</h3>
                <p className="text-sm text-white/70 mt-2 leading-6">Enjoy real home-cooked meals with traditional flavors.</p>
              </div>
            </div>
            <div className="mt-8 bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20">
              <p className="text-lg italic leading-8 text-white/80">"Good food brings comfort to every heart."</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-green-pale text-brand-green px-5 py-2 rounded-full text-sm font-bold mb-5">
              <FaLeaf size={11} /> Customer Access
            </div>
            <h2 className="text-4xl font-black text-gray-900 leading-tight">
              <span className="text-brand-green">Login</span>{" "}To Continue
            </h2>
            <p className="text-gray-500 mt-3 text-lg">Continue your food journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* TABS */}
            <div className="grid grid-cols-2 bg-brand-green-pale p-1 rounded-2xl">
              {[["email", "Email Login"], ["mobile", "Mobile Login"]].map(([type, label]) => (
                <button key={type} type="button" onClick={() => setLoginType(type)}
                  className={`h-12 rounded-xl font-semibold transition ${loginType === type ? "bg-brand-green text-white shadow-lg" : "text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* EMAIL LOGIN */}
            {loginType === "email" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-green" />
                    <input type="email" name="email" placeholder="Enter your email"
                      value={formData.email} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-2xl pl-14 pr-4 py-4 outline-none focus:ring-2 focus:ring-brand-green-mid focus:border-brand-green transition" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-green" />
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password"
                      value={formData.password} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-2xl pl-14 pr-12 py-4 outline-none focus:ring-2 focus:ring-brand-green-mid focus:border-brand-green transition" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* MOBILE LOGIN */}
            {loginType === "mobile" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Mobile Number</label>
                  <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-green-mid focus-within:border-brand-green">
                    <div className="px-5 py-4 bg-brand-green-pale text-gray-700 font-semibold border-r border-gray-200">+91</div>
                    <div className="relative flex-1">
                      <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green text-sm" />
                      <input type="tel" name="mobile" placeholder="Enter mobile number"
                        value={formData.mobile} onChange={handleChange} required
                        className="w-full pl-12 pr-4 py-4 outline-none" />
                    </div>
                  </div>
                </div>
                {!otpSent && (
                  <button type="button" onClick={handleSendOtp}
                    className="w-full h-12 rounded-2xl bg-brand-green-pale text-brand-green font-bold hover:bg-brand-green hover:text-white transition">
                    Send OTP
                  </button>
                )}
                {otpSent && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Enter OTP</label>
                    <input type="text" name="otp" placeholder="Enter 6 digit OTP"
                      value={formData.otp} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-brand-green-mid focus:border-brand-green transition tracking-[8px] text-center text-xl font-bold" />
                  </div>
                )}
              </>
            )}

            {loginType === "email" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-brand-green hover:underline">Forgot Password?</button>
              </div>
            )}

            {error && <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-green hover:bg-[#1B5E20] text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl transition duration-300">
              {loading ? "Logging in..." : loginType === "mobile" ? "Verify & Login" : "Login Now"}
            </button>

          </form>

          <p className="text-center text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/customerLogin/register" className="text-brand-green font-semibold hover:underline">Create Account</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
