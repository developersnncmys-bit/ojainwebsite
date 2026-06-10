"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  MdEdit, MdSave, MdCancel, MdPerson, MdEmail,
  MdPhone, MdStorefront, MdLocationCity,
  MdDescription, MdAccountBalance, MdLock,
  MdVerified, MdBadge, MdClose, MdCreditCard,
  MdCameraAlt,
} from "react-icons/md";
import { FaLeaf, FaSpinner, FaShieldAlt, FaCheck, FaCamera } from "react-icons/fa";
import { useVendor } from "../../../../hooks/useVendor";

/* ── image url helper ─────────────────────────────────── */
const getImageUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("/") || p.startsWith("blob:") || p.startsWith("http")) return p;
  return `/${p.replace(/\\/g, "/")}`;
};

const getInitial = (v) => {
  if (v?.fullName) return v.fullName.charAt(0).toUpperCase();
  if (v?.shopName)  return v.shopName.charAt(0).toUpperCase();
  return "V";
};

/* ── input styles ─────────────────────────────────────── */
const iBase  = "w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none border transition-all";
const iStyle = { background: "#F9FFF6", borderColor: "#C8E6C9", color: "#333" };
const iFocus = {
  onFocus: (e) => {
    e.currentTarget.style.borderColor = "#2E7D32";
    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(46,125,50,0.12)";
  },
  onBlur: (e) => {
    e.currentTarget.style.borderColor = "#C8E6C9";
    e.currentTarget.style.boxShadow   = "none";
  },
};

/* ── Field label wrapper ──────────────────────────────── */
function Field({ label, icon, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "#1B5E20" }}
      >
        {icon && <span style={{ color: "#66BB6A", fontSize: 14 }}>{icon}</span>}
        {label}
        {required && <span style={{ color: "#FF8F00" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: "#81C784" }}>{hint}</p>}
    </div>
  );
}

/* ── Read-only info row ───────────────────────────────── */
function InfoRow({ icon, label, value, masked }) {
  const show = masked && value ? "••••" + String(value).slice(-4) : value || "—";
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid #F0F9F0" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "#EBF5E9" }}>
        <span style={{ color: "#2E7D32", fontSize: 16 }}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#81C784" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: value ? "#1B5E20" : "#bbb", wordBreak: "break-word" }}>
          {show}
        </p>
      </div>
    </div>
  );
}

