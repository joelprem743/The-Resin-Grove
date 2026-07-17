import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../context/ShopContext";
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle,
  Truck,
  Flame,
  Mail,
  AlertTriangle,
  UploadCloud,
  Loader2
} from "lucide-react";
import { uploadCustomPhoto, isSupabaseConfigured } from "../lib/supabase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "joelpremtej@gmail.com";
const STUDIO_UPI_ID = import.meta.env.VITE_STUDIO_UPI_ID || "6305472006@axl";

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    user,
    setAccountOpen,
    showToast,
    attachCustomPhoto
  } = useShop();

  const [checkoutStep, setCheckoutStep] = useState<"idle" | "billing" | "processing" | "success" | "error">("idle");
  const [checkoutError, setCheckoutError] = useState<string>("");
  const [shippingDetails, setShippingDetails] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "", 
    zip: "" 
  });
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [createdOrderPreviewUrl, setCreatedOrderPreviewUrl] = useState<string>("");
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);

  // Prefill shipping details automatically if the user is logged in
  useEffect(() => {
    if (user) {
      setShippingDetails(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  // Key generator helper for item options
  const getConfigKey = (
    wood?: string,
    color?: string,
    deco?: string[],
    text?: string
  ) => {
    const dStr = deco ? [...deco].sort().join(",") : "";
    return `${wood || "none"}-${color || "none"}-${dStr}-${text || "none"}`;
  };

  // Compute Subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  // Compute Total Savings
  const totalSavings = useMemo(() => {
    return cart.reduce((acc, item) => {
      if (item.product.originalPrice) {
        return acc + (item.product.originalPrice - item.product.price) * item.quantity;
      }
      return acc;
    }, 0);
  }, [cart]);

  // Compute Shipping
  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal > 100 ? 0 : 9.95; // Free shipping on orders over ₹100
  }, [subtotal]);

  // Total
  const grandTotal = useMemo(() => {
    return subtotal + shippingFee;
  }, [subtotal, shippingFee]);

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    if (!user) {
      showToast("Authentication Required", "Please log in or register to place your custom order!");
      setCartOpen(false);
      setAccountOpen(true);
      return;
    }
    setCheckoutStep("billing");
  };

  const handlePhotoUpload = async (productId: string, configId: string, file: File) => {
    if (!user || !isSupabaseConfigured) {
      showToast("Login Required", "Please log in to upload custom photos.");
      return;
    }
    
    setUploadingPhotoId(`${productId}-${configId}`);
    const url = await uploadCustomPhoto(user.id, file);
    setUploadingPhotoId(null);

    if (url) {
      attachCustomPhoto(productId, configId, url);
      showToast("Photo Uploaded", "Your custom image is securely attached!");
    } else {
      showToast("Upload Failed", "Could not upload photo. Please try again.");
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast("Authentication Required", "Please log in or register to place your custom order!");
      setCheckoutStep("idle");
      setCartOpen(false);
      setAccountOpen(true);
      return;
    }

    // Force shipping details to match the logged-in user session email exactly to prevent mismatches
    const finalShippingDetails = {
      ...shippingDetails,
      email: user.email,
      name: shippingDetails.name || user.name || ""
    };

    if (!finalShippingDetails.name || !finalShippingDetails.email || !finalShippingDetails.phone || !finalShippingDetails.address) {
      showToast("Incomplete Details", "Please fill in all shipping details to proceed.");
      return;
    }

    setOrderTotal(grandTotal);
    setCheckoutError("");
    setCheckoutStep("processing");

    // Post to Express backend API
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingDetails: finalShippingDetails,
        cart,
        grandTotal
      })
    })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Surface the real backend error (e.g. Supabase write failure) instead of
        // silently pretending the order succeeded.
        const message = data?.error || `Order submission failed (status ${res.status}).`;
        throw new Error(message);
      }
      return data;
    })
    .then((data) => {
      if (data && data.order) {
        setCreatedOrderId(data.order.id);
      }
      if (data && data.previewUrl) {
        setCreatedOrderPreviewUrl(data.previewUrl);
      }
      // Only clear the cart and show success once the order is confirmed saved.
      clearCart();
      setTimeout(() => {
        setCheckoutStep("success");
      }, 1500);
    })
    .catch((err) => {
      console.error("API Order error:", err);
      // Do NOT clear the cart and do NOT show success — the order was not saved.
      // Let the customer retry instead of thinking their order went through.
      setCheckoutError(
        err?.message || "We couldn't save your order right now. Please try again in a moment."
      );
      setCheckoutStep("error");
    });
  };

  // Automatically reset checkout state if items are in the cart
  useEffect(() => {
    if (cart.length > 0 && checkoutStep === "success") {
      setCheckoutStep("idle");
    }
  }, [cart.length, checkoutStep]);

  const handleCompleteOrder = () => {
    clearCart();
    setCheckoutStep("idle");
    setCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { 
            if (checkoutStep !== "processing") {
              setCartOpen(false); 
              if (checkoutStep === "success") setCheckoutStep("idle");
            } 
          }}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Sliding Drawer Container */}
        <div className="absolute inset-y-0 right-0 max-w-full flex sm:pl-10 pl-2">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="w-screen max-w-md bg-brand-ivory border-l border-brand-sand/55 flex flex-col justify-between shadow-2xl relative h-full"
          >
            {/* Header */}
            <div className="bg-[#1A1A1A] px-6 py-5 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C9A76A]" />
                <h3 className="font-serif text-lg font-normal">Your Shopping Bag</h3>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  if (checkoutStep === "success") setCheckoutStep("idle");
                }}
                disabled={checkoutStep === "processing"}
                className="p-2 rounded-[2px] hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {checkoutStep === "idle" && (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                      <div className="w-16 h-16 bg-[#FAF8F5] border border-[#C9A76A]/20 text-[#C9A76A] rounded-[2px] flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <h4 className="font-serif text-base sm:text-lg font-normal text-[#1A1A1A]">Your bag is empty</h4>
                      <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                        Explore our luxury resin keychains, live-edge wall clocks, and serving platters to begin curation.
                      </p>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-xs font-semibold cursor-pointer"
                      >
                        Start Curation
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, idx) => {
                        const itemConfigId = getConfigKey(
                          item.selectedWood,
                          item.selectedResinColor,
                          item.selectedDeco,
                          item.personalizationText
                        );
                        return (
                          <div 
                            key={`${item.product.id}-${itemConfigId}`} 
                            className="bg-white p-4 rounded-[2px] border border-brand-sand/40 shadow-xs flex gap-4 items-start"
                          >
                            {/* Product Thumb */}
                            <div className="w-16 h-16 rounded-[2px] overflow-hidden bg-[#FAF8F5] border border-brand-sand/30 flex-shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-grow space-y-1">
                              <h4 className="font-serif text-xs sm:text-sm font-normal text-[#1A1A1A] line-clamp-1">{item.product.name}</h4>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-[#C9A76A] block">{item.product.category}</span>
                              
                              {/* Custom configurations display */}
                              {(item.selectedWood || item.selectedResinColor || item.selectedDeco || item.personalizationText) && (
                                <div className="text-[9px] bg-[#FAF8F5] border border-brand-sand/30 rounded-[2px] p-2 mt-1.5 space-y-1 text-[#5A5A5A] font-medium leading-normal">
                                  {item.selectedWood && <div>• Wood: <span className="font-bold text-[#1A1A1A]">{item.selectedWood}</span></div>}
                                  {item.selectedResinColor && <div>• Resin: <span className="font-bold text-[#1A1A1A]">{item.selectedResinColor}</span></div>}
                                  {item.selectedDeco && item.selectedDeco.length > 0 && (
                                    <div>• Inclusions: <span className="font-bold text-[#1A1A1A]">{item.selectedDeco.join(", ")}</span></div>
                                  )}
                                  {item.personalizationText && (
                                    <div>• Engraving: <span className="font-serif font-bold text-[#C9A76A]">"{item.personalizationText}"</span></div>
                                  )}
                                </div>
                              )}

                              {/* Price per item */}
                              <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]/80 font-mono mt-1">
                                <span>₹{item.product.price.toFixed(2)}</span>
                                {item.product.originalPrice && (
                                  <span className="text-[10px] text-[#5A5A5A] line-through font-sans">
                                    ₹{item.product.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Custom Photo Upload UI */}
                              <div className="mt-3 pt-3 border-t border-dashed border-brand-sand/40">
                                <label className={`flex flex-col items-center justify-center cursor-pointer rounded-[4px] border-2 border-dashed transition-all p-4 ${
                                  item.customPhotoUrl 
                                    ? 'border-green-400 bg-green-50/50' 
                                    : 'border-brand-gold/40 bg-[#FAF8F5] hover:bg-brand-gold/10 hover:border-brand-gold'
                                }`}>
                                  {uploadingPhotoId === `${item.product.id}-${itemConfigId}` ? (
                                    <div className="flex flex-col items-center">
                                      <Loader2 className="w-6 h-6 animate-spin text-brand-gold mb-1" />
                                      <span className="text-[10px] text-[#5A5A5A]">Uploading...</span>
                                    </div>
                                  ) : item.customPhotoUrl ? (
                                    <div className="flex items-center gap-3">
                                      <img src={item.customPhotoUrl} alt="Custom upload" className="w-12 h-12 object-cover rounded-[2px] border border-brand-sand" />
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Photo Attached!</span>
                                        <span className="text-[9px] text-[#5A5A5A] underline">Click to change photo</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center text-center">
                                      <UploadCloud className="w-6 h-6 text-brand-gold mb-1" />
                                      <span className="text-[10px] text-brand-forest font-bold uppercase tracking-wider">Upload Customizable Photo Here</span>
                                      <span className="text-[9px] text-[#5A5A5A] mt-0.5">PNG, JPG up to 5MB</span>
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handlePhotoUpload(item.product.id, itemConfigId, file);
                                    }}
                                  />
                                </label>
                              </div>

                              {/* Item Quantity Trigger and Remove buttons */}
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-brand-sand/20">
                                <div className="flex items-center border border-brand-sand rounded-[2px] bg-[#FAF8F5] overflow-hidden h-7">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, itemConfigId, item.quantity - 1)}
                                    className="w-7 h-full hover:bg-brand-sand/30 text-[#1A1A1A] text-xs cursor-pointer font-bold"
                                  >
                                    –
                                  </button>
                                  <span className="w-7 text-center font-mono text-xs font-bold text-[#1A1A1A]">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, itemConfigId, item.quantity + 1)}
                                    className="w-7 h-full hover:bg-brand-sand/30 text-[#1A1A1A] text-xs cursor-pointer font-bold"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.product.id, itemConfigId)}
                                  className="text-brand-forest/40 hover:text-red-500 p-1.5 transition-colors duration-200"
                                  title="Remove item"
                                  aria-label={`Remove ${item.product.name} from Bag`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Step: Billing Details Form */}
              {checkoutStep === "billing" && (
                <form id="billing-form" onSubmit={handlePay} className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-normal text-[#1A1A1A]">Shipping & Delivery</h4>
                    <p className="text-[11px] text-[#5A5A5A]">Please enter your contact and delivery details to place your custom order.</p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.name}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        disabled={!!user}
                        value={shippingDetails.email}
                        onChange={(e) => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] ${!!user ? 'bg-brand-sand/15 text-[#5A5A5A] cursor-not-allowed' : 'bg-white text-[#1A1A1A]'}`}
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Shipping Address</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.address}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                      placeholder="123 Oakwood Lane"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Postal/ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.zip}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, zip: e.target.value }))}
                      className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                      placeholder="97210"
                    />
                  </div>

                  {/* Offline Payment Information */}
                  <div className="border border-brand-sand/50 p-4 rounded-[2px] bg-[#FAF8F5] space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#C9A76A] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Direct Studio Email Coordination</span>
                    </span>
                    <p className="text-[10px] text-[#5A5A5A] leading-relaxed">
                      Your complete curation request and contact details will be compiled and sent to our curation team at <strong className="text-[#C9A76A] font-bold">{ADMIN_EMAIL}</strong>. We will then reach out to you directly to arrange payment details (e.g. UPI, Bank Transfer, or Invoice) and share progress.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("idle")}
                      className="w-1/3 py-3 border border-brand-sand text-[#1A1A1A] hover:bg-[#FAF8F5] rounded-[2px] text-xs font-bold uppercase transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Place Order</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step: Processing Custom Resin Pouring */}
              {checkoutStep === "processing" && (
                <div className="text-center py-16 space-y-6">
                  {/* Glowing spinner representation of a resin mixer */}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-brand-sand rounded-[2px]" />
                    <div className="absolute inset-0 border-4 border-[#C9A76A] border-t-transparent rounded-[2px] animate-spin" />
                    <Flame className="w-8 h-8 text-[#C9A76A] animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">Confirming Your Order...</h4>
                    <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                      Saving your curation request to our studio records and notifying the design team.
                    </p>
                  </div>
                </div>
              )}

              {/* Step: Order failed to save */}
              {checkoutStep === "error" && (
                <div className="text-center py-12 space-y-6">
                  <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-[2px] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-[2px]">Order Not Saved</span>
                    <h4 className="font-serif text-xl font-normal text-[#1A1A1A]">Something Went Wrong</h4>
                    <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                      {checkoutError}
                    </p>
                    <p className="text-[11px] text-[#5A5A5A]/80 max-w-xs mx-auto leading-relaxed">
                      Your bag has been kept as-is. Please try again, or contact us directly at <strong>{ADMIN_EMAIL}</strong> if this keeps happening.
                    </p>
                  </div>

                  <div className="flex gap-2 max-w-xs mx-auto">
                    <button
                      onClick={() => setCheckoutStep("billing")}
                      className="w-full py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] cursor-pointer transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Order Successful checkout completed */}
              {checkoutStep === "success" && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 bg-[#FAF8F5] border border-[#C9A76A]/20 text-[#C9A76A] rounded-[2px] flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#C9A76A] bg-[#FAF8F5] border border-[#C9A76A]/20 px-2 py-1 rounded-[2px]">Curation Submitted</span>
                    <h4 className="font-serif text-xl font-normal text-[#1A1A1A]">Order Confirmed!</h4>
                    <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                      Thank you, <span className="font-bold text-[#1A1A1A]">{shippingDetails.name}</span>. Your custom curation request has been compiled and <strong className="text-[#C9A76A]">automatically emailed</strong> directly to our design studio team. We will reach out to you shortly!
                    </p>
                  </div>


<div className="space-y-3 max-w-xs mx-auto">
                    {/* UPI Payment Section with QR Code */}
                    <div className="bg-[#FAF8F5] p-4 rounded-[4px] border border-brand-sand/40 space-y-3 text-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A5A5A] block">Pay ₹{(orderTotal || grandTotal).toFixed(2)} via UPI</span>
                      
                      {/* QR Code for Desktop scanning */}
                      <div className="flex justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${STUDIO_UPI_ID}&pn=TheResinGrove&am=${(orderTotal || grandTotal).toFixed(2)}&cu=INR&tn=Order ${createdOrderId || ""}`)}`} 
                          alt="UPI QR Code" 
                          className="w-32 h-32 border border-white rounded-[2px] shadow-sm bg-white p-1"
                        />
                      </div>
                      
                      <p className="text-[9px] text-[#5A5A5A] leading-relaxed">
                        Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to pay instantly.
                      </p>

                      {/* Mobile Deep Link Button (Only shows on mobile devices) */}
                      <a
                        href={`upi://pay?pa=${STUDIO_UPI_ID}&pn=TheResinGrove&am=${(orderTotal || grandTotal).toFixed(2)}&cu=INR&tn=Order ${createdOrderId || ""}`}
                        className="block w-full py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-[10px] font-bold uppercase tracking-[1px] transition-colors md:hidden"
                      >
                        Open UPI App
                      </a>

                      {/* Manual UPI ID Copy */}
                      <div className="pt-2 border-t border-brand-sand/30">
                        <span className="text-[10px] text-[#5A5A5A] block mb-1">Or copy UPI ID:</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(STUDIO_UPI_ID);
                            showToast("UPI ID Copied", "You can paste it in your UPI app now!");
                          }}
                          className="font-bold text-brand-gold underline text-xs"
                        >
                          {STUDIO_UPI_ID}
                        </button>
                      </div>
                    </div>

                    {/* Copy Receipt */}
                    <button
                      onClick={() => {
                        const receiptText = `THE RESIN GROVE ORDER RECEIPT\nOrder ID: ${createdOrderId || "TRG-XXXXXX"}\nCustomer: ${shippingDetails.name}\nTotal: ₹${(orderTotal || grandTotal).toFixed(2)}`;
                        navigator.clipboard.writeText(receiptText);
                        showToast("Receipt Copied", "Your order receipt details have been copied to your clipboard!");
                      }}
                      className="w-full py-2.5 bg-transparent border border-brand-sand hover:bg-brand-sand/10 text-xs font-bold uppercase tracking-[1px] rounded-[2px] transition-colors"
                    >
                      Copy Order Receipt
                    </button>
                  </div>

                  {/* Order summary block */}
                  <div className="bg-white p-4 rounded-[2px] border border-brand-sand text-left text-[11px] font-medium text-[#1A1A1A]/80 space-y-1.5 max-w-xs mx-auto">
                    <div>• Order ID: <span className="font-bold font-mono text-[#C9A76A]">{createdOrderId || "TRG-Processing"}</span></div>
                    <div>• Name: <span className="font-bold">{shippingDetails.name}</span></div>
                    <div>• Contact Email: <span className="font-bold">{shippingDetails.email}</span></div>
                    <div>• Contact Phone: <span className="font-bold">{shippingDetails.phone}</span></div>
                    <div>• Shipping Address: <span className="font-bold">{shippingDetails.address}</span></div>
                    <div className="pt-2 border-t border-brand-sand mt-2 flex justify-between font-bold text-[#1A1A1A] text-xs">
                      <span>Grand Total:</span>
                      <span>₹{(orderTotal || grandTotal).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteOrder}
                    className="w-full py-3.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-[2px] text-xs font-bold uppercase tracking-[1px] cursor-pointer shadow-xs transition-colors"
                  >
                    Return to the Grove
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Bag Summary / Footer (Only shown in initial shop step) */}
            {checkoutStep === "idle" && cart.length > 0 && (
              <div className="border-t border-brand-sand/55 p-6 space-y-4 bg-white">
                
                {/* Totals Breakdown */}
                <div className="space-y-1.5 text-xs text-[#5A5A5A] font-medium pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Studio Savings:</span>
                      <span className="font-mono">-₹{totalSavings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Studio Delivery:</span>
                    <span className="font-mono text-[#5A5A5A]">
                      {shippingFee === 0 ? <span className="text-[#C9A76A] font-bold">FREE</span> : `₹${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2 border-t border-brand-sand">
                    <span>Curation Total:</span>
                    <span className="font-mono text-base text-[#1A1A1A]">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleStartCheckout}
                  className="w-full py-4 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] text-xs sm:text-sm font-bold uppercase tracking-[1px] transition-all duration-300 shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Truck className="w-4.5 h-4.5 text-white group-hover:scale-105 transition-transform" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}

          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  );
}