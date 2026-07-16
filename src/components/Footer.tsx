import React from "react";
import { Compass, Sparkles, Shield, Heart } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Footer() {
  const { setAdminOpen } = useShop();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8 border-t border-brand-sand/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Info (4 Columns) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#home" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-[2px] bg-white/5">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#C9A76A] stroke-current fill-none stroke-1.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" className="text-[#C9A76A]" />
                </svg>
              </div>
              <span className="font-serif text-lg font-normal tracking-[1px] text-white">The Resin Grove</span>
            </a>
            <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">
              We translate nature’s flowing beauty into crystal-clear resin art. Handmade with love, wood, and botanical inclusions inside our sunny studio in Portland, Oregon.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-[10px] text-[#C9A76A] font-bold uppercase tracking-[1px]">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Non-Toxic</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1 text-[10px] text-[#C9A76A] font-bold uppercase tracking-[1px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Food-Safe Cert</span>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Links (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-xs font-bold tracking-[1.5px] uppercase text-[#C9A76A]">The Boutique</h4>
            <ul className="space-y-2 text-xs text-[#A0A0A0]">
              <li><a href="#shop" className="hover:text-white transition-colors duration-200">Featured Art</a></li>
              <li><a href="#categories" className="hover:text-white transition-colors duration-200 font-bold text-[#C9A76A]">Shop Categories</a></li>
              <li><a href="#bestsellers" className="hover:text-white transition-colors duration-200">Best Sellers</a></li>
            </ul>
          </div>

          {/* Column 3: Categories Links (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-xs font-bold tracking-[1.5px] uppercase text-[#C9A76A]">Handcrafted Mediums</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[#A0A0A0]">
              <li><a href="#shop" className="hover:text-white transition-colors duration-200">Keychains</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors duration-200">Photo Frames</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors duration-200 font-bold">Wall Clocks</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors duration-200">Serving Trays</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors duration-200 text-[#C9A76A] font-bold">Resin Jewelry</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors duration-200">Bookmarks</a></li>
            </ul>
          </div>

          {/* Column 4: Client Care (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-xs font-bold tracking-[1.5px] uppercase text-[#C9A76A]">Collector Support</h4>
            <ul className="space-y-2 text-xs text-[#A0A0A0]">
              <li><a href="#contact" className="hover:text-white transition-colors duration-200">Inquire About Shipping</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors duration-200">Submit Review</a></li>
              <li><a href="#custom-orders" className="hover:text-white transition-colors duration-200">Special Bouquets FAQ</a></li>
              <li><span className="text-[#C9A76A] font-medium">Eco Resin Caring Guide</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#A0A0A0] gap-4">
          <div className="flex items-center gap-1">
            <span>© {currentYear} The Resin Grove. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-sans font-medium uppercase tracking-[1.5px] text-[#C9A76A] bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-[2px]">
            <span>Nature meets Art</span>
            <Compass className="w-3.5 h-3.5" />
            <span>Handmade with</span>
            <Heart className="w-3 h-3 fill-red-400 text-red-400 animate-pulse" />
          </div>
        </div>

      </div>
    </footer>
  );
}
