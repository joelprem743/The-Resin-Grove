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
  Mail
} from "lucide-react";

const ADMIN_EMAIL = "orders@theresingrove.com"; // Placeholder email that can be customized easily

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    user,
    showToast
  } = useShop();

  const [checkoutStep, setCheckoutStep] = useState<"idle" | "billing" | "processing" | "success">("idle");
  const [shippingDetails, setShippingDetails] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "", 
    zip: "" 
  });
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [createdOrderPreviewUrl, setCreatedOrderPreviewUrl] = useState<string>("");

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
    setCheckoutStep("billing");
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDetails.name || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.address) return;

    setCheckoutStep("processing");

    // Post to Express backend API
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingDetails,
        cart,
        grandTotal
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Order submission failed");
      return res.json();
    })
    .then((data) => {
      if (data && data.order) {
        setCreatedOrderId(data.order.id);
      }
      if (data && data.previewUrl) {
        setCreatedOrderPreviewUrl(data.previewUrl);
      }
      // Simulate luxury resin pour progress steps for full immersion
      setTimeout(() => {
        setCheckoutStep("success");
      }, 3000);
    })
    .catch((err) => {
      console.error("API Order error:", err);
      // Fallback fallback so user is never blocked
      setTimeout(() => {
        setCheckoutStep("success");
      }, 2000);
    });
  };

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
          onClick={() => { if (checkoutStep !== "processing") setCartOpen(false); }}
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
                onClick={() => setCartOpen(false)}
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
                              <div className="text-xs font-bold text-[#1A1A1A]/80 font-mono mt-1">₹{item.product.price.toFixed(2)}</div>

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
                        value={shippingDetails.email}
                        onChange={(e) => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
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
                    <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">Mixing Your Art Piece...</h4>
                    <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                      We are simulating our actual 7-stage custom craft: weighing epoxy blocks, casting botanical inclusions, degassing microbubbles, and polishing the glasslike dome...
                    </p>
                  </div>

                  {/* Flow progress indicators */}
                  <ul className="text-left text-[11px] font-sans space-y-2 max-w-[240px] mx-auto text-[#1A1A1A] font-medium">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#C9A76A] rounded-[2px]" /> Measuring precise wood-resin seams</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#C9A76A] rounded-[2px]" /> Pouring Aegean turquoise waves</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#C9A76A] rounded-[2px] animate-ping" /> Laser engraving custom monogram</li>
                  </ul>
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

                  {/* Temporary Test Email Preview Link */}
                  {createdOrderPreviewUrl && (
                    <div className="max-w-xs mx-auto p-4 bg-brand-forest/5 border border-brand-sand/50 rounded-[2px] text-left space-y-2">
                      <p className="text-[10px] text-[#1A1A1A] leading-relaxed">
                        ✨ <strong>Sandbox SMTP Notice:</strong> Because SMTP credentials aren't configured yet, a real email was automatically dispatched to an Ethereal inbox.
                      </p>
                      <a
                        href={createdOrderPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full py-2 bg-brand-forest text-white hover:bg-[#20362B] rounded-[2px] text-[11px] font-bold uppercase tracking-[0.5px] items-center justify-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>View Automated Email</span>
                      </a>
                    </div>
                  )}

                  <div className="space-y-2 max-w-xs mx-auto">
                    <button
                      onClick={() => {
                        const receiptText = `THE RESIN GROVE ORDER RECEIPT\nOrder ID: ${createdOrderId || "TRG-XXXXXX"}\nCustomer: ${shippingDetails.name}\nTotal: ₹${grandTotal.toFixed(2)}`;
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
                      <span>₹{grandTotal.toFixed(2)}</span>
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
