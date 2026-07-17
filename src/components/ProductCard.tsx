import React from "react";
import { motion } from "motion/react";
import { Heart, Eye, ShoppingBag, Star, Sparkles } from "lucide-react";
import { Product } from "../types";
import { useShop } from "../context/ShopContext";

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct 
  } = useShop();

  const isFav = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2px] overflow-hidden border border-brand-sand/40 hover:border-brand-gold/60 transition-all duration-300 group flex flex-col h-full relative"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full bg-brand-ivory overflow-hidden p-1.5">
        <div className="relative w-full h-full rounded-[2px] overflow-hidden bg-brand-ivory">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Glare Reflection overlay that sweeps on hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-linear-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isBestSeller && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-brand-gold text-brand-forest text-[9px] font-bold tracking-[1.5px] uppercase shadow-xs">
                <span>Best Seller</span>
              </span>
            )}
            {product.originalPrice && (
              <span className="px-2 py-1 rounded-[2px] bg-red-500 text-white text-[9px] font-bold tracking-[1.5px] uppercase shadow-xs">
                Sale
              </span>
            )}
            {!product.inStock && (
              <span className="px-2 py-1 rounded-[2px] bg-brand-forest/90 text-brand-ivory text-[9px] font-bold tracking-[1.5px] uppercase">
                Sold Out
              </span>
            )}
          </div>

          {/* Action overlay buttons */}
          <div className="absolute inset-0 bg-brand-forest/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleQuickView}
              className="p-3 bg-white hover:bg-brand-ivory text-brand-forest hover:text-brand-gold rounded-full shadow-xs hover:scale-105 transition-all duration-200"
              title="Quick View"
              aria-label={`Quick View ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`p-3 rounded-full shadow-xs hover:scale-105 transition-all duration-200 ${
                product.inStock 
                  ? "bg-brand-forest hover:bg-brand-forest/90 text-brand-ivory hover:text-white" 
                  : "bg-brand-sand text-brand-forest/40 cursor-not-allowed"
              }`}
              title="Add to Cart"
              aria-label={`Add ${product.name} to Cart`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>

          {/* Wishlist Heart Top Right */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-brand-forest shadow-xs hover:scale-105 transition-all duration-200 z-10"
            aria-label={isFav ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
          >
            <Heart 
              className={`w-4 h-4 transition-colors duration-200 ${
                isFav ? "fill-red-500 text-red-500" : "text-brand-forest hover:text-red-500"
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Product Information Panel */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          {/* Category Tag */}
          <span className="text-[9px] uppercase tracking-[1.5px] text-brand-gold font-bold">
            {product.category}
          </span>
          
          {/* Title */}
          <h3 
            onClick={handleQuickView}
            className="font-serif text-sm sm:text-base font-normal text-brand-forest hover:text-brand-gold transition-colors duration-200 cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center text-brand-gold">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? "fill-brand-gold" : "text-brand-sand"}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-[#5A5A5A] font-sans">
              ({product.reviewsCount})
            </span>
          </div>
        </div>

        {/* Price and Cart Quick button */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-brand-sand/35">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-brand-forest">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-[#5A5A5A] line-through font-medium">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="text-[10px] uppercase tracking-[1px] font-bold text-brand-gold hover:text-brand-forest flex items-center gap-1 transition-colors duration-200"
          >
            <span className="hover:underline">Add to Bag</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}