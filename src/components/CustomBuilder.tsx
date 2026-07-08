import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CUSTOM_BUILDER_OPTIONS } from "../data";
import { useShop } from "../context/ShopContext";
import { Product } from "../types";
import { Sparkles, ShoppingBag, Plus, Check, Info, Trash, X, Mail } from "lucide-react";

export default function CustomBuilder() {
  const { addToCart } = useShop();

  const [selectedProduct, setSelectedProduct] = useState(CUSTOM_BUILDER_OPTIONS.products[3]); // Default Acacia Tray
  const [selectedWood, setSelectedWood] = useState(CUSTOM_BUILDER_OPTIONS.woodTypes[1]); // Default Olive Wood
  const [selectedResin, setSelectedResin] = useState(CUSTOM_BUILDER_OPTIONS.resinColors[0]); // Default Aegean Teal Wave
  const [selectedDeco, setSelectedDeco] = useState<typeof CUSTOM_BUILDER_OPTIONS.decorations>([
    CUSTOM_BUILDER_OPTIONS.decorations[0], // Gold Foil
    CUSTOM_BUILDER_OPTIONS.decorations[1], // Pressed Flowers
  ]);
  const [engraving, setEngraving] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Quote inquiry states
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail) return;

    setInquirySubmitting(true);

    const configData = {
      baseProduct: selectedProduct.name,
      woodSlab: selectedWood.name,
      resinColor: selectedResin.name,
      inclusions: selectedDeco.map((d) => d.name),
      engraving: engraving || null,
      price: totalPrice,
    };

    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: inquiryName,
        email: inquiryEmail,
        projectType: `Artisan Customizer: ${selectedProduct.name}`,
        budget: totalPrice.toFixed(2),
        description: inquiryNotes || `Inquiry submitted directly from the Custom Design Workshop. Selections: Wood (${selectedWood.name}), Resin Colorway (${selectedResin.name}), Inclusions (${selectedDeco.map(d => d.name).join(", ")}).`,
        configuration: configData,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Inquiry request failed");
        return res.json();
      })
      .then(() => {
        setInquirySubmitting(false);
        setInquirySuccess(true);
        setTimeout(() => {
          setInquirySuccess(false);
          setIsInquiryOpen(false);
          setInquiryName("");
          setInquiryEmail("");
          setInquiryNotes("");
        }, 3000);
      })
      .catch((err) => {
        console.error("CustomBuilder Inquiry API error:", err);
        setTimeout(() => {
          setInquirySubmitting(false);
          setInquirySuccess(true);
        }, 1000);
      });
  };

  // Toggle decoration selections
  const handleToggleDeco = (deco: typeof CUSTOM_BUILDER_OPTIONS.decorations[0]) => {
    setSelectedDeco((prev) => {
      const exists = prev.some((d) => d.name === deco.name);
      if (exists) {
        return prev.filter((d) => d.name !== deco.name);
      } else {
        return [...prev, deco];
      }
    });
  };

  // Compute total price dynamically
  const totalPrice = useMemo(() => {
    const base = selectedProduct.basePrice;
    const woodPrice = selectedWood.price;
    const decoPrice = selectedDeco.reduce((acc, d) => acc + d.price, 0);
    const engravingPrice = engraving ? 5.0 : 0.0;
    return base + woodPrice + decoPrice + engravingPrice;
  }, [selectedProduct, selectedWood, selectedDeco, engraving]);

  // Handle adding custom item to cart
  const handleAddCustomToCart = () => {
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedProduct.name}`,
      category: "Custom Gifts",
      price: totalPrice,
      rating: 5.0,
      reviewsCount: 1,
      image: selectedProduct.image, // Base product image as reference
      description: `A custom-built ${selectedProduct.name}. Wood slab: ${selectedWood.name}. Resin Style: ${selectedResin.name}. Inclusions: ${selectedDeco.map(d => d.name).join(", ")}.`,
      dimensions: "Customized Spec",
      materials: [selectedWood.name, selectedResin.name, ...selectedDeco.map(d => d.name)],
      inStock: true,
    };

    addToCart(
      customProduct,
      1,
      selectedWood.name,
      selectedResin.name,
      selectedDeco.map((d) => d.name),
      engraving || undefined
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  // Render resin simulator style object based on selections
  const simulatorStyle = useMemo(() => {
    if (selectedResin.color === "transparent") {
      return { background: "rgba(255,255,255,0.15)" };
    }
    // Formulate beautiful flowing gradients representing our premium colors
    if (selectedResin.name.includes("Teal")) {
      return {
        background: "linear-gradient(135deg, #10312B 0%, #1D5449 50%, #4D9A8C 100%)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)",
      };
    }
    if (selectedResin.name.includes("Amethyst")) {
      return {
        background: "linear-gradient(135deg, #2D1432 0%, #482350 50%, #873999 100%)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)",
      };
    }
    if (selectedResin.name.includes("Forest")) {
      return {
        background: "linear-gradient(135deg, #0C1E17 0%, #1E3F31 50%, #4B7865 100%)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)",
      };
    }
    if (selectedResin.name.includes("Pearl")) {
      return {
        background: "linear-gradient(135deg, #DDCBCE 0%, #EDE1E2 50%, #FFFFFF 100%)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.2)",
      };
    }
    return { backgroundColor: selectedResin.color };
  }, [selectedResin]);

  return (
    <section id="custom-builder" className="py-24 bg-brand-ivory relative overflow-hidden border-b border-brand-sand/30">
      {/* Background waves */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0,200 Q 300,100 600,200 T 1200,200 T 1800,200 V 1000 H 0 Z" fill="#2E5E4E" />
          <path d="M 0,400 Q 400,250 800,400 T 1600,400 V 1000 H 0 Z" fill="#C9A76A" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[2px] font-bold text-[#C9A76A] font-sans block">
            The Interactive Workshop
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Design Your Own Resin Art
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A76A]/40 mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-xl mx-auto">
            Bring your vision to life. Choose wood inserts, shimmering liquid resin tones, botanical inclusions, and custom engraving, and preview your concept.
          </p>
        </div>

        {/* Builder Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch bg-white rounded-[2px] overflow-hidden shadow-xs border border-brand-sand/50">
          
          {/* Options Panel (Left 7 Columns) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white relative">
            
            <div className="mb-6 pb-2 border-b border-brand-sand/20">
              <span className="text-[10px] uppercase tracking-[2.5px] font-bold text-[#C9A76A] font-sans block mb-1">
                Workshop Customizer
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-normal text-[#1A1A1A]">
                Configure Your Boutique Piece
              </h3>
              <p className="text-xs text-[#5A5A5A] mt-1">
                Use the scrollable editor below to design and refine your customized selection step-by-step.
              </p>
            </div>

            {/* Custom Premium Scrollbar Style Injection */}
            <style>{`
              .steps-scrollbox::-webkit-scrollbar {
                width: 4px;
              }
              .steps-scrollbox::-webkit-scrollbar-track {
                background: rgba(201, 167, 106, 0.05);
              }
              .steps-scrollbox::-webkit-scrollbar-thumb {
                background: #C9A76A;
                border-radius: 2px;
              }
              .steps-scrollbox::-webkit-scrollbar-thumb:hover {
                background: #bfa065;
              }
            `}</style>

            {/* Scrollable Box for All Steps */}
            <div className="steps-scrollbox max-h-[460px] overflow-y-auto pr-3.5 space-y-8 scroll-smooth">
              
              {/* Step 1: Base Product */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C9A76A] uppercase tracking-[1px]">[ Step 1 ]</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Select Base Canvas</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CUSTOM_BUILDER_OPTIONS.products.map((p) => {
                    const isSel = selectedProduct.name === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-3 rounded-[2px] border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                          isSel 
                            ? "border-[#C9A76A] bg-[#FAF8F5] ring-1 ring-[#C9A76A]" 
                            : "border-brand-sand hover:bg-brand-forest/5"
                        }`}
                      >
                        <span className="font-serif text-xs font-normal text-[#1A1A1A] block">
                          {p.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#C9A76A] font-bold block mt-1">
                          From ₹{p.basePrice.toFixed(2)}
                        </span>
                        {isSel && (
                          <div className="absolute top-1 right-1 text-[#C9A76A]">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Wood Slab */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C9A76A] uppercase tracking-[1px]">[ Step 2 ]</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Select Luxury Wood Slab</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CUSTOM_BUILDER_OPTIONS.woodTypes.map((w) => {
                    const isSel = selectedWood.name === w.name;
                    return (
                      <button
                        key={w.name}
                        onClick={() => setSelectedWood(w)}
                        className={`p-3.5 rounded-[2px] border text-left transition-all duration-300 relative cursor-pointer ${
                          isSel 
                            ? "border-[#C9A76A] bg-[#FAF8F5] ring-1 ring-[#C9A76A]" 
                            : "border-brand-sand hover:bg-brand-forest/5"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-serif text-xs sm:text-sm font-normal text-[#1A1A1A] block">{w.name}</span>
                          <span className="font-mono text-xs text-[#C9A76A] font-bold">
                            {w.price === 0 ? "Free" : `+₹${w.price.toFixed(2)}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5A5A5A] mt-1">{w.desc}</p>
                        {isSel && (
                          <div className="absolute top-2 right-2 text-[#C9A76A]">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Liquid Resin Color */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C9A76A] uppercase tracking-[1px]">[ Step 3 ]</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Select Epoxy Resin Colorway</h3>
                </div>
                <div className="space-y-2">
                  {CUSTOM_BUILDER_OPTIONS.resinColors.map((r) => {
                    const isSel = selectedResin.name === r.name;
                    return (
                      <button
                        key={r.name}
                        onClick={() => setSelectedResin(r)}
                        className={`w-full p-3 rounded-[2px] border text-left transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                          isSel 
                            ? "border-[#C9A76A] bg-[#FAF8F5] ring-1 ring-[#C9A76A]" 
                            : "border-brand-sand hover:bg-brand-forest/5"
                        }`}
                      >
                        {/* Swatch color representation */}
                        <div 
                          className="w-10 h-10 rounded-full border border-brand-sand shadow-inner flex-shrink-0"
                          style={
                            r.color === "transparent"
                              ? { background: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)", backgroundSize: "8px 8px" }
                              : r.name.includes("Teal")
                              ? { background: "linear-gradient(135deg, #1E4D4A 0%, #4D9A8C 100%)" }
                              : r.name.includes("Amethyst")
                              ? { background: "linear-gradient(135deg, #4A2B59 0%, #873999 100%)" }
                              : r.name.includes("Forest")
                              ? { background: "linear-gradient(135deg, #1D3B2E 0%, #4B7865 100%)" }
                              : r.name.includes("Pearl")
                              ? { background: "linear-gradient(135deg, #EEDCD6 0%, #FFFFFF 100%)" }
                              : { backgroundColor: r.color }
                          }
                        />
                        <div className="flex-grow">
                          <span className="font-serif text-xs sm:text-sm font-normal text-[#1A1A1A] block">{r.name}</span>
                          <span className="text-[10px] text-[#5A5A5A] block">{r.desc}</span>
                        </div>
                        {isSel && <Check className="w-5 h-5 text-[#C9A76A] mr-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Botanical / Gilded Inclusions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C9A76A] uppercase tracking-[1px]">[ Step 4 ]</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Add Organic Inclusions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CUSTOM_BUILDER_OPTIONS.decorations.map((d) => {
                    const isSel = selectedDeco.some((item) => item.name === d.name);
                    return (
                      <button
                        key={d.name}
                        onClick={() => handleToggleDeco(d)}
                        className={`p-3.5 rounded-[2px] border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${
                          isSel 
                            ? "border-[#C9A76A] bg-[#FAF8F5] ring-1 ring-[#C9A76A]" 
                            : "border-brand-sand hover:bg-brand-forest/5"
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-serif text-xs font-normal text-[#1A1A1A]">{d.name}</span>
                          <span className="font-mono text-xs text-[#C9A76A] font-bold">
                            +₹{d.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5A5A5A] mt-1">{d.desc}</p>
                        
                        {/* Interactive toggle indicators */}
                        <div className="absolute top-2.5 right-2.5">
                          {isSel ? (
                            <div className="w-4 h-4 rounded-full bg-[#C9A76A] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-brand-sand flex items-center justify-center">
                              <Plus className="w-3 h-3 text-brand-sand hover:text-[#C9A76A]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Laser Engraving */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C9A76A] uppercase tracking-[1px]">[ Step 5 ]</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Laser Engraving (Optional)</h3>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Enter custom initials, name, or date (+₹5.00)"
                    value={engraving}
                    onChange={(e) => setEngraving(e.target.value)}
                    className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-4 py-3 text-sm text-[#1A1A1A] placeholder-brand-forest/40 focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                  />
                  <span className="text-[10px] text-[#5A5A5A]/70 block text-right font-medium">
                    {engraving.length}/30 characters
                  </span>
                </div>
              </div>

            </div>

            {/* Scroll Indicator Prompt Footer */}
            <div className="mt-6 pt-4 border-t border-brand-sand/20 flex items-center justify-between text-[10px] text-[#5A5A5A] uppercase tracking-wider font-bold">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C9A76A]" />
                <span>Scroll inside the box to preview options 1–5</span>
              </div>
              <span className="text-[#C9A76A]">Steps 1–5</span>
            </div>

          </div>

          {/* Live Simulator View (Right 5 Columns) */}
          <div className="lg:col-span-5 bg-[#FAF8F5] p-6 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-brand-sand/40 relative">
            
            {/* Shimmer overlay badge */}
            <div className="absolute top-4 right-4 z-10 bg-white text-[#C9A76A] text-[10px] font-bold px-2 py-1.5 rounded-[2px] border border-brand-sand tracking-wide uppercase shadow-xs">
              Live Preview
            </div>

            <div className="space-y-8 flex-grow flex flex-col justify-center">
              
              {/* Product Visual Mockup Container */}
              <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] mx-auto bg-white rounded-[2px] p-4 shadow-xs border border-brand-sand/30 flex items-center justify-center overflow-hidden">
                
                {/* Simulated Shaped Resin Block (Dynamic based on selected product shape) */}
                <div 
                  className={`relative shadow-xs transition-all duration-1000 ${
                    selectedProduct.name.includes("Keychain")
                      ? "w-28 h-28 rounded-full border-4 border-brand-gold/10"
                      : selectedProduct.name.includes("Clock")
                      ? "w-48 h-48 rounded-full border-4 border-brand-gold/30"
                      : selectedProduct.name.includes("Tray")
                      ? "w-52 h-32 rounded-[2px] border-2 border-brand-forest/20"
                      : selectedProduct.name.includes("Coasters")
                      ? "w-36 h-36 rounded-[2px] border border-brand-gold/40 transform rotate-12"
                      : selectedProduct.name.includes("Bookmark")
                      ? "w-12 h-48 rounded-[2px]"
                      : "w-40 h-40 rounded-[2px]"
                  }`}
                  style={simulatorStyle}
                >
                  {/* Timber Wood Grain Insertion Layer */}
                  {selectedWood.name !== "None (Pure Resin)" && (
                    <div 
                      className={`absolute bottom-0 left-0 right-0 h-1/2 bg-cover bg-center rounded-b-[inherit] transition-all duration-700 opacity-80 ${
                        selectedWood.name.includes("Olive")
                          ? "bg-[url('https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=300&q=80')]"
                          : selectedWood.name.includes("Walnut")
                          ? "bg-[url('https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=300&q=80')]"
                          : "bg-[url('https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=300&q=80')]"
                      }`}
                    >
                      {/* Organic wave/river edge border effect */}
                      <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-b from-brand-forest/10 to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Botanical / Rose-petals floating decoration layer */}
                  {selectedDeco.some((d) => d.name.includes("Flowers")) && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-wrap justify-around items-center p-4">
                      {/* Mock delicate floating petals inside resin */}
                      <span className="w-2 h-2 rounded-full bg-pink-400/80 animate-pulse" />
                      <span className="w-3.5 h-1.5 rounded-full bg-yellow-300/60 rotate-45" />
                      <span className="w-2 h-3.5 rounded-full bg-emerald-500/70 -rotate-12" />
                      <span className="w-1.5 h-2.5 rounded-full bg-pink-300/80" />
                    </div>
                  )}

                  {/* Gold flake glowing sparks */}
                  {selectedDeco.some((d) => d.name.includes("Gold")) && (
                    <div className="absolute inset-0 pointer-events-none z-15 flex flex-wrap justify-around p-3">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-md animate-ping" />
                      <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                      <span className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                    </div>
                  )}

                  {/* Engraving overlay text */}
                  {engraving && (
                    <div className="absolute inset-0 flex items-center justify-center z-25">
                      <span className="font-serif text-[10px] sm:text-xs font-bold tracking-widest text-[#C9A76A] uppercase bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-sm shadow-sm border border-brand-gold/30">
                        {engraving}
                      </span>
                    </div>
                  )}

                  {/* Shading glossy gloss curve representation */}
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/15 to-transparent rounded-[inherit] pointer-events-none" />
                </div>

              </div>

              {/* Dynamic Bill & Configuration Breakdown */}
              <div className="space-y-2 text-center bg-white/70 backdrop-blur-md border border-brand-sand/50 p-4 rounded-[2px] shadow-xs">
                <span className="text-[9px] font-bold text-[#C9A76A] uppercase tracking-widest">Pricing Breakdown</span>
                <div className="flex justify-between items-center text-xs font-medium text-[#1A1A1A] px-2">
                  <span>{selectedProduct.name} Base:</span>
                  <span>₹{selectedProduct.basePrice.toFixed(2)}</span>
                </div>
                {selectedWood.price > 0 && (
                  <div className="flex justify-between items-center text-xs font-medium text-[#1A1A1A] px-2">
                    <span>{selectedWood.name}:</span>
                    <span>+₹{selectedWood.price.toFixed(2)}</span>
                  </div>
                )}
                {selectedDeco.length > 0 && (
                  <div className="flex justify-between items-center text-xs font-medium text-[#1A1A1A] px-2">
                    <span>Selected Inclusions ({selectedDeco.length}):</span>
                    <span>+₹{selectedDeco.reduce((acc, d) => acc + d.price, 0).toFixed(2)}</span>
                  </div>
                )}
                {engraving && (
                  <div className="flex justify-between items-center text-xs font-medium text-[#1A1A1A] px-2">
                    <span>Laser Engraving:</span>
                    <span>+₹5.00</span>
                  </div>
                )}
              </div>

            </div>

            {/* Total Price and Call to Action */}
            <div className="pt-6 border-t border-brand-sand/50 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#5A5A5A] font-bold block mb-1">Estimated Cost</span>
                  <span className="font-serif text-3xl font-normal text-[#1A1A1A]">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="text-right text-[10px] text-[#5A5A5A] font-medium leading-relaxed">
                  Ships within 5–7 days <br /> Includes premium gift box
                </div>
              </div>

              <button
                onClick={handleAddCustomToCart}
                className="w-full py-4 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] text-xs font-bold tracking-[1px] uppercase transition-all duration-300 flex items-center justify-center gap-2 group shadow-xs cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4.5 h-4.5 text-white" />
                    <span>Added Your Creation!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4.5 h-4.5 text-white" />
                    <span>Add Custom Design to Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsInquiryOpen(true)}
                className="w-full py-3 bg-transparent hover:bg-[#C9A76A]/5 border border-[#C9A76A] text-[#1A1A1A] rounded-[2px] text-xs font-bold tracking-[1px] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4 text-[#C9A76A]" />
                <span>Request Custom Quote & Inquiry</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Quote Inquiry Modal */}
      <AnimatePresence>
        {isInquiryOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => { if (!inquirySubmitting) setIsInquiryOpen(false); }} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-brand-sand max-w-md w-full rounded-[2px] shadow-2xl p-6 sm:p-8 relative z-10 space-y-5 my-auto"
            >
              <button
                onClick={() => setIsInquiryOpen(false)}
                disabled={inquirySubmitting}
                className="absolute top-4 right-4 p-1.5 hover:bg-[#FAF8F5] rounded-[2px] text-[#5A5A5A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-brand-sand/30 pb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#C9A76A] block mb-0.5">Direct Consultation</span>
                <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">Inquire About Your Design</h4>
                <p className="text-[11px] text-[#5A5A5A] mt-1">
                  We will compile your current customized spec details and send them directly to our master craftsmen.
                </p>
              </div>

              {inquirySuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-green-50 text-green-600 border border-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-6 h-6 animate-bounce" />
                  </div>
                  <h5 className="font-serif text-base font-normal text-[#1A1A1A]">Inquiry Submitted!</h5>
                  <p className="text-xs text-[#5A5A5A] leading-relaxed max-w-xs mx-auto">
                    We have received your custom artisan configurations and logged them for evaluation. A design specialist will reach out within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-4">
                  {/* Prefilled custom specs representation */}
                  <div className="bg-[#FAF8F5] border border-brand-sand/50 p-3 rounded-[2px] text-[11px] text-[#1A1A1A] font-medium space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#C9A76A] block mb-1">Configuration Dossier</span>
                    <div>• Canvas Base: <span className="font-bold">{selectedProduct.name}</span></div>
                    <div>• Selected Slab: <span className="font-bold">{selectedWood.name}</span></div>
                    <div>• Resin Gradient: <span className="font-bold">{selectedResin.name}</span></div>
                    {selectedDeco.length > 0 && (
                      <div>• Inclusions: <span className="font-bold">{selectedDeco.map(d => d.name).join(", ")}</span></div>
                    )}
                    {engraving && <div>• Custom Engraving: <span className="font-serif italic text-[#C9A76A]">"{engraving}"</span></div>}
                    <div className="pt-1.5 border-t border-brand-sand/30 mt-1.5 flex justify-between font-bold text-[#1A1A1A]">
                      <span>Est. Artisan Cost:</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="Elizabeth Bennett"
                        className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="elizabeth@example.com"
                        className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Artisan Notes / Scaling Requests (Optional)</label>
                      <textarea
                        value={inquiryNotes}
                        onChange={(e) => setInquiryNotes(e.target.value)}
                        placeholder="Please specify if you want a custom dimensional width, special hanging mounts, or matching coasters..."
                        rows={3}
                        className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] px-3 py-2 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full py-3 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {inquirySubmitting ? (
                      <span>Consulting Studio...</span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-white" />
                        <span>Submit Artisan Spec Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
