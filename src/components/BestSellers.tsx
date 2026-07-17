import React from "react";
import { motion } from "motion/react";
import { PRODUCTS } from "../data";
import { useShop } from "../context/ShopContext";
import { Star, Shield, HelpCircle, ShoppingBag, Sparkles } from "lucide-react";

export default function BestSellers() {
  const { addToCart, setQuickViewProduct } = useShop();

  // Filter 3 best sellers to display in high-impact card templates
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 3);

  return (
    <section id="bestsellers" className="py-24 bg-brand-ivory relative overflow-hidden">
      {/* Background elegant decoration */}
      <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-brand-sand/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[20vw] h-[20vw] bg-brand-sage/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[2px] font-bold text-brand-gold font-sans block">
            Signature Artifacts
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-brand-forest">
            The Best Sellers Collection
          </h2>
          <div className="w-12 h-[1px] bg-brand-gold/40 mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-xl mx-auto">
            Our most sought-after original creations, loved by collectors worldwide for their impeccable wood-resin seams and crystal clarity.
          </p>
        </div>

        {/* Premium Large Product Showcase Layout */}
        <div className="relative">
          {/* Scrollable Container */}
          <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-10 pt-4 snap-x snap-mandatory scroll-smooth pr-20 sm:pr-28 lg:pr-36 scrollbar-hide">
            {bestSellers.map((product, index) => {
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-[280px] sm:w-[340px] md:w-[380px] lg:w-[400px] flex-shrink-0 snap-start bg-white border border-brand-sand/40 hover:border-brand-gold/60 rounded-[2px] overflow-hidden p-4 sm:p-6 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4 flex flex-col h-full justify-between">
                    {/* Product Image Frame */}
                    <div className="relative aspect-square w-full rounded-[2px] overflow-hidden bg-brand-ivory border border-brand-sand/20 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-brand-gold text-brand-forest text-[8px] sm:text-[9px] font-bold tracking-[1.5px] uppercase px-2.5 py-1.5 rounded-[2px] shadow-xs flex items-center gap-1 z-10">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Best Seller No. {index + 1}</span>
                      </div>
                      
                      {/* Discount Badge */}
                      {product.originalPrice && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-[2px] shadow-xs z-10">
                          Save ₹{(product.originalPrice - product.price).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Product Detailed Content */}
                    <div className="space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[1.5px] block">
                          {product.category}
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-normal text-brand-forest line-clamp-1">
                          {product.name}
                        </h3>
                        
                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="flex items-center text-brand-gold">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-brand-gold" : "text-brand-sand"}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-sans text-[#5A5A5A]">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-brand-sand text-[10px]">•</span>
                          <span className="text-[10px] font-sans text-[#5A5A5A] underline truncate max-w-[100px]">
                            {product.reviewsCount} Collectors
                          </span>
                        </div>
                      </div>

                      {/* Pricing tag */}
                      <div className="flex items-baseline gap-2 text-base font-normal text-brand-forest font-serif">
                        <span className="text-brand-gold font-bold">₹{product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-[#5A5A5A] line-through font-sans">
                            ₹{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Deep Description */}
                      <p className="font-sans text-[#5A5A5A] text-xs leading-relaxed line-clamp-3">
                        {product.description}
                      </p>

                      {/* Materials & Technical Details Highlight */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-brand-sand/40 text-xs">
                        <div>
                          <span className="text-[8px] uppercase tracking-[1.2px] text-brand-gold font-bold block mb-0.5">
                            Dimensions
                          </span>
                          <span className="text-[10px] text-brand-forest font-medium truncate block">
                            {product.dimensions}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-[1.2px] text-brand-gold font-bold block mb-0.5">
                            Materials
                          </span>
                          <span className="text-[10px] text-brand-forest font-medium truncate block">
                            {product.materials.join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="flex-1 px-3 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-forest rounded-[2px] font-bold text-[10px] uppercase tracking-[1px] transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="px-3 py-2.5 bg-transparent hover:bg-brand-forest/5 border border-brand-gold text-brand-gold rounded-[2px] font-bold text-[10px] uppercase tracking-[1px] transition-all duration-300 cursor-pointer text-center whitespace-nowrap"
                        >
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Elegant Fade Glass Blur at Right End */}
          <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-brand-ivory via-brand-ivory/80 to-transparent pointer-events-none z-20 backdrop-blur-[1px]" />
        </div>

      </div>
    </section>
  );
}