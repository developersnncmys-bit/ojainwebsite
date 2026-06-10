"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaTrash, FaMapMarkerAlt, FaCheckCircle, FaLeaf, FaArrowLeft, FaPlus, FaMinus, FaMotorcycle, FaCreditCard, FaMoneyBillWave, FaLock } from "react-icons/fa";
import { addressAPI, orderAPI } from "../../../services/api";
import getImageUrl from "../../../utils/getImageUrl";

const STEPS = ["🛒 Cart", "📍 Address", "💳 Payment"];
const EMPTY_ADDR = { label: "Home", fullName: "", street: "", landmark: "", city: "", state: "", zipCode: "", phone: "", isDefault: false };

export default function CartPage() {
  const { cart, updateItem, removeItem, totalItems, totalPrice, fetchCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState(EMPTY_ADDR);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const deliveryCharge = totalPrice >= 199 ? 0 : 40;
  const finalTotal = totalPrice + deliveryCharge;


  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push("/customerLogin/login");
  }, [user, router]);

  // Always sync cart from server on mount
  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  // Load addresses when entering step 2
  useEffect(() => {
    if (step === 2 && user) loadAddresses();
  }, [step, user]);
  useEffect(() => {
    if (user) {
      setNewAddress((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const { data } = await addressAPI.getAll();
      const list = data.addresses || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def._id);
      // Auto-open form if no addresses yet
      if (list.length === 0) setShowAddressForm(true);
    } catch { /* silent */ }
    finally { setAddrLoading(false); }
  };
  const detectCurrentAddress = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );

          const data = await res.json();

          setNewAddress({
            label: "Home",
            fullName: user?.name || "",
            phone: user?.phone || "",
            street: data.address?.road || "",
            landmark: "",
            city: data.address?.city || data.address?.town || "",
            state: data.address?.state || "",
            zipCode: data.address?.postcode || "",
            isDefault: true,
          });

          setShowAddressForm(true);
        } catch {
          alert("Unable to fetch address");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        alert("Location permission denied");
      }
    );
  };
  const handleSaveAddress = async () => {
    try {
      const { data } = await addressAPI.create(newAddress);
      const saved = data.address;
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved._id);
      setShowAddressForm(false);
      setNewAddress(EMPTY_ADDR);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await addressAPI.remove(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (selectedAddressId === id) setSelectedAddressId("");
    } catch { alert("Failed to delete address"); }
  };

  // ── COD flow ──────────────────────────────────────────────────────────────
  const placeCODOrder = async () => {
    setLoading(true);
    try {
      await orderAPI.create({ addressId: selectedAddressId, paymentMethod: "COD" });
      await fetchCart();
      router.push("/order-confirmation");
    } catch (err) {
      alert(err?.response?.data?.message || "Order failed. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Online payment flow ─────────────────────────────────────────────────────
  // No payment backend in this UI-only build — simulate a successful online payment.
  const placeRazorpayOrder = async () => {
    setLoading(true);
    try {
      await orderAPI.create({
        addressId: selectedAddressId,
        paymentMethod: "Razorpay",
        paymentId: `mock_pay_${Date.now()}`,
      });
      await fetchCart();
      router.push("/order-confirmation");
    } catch (err) {
      alert(err?.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Master handler ─────────────────────────────────────────────────────────
  const placeOrder = () => {
    if (!selectedAddressId) { alert("Please select a delivery address"); return; }
    if (paymentMethod === "COD") return placeCODOrder();
    if (paymentMethod === "Razorpay") return placeRazorpayOrder();
  };

  // ── EMPTY CART ──
  if (cart.items.length === 0 && step === 1) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="text-7xl">🛒</div>
        <h2 className="text-2xl font-black text-gray-800">Your cart is empty</h2>
        <p className="text-gray-400">Add some delicious food first!</p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-brand-orange hover:bg-[#E65100] text-white px-8 py-3 rounded-full font-bold shadow transition"
        >
          <FaArrowLeft /> Browse Categories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 font-semibold text-sm">
          🚚 Free Delivery on Orders Above ₹199
        </div>

        {/* ── PAGE TITLE ── */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-brand-green transition">
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-black text-gray-800">Checkout</h1>
        </div>

        {/* ── STEP INDICATOR ── */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
              <div key={label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all
                    ${done ? "bg-brand-green text-white" :
                      active ? "bg-brand-orange text-white shadow-lg scale-110" :
                        "bg-gray-200 text-gray-400"}`}>
                    {done ? "✓" : idx}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${active ? "text-brand-orange" : done ? "text-brand-green" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full transition-all ${done ? "bg-brand-green" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ══════════════ STEP 1 — CART ITEMS ══════════════ */}
        {step === 1 && (
          <div>
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden">
                    <Image
                      src={getImageUrl(item.product.images?.[0])}
                      alt={item.product.name}
                      fill className="object-cover" unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.product.name}</p>
                    <p className="text-brand-orange font-black text-lg">₹{item.product.price}</p>
                    {item.product.isVeg && (
                      <span className="inline-flex items-center gap-1 text-brand-green text-xs font-semibold mt-0.5">
                        <FaLeaf size={9} /> Pure Veg
                      </span>
                    )}
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateItem(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="font-black w-5 text-center text-brand-green">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.product._id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-[#E65100] transition"
                    >
                      <FaPlus size={10} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition ml-1"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
              <h3 className="font-bold text-gray-700 mb-3">Order Summary</h3>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Items ({totalItems})</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Delivery</span>

                {deliveryCharge === 0 ? (
                  <span className="text-brand-green font-semibold">FREE</span>
                ) : (
                  <span className="text-red-500 font-semibold">₹{deliveryCharge}</span>
                )}
              </div>

              <div className="mb-3 text-xs">
                {totalPrice < 199 ? (
                  <span className="text-orange-500">
                    Add ₹{199 - totalPrice} more for FREE Delivery 🚚
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold">
                    🎉 You got FREE Delivery
                  </span>
                )}
              </div>
              <div className="border-t pt-3 flex justify-between font-black text-xl text-gray-800">
                <span>Total</span>
                {/* <span className="text-brand-orange">₹{totalPrice}</span> */}
                <span className="text-brand-orange">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-brand-green hover:bg-[#1B5E20] text-white py-4 rounded-2xl font-black text-lg shadow-lg transition flex items-center justify-center gap-2"
            >
              <FaMapMarkerAlt /> Proceed to Address →
            </button>
          </div>
        )}

        {/* ══════════════ STEP 2 — ADDRESS ══════════════ */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
              <FaMapMarkerAlt className="text-brand-orange" /> Delivery Address
            </h2>

            {addrLoading ? (
              <div className="text-center py-10 text-gray-400">Loading addresses…</div>
            ) : (
              <>
                {addresses.length === 0 && !showAddressForm && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-5">
                    <p className="text-gray-600 font-semibold mb-3">No saved addresses yet.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-brand-orange text-white px-6 py-2 rounded-full font-bold"
                    >
                      + Add Delivery Address
                    </button>
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${selectedAddressId === addr._id
                        ? "border-brand-green bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr._id ? "border-brand-green bg-brand-green" : "border-gray-300"
                              }`}>
                              {selectedAddressId === addr._id && <span className="w-2 h-2 rounded-full bg-white block" />}
                            </span>
                            <span className="font-bold text-gray-800">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FaCheckCircle size={9} /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-700 ml-7">{addr.fullName}</p>
                          <p className="text-sm text-gray-500 ml-7 mt-0.5">
                            {addr.street}{addr.landmark ? `, ${addr.landmark}` : ""}, {addr.city}, {addr.state} – {addr.zipCode}
                          </p>
                          <p className="text-sm text-gray-500 ml-7">📞 {addr.phone}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                          className="text-red-400 hover:text-red-600 transition ml-3 mt-1"
                        >
                          <FaTrash size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD ADDRESS FORM */}
                {showAddressForm ? (

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
                    <h3 className="font-bold text-gray-800 mb-4">Add New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={detectCurrentAddress}
                        className="w-full mb-4 bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-[#1B5E20]"
                      >
                        📍 {detectingLocation ? "Detecting..." : "Use Current Location"}
                      </button>
                      <select
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="col-span-2 border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green"
                      >
                        <option value="Home">🏠 Home</option>
                        <option value="Work">💼 Work</option>
                        <option value="Other">📍 Other</option>
                      </select>
                      <input placeholder="Full Name *" value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="col-span-2 border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                      <input placeholder="Street / Area *" value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="col-span-2 border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                      <input placeholder="Landmark" value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        className="col-span-2 border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                      <input placeholder="City *" value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                      <input placeholder="State *" value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                      <input placeholder="Pin Code *" value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                      <input placeholder="Phone *" value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:border-brand-green" />
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                      <input type="checkbox" checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="accent-brand-green" />
                      <span className="text-sm text-gray-600">Set as default address</span>
                    </label>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSaveAddress}
                        className="flex-1 bg-brand-green text-white py-3 rounded-xl font-bold hover:bg-[#1B5E20] transition">
                        Save Address
                      </button>
                      <button onClick={() => setShowAddressForm(false)}
                        className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                        Cancel
                      </button>
                    </div>
                  </div>

                ) : (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-brand-green text-gray-500 hover:text-brand-green py-3 rounded-2xl font-semibold transition mb-5 flex items-center justify-center gap-2"
                  >
                    + Add New Address
                  </button>
                )}
              </>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-4 rounded-2xl font-bold transition">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedAddressId}
                className={`flex-1 py-4 rounded-2xl font-bold transition ${selectedAddressId
                  ? "bg-brand-green text-white hover:bg-[#1B5E20] shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 3 — PAYMENT ══════════════ */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
              <FaCreditCard className="text-brand-orange" /> Payment Method
            </h2>

            <div className="space-y-4 mb-8">
              {[
                {
                  value: "COD",
                  icon: <FaMoneyBillWave className="text-brand-green text-xl" />,
                  label: "Cash on Delivery",
                  desc: "Pay with cash when your order arrives",
                  badge: null,
                },
                {
                  value: "Razorpay",
                  icon: <FaCreditCard className="text-blue-500 text-xl" />,
                  label: "Pay Online",
                  desc: "UPI · Cards · Net Banking · Wallets — powered by Razorpay",
                  badge: (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <FaLock size={8} /> Secure
                    </span>
                  ),
                },
              ].map(({ value, icon, label, desc, badge }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === value ? "border-brand-green bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <input type="radio" value={value} checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)} className="sr-only" />
                  {icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">{label}</p>
                      {badge}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === value ? "border-brand-green bg-brand-green" : "border-gray-300"
                    }`}>
                    {paymentMethod === value && <span className="w-2 h-2 rounded-full bg-white block" />}
                  </div>
                </label>
              ))}
            </div>

            {/* Order recap */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
              <div className="flex justify-between text-gray-500 text-sm mb-1">
                <span>Total ({totalItems} item{totalItems > 1 ? "s" : ""})</span>
                <span className="font-black text-brand-orange text-lg">₹{totalPrice}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-green text-sm font-semibold mt-2">
                {/* <FaMotorcycle /> Free delivery included */}
                {deliveryCharge === 0 ? (
                  <span className="flex items-center gap-2 text-brand-green">
                    <FaMotorcycle /> Free delivery included 🎉
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-500">
                    <FaMotorcycle /> Delivery Charge ₹{deliveryCharge}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-4 rounded-2xl font-bold transition">
                ← Back
              </button>
              <button
                onClick={placeOrder}
                disabled={loading}
                className={`flex-1 disabled:opacity-70 text-white py-4 rounded-2xl font-black text-lg shadow-lg transition flex items-center justify-center gap-2 ${paymentMethod === "Razorpay"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-brand-orange hover:bg-[#E65100]"
                  }`}
              >
                {loading
                  ? "Please wait…"
                  : paymentMethod === "Razorpay"
                    ? <><FaLock size={14} /> Pay ₹{finalTotal} Online</>
                    : "🎉 Place Order"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}