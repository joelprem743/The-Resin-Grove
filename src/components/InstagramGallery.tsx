import React from "react";
import { motion } from "motion/react";
import { INSTAGRAM_IMAGES } from "../data";
import { Instagram, Heart, MessageCircle } from "lucide-react";

export default function InstagramGallery() {
  return (
    <section id="instagram" className="py-24 bg-brand-ivory/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[2px] font-bold text-brand-gold font-sans block">
            Digital Greenhouse
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-brand-forest">
            On the Grid: @TheResinGrove
          </h2>
          <div className="w-12 h-[1px] bg-brand-gold/40 mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-xl mx-auto">
            Take a peak inside our sunny Portland studio. Tag <span className="font-bold text-brand-gold">#TheResinGrove</span> on social to join our gallery of collectors.
          </p>
        </div>

        {/* Masonry or Square Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {INSTAGRAM_IMAGES.map((item, idx) => (
            <motion.a
              key={item.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="relative aspect-square rounded-[2px] overflow-hidden group shadow-xs transition-all duration-300 border border-brand-sand/30"
            >
              <img
                src={item.url}
                alt={`Instagram resin art model #${idx}`}
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />

              {/* Instagram hover layout mask */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white gap-2">
                <Instagram className="w-6 h-6 text-brand-gold mb-1" />
                <div className="flex items-center gap-3 text-xs font-semibold font-sans">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white text-white" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                    <span>{item.comments}</span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
