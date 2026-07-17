import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../context/ShopContext";
import { X, Star, ShoppingBag, Heart, Shield, Sparkles, Scale } from "lucide-react";

export default function QuickViewModal() {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist 
  } = useShop();

  const [quantity, setQuantity] = useState(1);

  // Reset quantity when product shifts
  useEffect(() => {
    setQuantity(1);
  }, [quickViewProduct]);

  const product = quickViewProduct;
  const isFav = product ? isInWishlist(product.id) : false;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setQuickViewProduct(null); // Close modal
    }
  };

  return (
    <AnimatePresence>
      {quickViewProduct && product && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        {/* Backdrop trigger close */}
        <div className="absolute inset-0" onClick={() => setQuickViewProduct(null)} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-[2px] overflow-hidden shadow-2xl max-w-4xl w-full border border-brand-sand relative z-10 grid grid-cols-1 md:grid-cols-12 gap-0 my-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 p-2 bg-brand-ivory hover:bg-white hover:text-brand-gold text-brand-forest rounded-[2px] border border-brand-sand shadow-xs transition-all duration-200 z-25 cursor-pointer"
            aria-label="Close details modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image Grid (5 Columns) */}
          <div className="md:col-span-5 bg-brand-ivory p-6 sm:p-8 flex items-center justify-center relative">
            <div className="aspect-square w-full rounded-[2px] overflow-hidden shadow-xs bg-white border border-brand-sand/50 p-2">
              <div className="relative w-full h-full rounded-[2px] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {product.isBestSeller && (
                  <span className="absolute top-3 left-3 bg-brand-gold text-brand-forest text-[9px] font-bold uppercase tracking-[1px] px-2 py-1 rounded-[2px] shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Best Seller</span>
                  </span>
                )}
                {product.originalPrice && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-[2px] shadow-xs z-10">
                    Sale
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Product specs (7 Columns) */}
          <div className="md:col-span-7 p-6 sm:p-10 space-y-6 md:max-h-[85vh] md:overflow-y-auto">
            
            <div className="space-y-2">
              {/* Category */}
              <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[1.5px] block">
                {product.category}
              </span>
              
              {/* Name */}
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-brand-forest">
                {product.name}
              </h3>

              {/* Rating and Reviews */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-brand-gold text-brand-gold" : "text-brand-sand"}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#5A5A5A]">
                  {product.rating.toFixed(1)} / 5.0 ({product.reviewsCount} reviews)
                </span>
              </div>
            </div>

            {/* Price Tag */}
            <div className="flex flex-wrap items-baseline gap-3 py-2 border-b border-brand-sand/30">
              <span className="font-serif text-3xl font-bold text-brand-forest">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="font-sans text-base text-[#5A5A5A] line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && (
                <span className="bg-red-50 text-red-600 text-[10px] font-bold uppercase px-2 py-1 rounded-[2px] border border-red-100">
                  Save ₹{(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed">
              {product.description}
            </p>

            {/* Specifications Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-brand-sand/40 text-xs text-brand-forest">
              <div>
                <span className="font-bold uppercase text-[9px] text-brand-gold tracking-[1.5px] block mb-1">Dimensions</span>
                <span className="font-medium text-[#5A5A5A]">{product.dimensions}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-[9px] text-brand-gold tracking-[1.5px] block mb-1">Key Materials</span>
                <span className="font-medium text-[#5A5A5A]">{product.materials.join(", ")}</span>
              </div>
            </div>

            {/* Micro value badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5A5A5A] uppercase tracking-[1px]">
                <Shield className="w-4 h-4 text-brand-gold" />
                <span>Anti-Yellowing Glaze</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5A5A5A] uppercase tracking-[1px]">
                <Shield className="w-4 h-4 text-brand-gold" />
                <span>Food-Safe Finish</span>
              </div>
            </div>

            {/* Action Buttons Layout */}
            <div className="space-y-3 pt-4">
              {/* Row 1: Quantity and Wishlist */}
              <div className="flex flex-row items-center gap-3">
                {/* Quantity control */}
                <div className="flex items-center justify-center border border-brand-sand rounded-[2px] bg-brand-ivory overflow-hidden h-12 w-24 shrink-0">
                  <button
                    onClick={handleDecrement}
                    disabled={!product.inStock}
                    className="w-10 h-full hover:bg-brand-sand/30 text-brand-forest font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    –
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold text-brand-forest">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={!product.inStock}
                    className="w-10 h-full hover:bg-brand-sand/30 text-brand-forest font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="flex-grow h-12 border border-brand-sand rounded-[2px] flex items-center justify-center gap-2 text-[#1A1A1A] hover:text-[#C9A76A] hover:border-[#C9A76A] transition-all duration-200 cursor-pointer bg-white text-xs font-bold uppercase tracking-[1px]"
                  aria-label="Add to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-red-400 text-red-400" : "text-[#1A1A1A]"}`} />
                  <span>{isFav ? "Saved" : "Wishlist"}</span>
                </button>
              </div>

              {/* Row 2: Add to Cart (Full Width) */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full h-12 rounded-[2px] text-xs sm:text-sm font-bold uppercase tracking-[1px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  product.inStock 
                    ? "bg-brand-gold hover:bg-brand-gold/90 text-brand-forest" 
                    : "bg-brand-sand text-brand-forest/40 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-4.5 h-4.5 text-white" />
                <span>Add {quantity > 1 ? `${quantity} items` : "to Bag"}</span>
              </button>
            </div>

          </div>

        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}