/* ── Section card ─────────────────────────────────────── */
function Section({ icon, title, accent = "#2E7D32", children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #C8E6C9", boxShadow: "0 2px 16px rgba(46,125,50,0.07)" }}>
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ background: "linear-gradient(90deg,rgba(46,125,50,0.07),rgba(46,125,50,0.02))", borderBottom: "1px solid #C8E6C9" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: accent }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
        </div>
        <h3 className="font-black text-sm" style={{ color: "#1B5E20" }}>{title}</h3>
      </div>
      <div className="bg-white p-5">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════ */
const FORM_ID = "vendor-profile-form";

const EMPTY = {
  fullName: "", email: "", phone: "",
  shopName: "", shopDescription: "", city: "",
  bankAccountNumber: "", ifscCode: "", accountHolderName: "",
};

export default function VendorProfilePage() {
  const { vendor, loading: vendorLoading, fetchVendorProfile, updateVendorProfile } = useVendor();

  const avatarInputRef = useRef(null);

  const [isEditing,     setIsEditing]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [activeTab,     setActiveTab]     = useState("personal");
  const [form,          setForm]          = useState(EMPTY);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  /* fetch on mount */
  useEffect(() => {
    if (!vendor && !vendorLoading) fetchVendorProfile();
  }, [vendor, vendorLoading, fetchVendorProfile]);

  /* sync form when vendor loads */
  useEffect(() => {
    if (vendor) {
      setForm({
        fullName:          vendor.fullName          || "",
        email:             vendor.email             || "",
        phone:             vendor.phone             || "",
        shopName:          vendor.shopName          || "",
        shopDescription:   vendor.shopDescription   || "",
        city:              vendor.city              || "",
        bankAccountNumber: vendor.bankAccountNumber || "",
        ifscCode:          vendor.ifscCode          || "",
        accountHolderName: vendor.accountHolderName || "",
      });
    }
  }, [vendor]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* avatar pick */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))    { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)        { toast.error("Image must be under 5 MB");    return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* cancel — restore original values */
  const cancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (vendor) {
      setForm({
        fullName:          vendor.fullName          || "",
        email:             vendor.email             || "",
        phone:             vendor.phone             || "",
        shopName:          vendor.shopName          || "",
        shopDescription:   vendor.shopDescription   || "",
        city:              vendor.city              || "",
        bankAccountNumber: vendor.bankAccountNumber || "",
        ifscCode:          vendor.ifscCode          || "",
        accountHolderName: vendor.accountHolderName || "",
      });
    }
  };

  /* submit — FormData so image file is included */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error("Full name is required");  return; }
    if (!form.email.trim())    { toast.error("Email is required");      return; }
    if (!form.shopName.trim()) { toast.error("Shop name is required");  return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append("profileImage", avatarFile);

      await updateVendorProfile(fd);
      toast.success("Profile updated successfully ✅");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      await fetchVendorProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading ── */
  if (vendorLoading && !vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "#EBF5E9" }}>
          <FaLeaf size={28} className="animate-pulse" style={{ color: "#2E7D32" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#66BB6A" }}>Loading your profile…</p>
      </div>
    );
  }

  /* ── error ── */
  if (!vendor && !vendorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)" }}>
          <MdCancel className="text-4xl" style={{ color: "#DC2626" }} />
        </div>
        <p className="font-bold" style={{ color: "#1B5E20" }}>Could not load profile</p>
        <button
          onClick={() => fetchVendorProfile()}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  const displayedAvatar = avatarPreview || (vendor?.profileImage ? getImageUrl(vendor.profileImage) : null);

  const tabs = [
    { key: "personal", label: "Personal",     icon: <MdPerson /> },
    { key: "shop",     label: "Shop",          icon: <MdStorefront /> },
    { key: "bank",     label: "Bank Details",  icon: <MdAccountBalance /> },
  ];

  /* ─────────────────────────────────────────────────────
     NOTE: The page root is a plain <div>, NOT a <form>.
     Only the edit inputs live inside the <form id={FORM_ID}>.
     The Save buttons use form={FORM_ID} to target that form.
     This prevents any accidental submission when clicking
     navigation buttons, tabs, or the Edit button.
  ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-10">

      {/* ════ Hero Banner ════ */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)",
          boxShadow: "0 8px 32px rgba(27,94,32,0.3)",
        }}
      >
        {/* blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,143,0,0.18) 0%,transparent 70%)", transform: "translate(35%,-35%)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)", transform: "translate(-30%,30%)" }} />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* ── Avatar ── */}
          <div className="relative shrink-0">
            {/* hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div
              className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-white text-4xl font-black shadow-xl relative"
              style={{ border: "3px solid rgba(255,255,255,0.25)" }}
            >
              {displayedAvatar ? (
                <Image src={displayedAvatar} alt="Profile" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#FF8F00,#FFB300)" }}>
                  {getInitial(vendor)}
                </div>
              )}
            </div>

            {/* camera button — edit mode only */}
            {isEditing && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1"
                style={{ background: "rgba(0,0,0,0.52)" }}
              >
                <FaCamera className="text-white text-xl" />
                <span className="text-white text-[10px] font-bold">Change</span>
              </button>
            )}

            {/* verified tick */}
            <div
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow"
              style={{ background: "#2E7D32" }}
            >
              <FaCheck size={9} style={{ color: "#fff" }} />
            </div>

            {/* "NEW" badge when new avatar staged */}
            {avatarPreview && (
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black text-white shadow"
                style={{ background: "#FF8F00" }}>
                NEW
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 flex-wrap justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {vendor?.fullName || "Vendor"}
              </h1>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full self-center"
                style={{ background: "rgba(255,143,0,0.22)", color: "#FFD54F", border: "1px solid rgba(255,143,0,0.4)" }}
              >
                <MdVerified size={11} /> Verified Vendor
              </span>
            </div>
            <p className="font-bold text-base" style={{ color: "#A5D6A7" }}>
              {vendor?.shopName || "—"}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2.5">
              {vendor?.city   && <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#C8E6C9" }}><MdLocationCity size={12}/> {vendor.city}</span>}
              {vendor?.email  && <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#C8E6C9" }}><MdEmail size={12}/> {vendor.email}</span>}
              {vendor?.phone  && <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#C8E6C9" }}><MdPhone size={12}/> {vendor.phone}</span>}
            </div>
          </div>

          {/* ── Hero action buttons ── */}
          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                {/* Save — targets the form by id, no wrapping <form> needed */}
                <button
                  type="submit"
                  form={FORM_ID}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#FF8F00,#FFB300)", color: "#fff", boxShadow: "0 3px 12px rgba(255,143,0,0.4)" }}
                >
                  {submitting ? <FaSpinner className="animate-spin" size={13}/> : <MdSave size={16}/>}
                  {submitting ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.25)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.15)")}
                >
                  <MdClose size={18}/>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.25)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.15)")}
              >
                <MdEdit size={16}/> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Edit-mode hint bar */}
        {isEditing && (
          <div className="relative z-10 px-6 sm:px-8 pb-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <MdCameraAlt size={14}/>
              Click the photo above to change your profile picture
            </div>
          </div>
        )}
      </div>

      {/* ════ Tab Bar ════ */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl"
        style={{ background: "#fff", border: "1px solid #C8E6C9" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm transition-all"
            style={
              activeTab === tab.key
                ? { background: "linear-gradient(135deg,#1B5E20,#2E7D32)", color: "#fff", boxShadow: "0 2px 10px rgba(27,94,32,0.3)" }
                : { color: "#66BB6A" }
            }
            onMouseEnter={e=>{ if(activeTab!==tab.key) e.currentTarget.style.background="#EBF5E9"; }}
            onMouseLeave={e=>{ if(activeTab!==tab.key) e.currentTarget.style.background="transparent"; }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ════ Tab Panels ════
           The actual <form> is here, ONLY wrapping the edit inputs.
           id={FORM_ID} links it to the Save buttons via form={FORM_ID}.
      ════ */}

      <form id={FORM_ID} onSubmit={handleSubmit}>

        {/* ── Personal ── */}
        {activeTab === "personal" && (
          <Section icon={<MdPerson/>} title="Personal Information">
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon={<MdPerson/>} required>
                  <input name="fullName" type="text" value={form.fullName} onChange={handleChange}
                    required placeholder="Your full name"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
                <Field label="Email Address" icon={<MdEmail/>} required>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    required placeholder="you@example.com"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
                <Field label="Phone Number" icon={<MdPhone/>} required>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                    required placeholder="+91 98765 43210"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
                <Field label="City" icon={<MdLocationCity/>} required>
                  <input name="city" type="text" value={form.city} onChange={handleChange}
                    required placeholder="Mumbai, Delhi…"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
              </div>
            ) : (
              <>
                <InfoRow icon={<MdPerson/>}      label="Full Name"  value={form.fullName}/>
                <InfoRow icon={<MdEmail/>}        label="Email"      value={form.email}/>
                <InfoRow icon={<MdPhone/>}        label="Phone"      value={form.phone}/>
                <InfoRow icon={<MdLocationCity/>} label="City"       value={form.city}/>
              </>
            )}
          </Section>
        )}

        {/* ── Shop ── */}
        {activeTab === "shop" && (
          <Section icon={<MdStorefront/>} title="Shop Information" accent="#FF8F00">
            {isEditing ? (
              <div className="space-y-4">
                <Field label="Shop Name" icon={<MdStorefront/>} required>
                  <input name="shopName" type="text" value={form.shopName} onChange={handleChange}
                    required placeholder="Your shop / brand name"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
                <Field label="Shop Description" icon={<MdDescription/>}
                  hint="Tell customers about your specialties, cuisine, and story">
                  <textarea name="shopDescription" value={form.shopDescription} onChange={handleChange}
                    rows={4} placeholder="Describe your shop, specialties, cuisine style…"
                    className={`${iBase} resize-none leading-6`} style={iStyle} {...iFocus}/>
                </Field>
              </div>
            ) : (
              <>
                <InfoRow icon={<MdStorefront/>}  label="Shop Name"   value={form.shopName}/>
                <InfoRow icon={<MdDescription/>} label="Description" value={form.shopDescription}/>

                {/* stats strip */}
                <div className="mt-5 grid grid-cols-3 gap-3 p-4 rounded-xl"
                  style={{ background: "#F9FFF6", border: "1px solid #C8E6C9" }}>
                  {[
                    { label: "Status",  value: vendor?.isApproved ? "Approved" : "Pending", color: vendor?.isApproved ? "#2E7D32" : "#FF8F00" },
                    { label: "Account", value: vendor?.isActive   ? "Active"   : "Inactive", color: vendor?.isActive ? "#2E7D32" : "#888" },
                    { label: "Since",   value: vendor?.createdAt  ? new Date(vendor.createdAt).getFullYear() : "—", color: "#1B5E20" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="font-black text-sm" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: "#81C784" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        {/* ── Bank ── */}
        {activeTab === "bank" && (
          <Section icon={<MdAccountBalance/>} title="Bank Details" accent="#1565C0">
            <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
              style={{ background: "rgba(21,101,192,0.06)", border: "1px solid rgba(21,101,192,0.18)" }}>
              <FaShieldAlt size={16} style={{ color: "#1565C0", marginTop: 2, flexShrink: 0 }}/>
              <p className="text-xs leading-relaxed" style={{ color: "#1565C0" }}>
                Your bank details are encrypted and used only for payment processing.
                They are never shared with third parties.
              </p>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Account Holder Name" icon={<MdBadge/>}>
                  <input name="accountHolderName" type="text" value={form.accountHolderName}
                    onChange={handleChange} placeholder="Name as on bank account"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
                <Field label="Bank Account Number" icon={<MdCreditCard/>}>
                  <input name="bankAccountNumber" type="text" value={form.bankAccountNumber}
                    onChange={handleChange} placeholder="XXXX XXXX XXXX XXXX"
                    className={iBase} style={iStyle} {...iFocus}/>
                </Field>
                <Field label="IFSC Code" icon={<MdAccountBalance/>} hint="e.g. SBIN0001234">
                  <input name="ifscCode" type="text" value={form.ifscCode}
                    onChange={handleChange} placeholder="SBIN0001234"
                    className={`${iBase} uppercase`} style={iStyle} {...iFocus}/>
                </Field>
              </div>
            ) : (
              <>
                <InfoRow icon={<MdBadge/>}         label="Account Holder" value={form.accountHolderName}/>
                <InfoRow icon={<MdCreditCard/>}    label="Account Number" value={form.bankAccountNumber} masked/>
                <InfoRow icon={<MdAccountBalance/>} label="IFSC Code"     value={form.ifscCode}/>

                {form.bankAccountNumber && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
                    style={{ background: "#EBF5E9", color: "#2E7D32" }}>
                    <MdLock size={14}/>
                    Account number is partially masked. Click Edit Profile to view or update.
                  </div>
                )}
              </>
            )}
          </Section>
        )}

      </form>{/* ← end of the only <form> on this page */}

      {/* ════ Sticky Save Bar — edit mode only ════ */}
      {isEditing && (
        <div
          className="sticky bottom-4 z-20 flex items-center justify-between gap-3 px-5 py-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #C8E6C9",
            boxShadow: "0 8px 32px rgba(46,125,50,0.18)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0" style={{ background: "#FF8F00" }}/>
            <div>
              <p className="text-sm font-black leading-none" style={{ color: "#1B5E20" }}>Unsaved changes</p>
              {avatarFile && (
                <p className="text-[10px] mt-0.5" style={{ color: "#66BB6A" }}>
                  New photo: {avatarFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm border transition-all"
              style={{ background: "#F9FFF6", color: "#2E7D32", borderColor: "#C8E6C9" }}
              onMouseEnter={e=>(e.currentTarget.style.background="#EBF5E9")}
              onMouseLeave={e=>(e.currentTarget.style.background="#F9FFF6")}
            >
              <MdCancel size={15}/> Discard
            </button>

            {/* targets the form by id */}
            <button
              type="submit"
              form={FORM_ID}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32)", boxShadow: "0 3px 12px rgba(27,94,32,0.35)" }}
            >
              {submitting
                ? <><FaSpinner className="animate-spin" size={12}/> Saving…</>
                : <><MdSave size={15}/> Save Changes</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
