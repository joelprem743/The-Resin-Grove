import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../context/ShopContext";
import { X, Heart, Trash2, ShoppingBag } from "lucide-react";

export default function WishlistDrawer() {
  const { 
    wishlist, 
    isWishlistOpen, 
    setWishlistOpen, 
    toggleWishlist, 
    addToCart 
  } = useShop();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    toggleWishlist(product); // Remove from wishlist after moving to cart
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setWishlistOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Sliding Panel Container */}
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
                <Heart className="w-5 h-5 text-[#C9A76A] fill-[#C9A76A]" />
                <h3 className="font-serif text-lg font-normal">Your Saved Wishlist</h3>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                className="p-2 rounded-[2px] hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List panel */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-[#FAF8F5] border border-[#C9A76A]/20 text-[#C9A76A] rounded-[2px] flex items-center justify-center mx-auto">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-base sm:text-lg font-normal text-[#1A1A1A]">Your wishlist is empty</h4>
                  <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                    Browse our handcrafted resin frames, geode coasters, and personalized book marks to save your favorites.
                  </p>
                  <button
                    onClick={() => setWishlistOpen(false)}
                    className="px-6 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-[2px] text-xs font-semibold cursor-pointer"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((product) => (
                    <div 
                      key={product.id} 
                      className="bg-white p-4 rounded-[2px] border border-brand-sand/40 shadow-xs flex gap-4 items-start"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-[2px] overflow-hidden bg-[#FAF8F5] border border-brand-sand/30 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info and move triggers */}
                      <div className="flex-grow space-y-1">
                        <h4 className="font-serif text-xs sm:text-sm font-normal text-[#1A1A1A] line-clamp-1">{product.name}</h4>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#C9A76A] block">{product.category}</span>
                        <div className="text-xs font-bold text-[#1A1A1A]/80 font-mono mt-1">₹{product.price.toFixed(2)}</div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-brand-sand/20">
                          <button
                            onClick={() => handleMoveToCart(product)}
                            className="text-xs font-bold text-[#C9A76A] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Move to Bag</span>
                          </button>

                          <button
                            onClick={() => toggleWishlist(product)}
                            className="text-brand-forest/40 hover:text-red-500 p-1.5 transition-colors"
                            title="Remove from favorites"
                            aria-label={`Remove ${product.name} from Wishlist`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-brand-sand/55 p-6 bg-white">
              <button
                onClick={() => setWishlistOpen(false)}
                className="w-full py-3.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-colors shadow-xs cursor-pointer text-center"
              >
                Continue Browsing
              </button>
            </div>

          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  );
}
