import React from "react";
import { motion } from "motion/react";
import { CATEGORIES } from "../data";
import { useShop } from "../context/ShopContext";
import { ArrowUpRight } from "lucide-react";

export default function CategorySection() {
  const { setSelectedCategory, selectedCategory } = useShop();

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // Smooth scroll down to the product showcase block
    const shopSection = document.getElementById("shop");
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      id="categories" 
      className="py-20 bg-brand-ivory/60 border-t border-b border-brand-sand/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] uppercase tracking-[2px] font-bold text-[#C9A76A] font-sans"
          >
            Artisan Collections
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]"
          >
            Shop by Artistic Medium
          </motion.h2>
          <div className="w-12 h-[1px] bg-[#C9A76A]/40 mx-auto" />
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-2xl mx-auto"
          >
            Every piece is uniquely poured, layering high-gloss glasslike resin with rustic natural elements to create timeless artifacts.
          </motion.p>
        </div>

        {/* Horizontal scrollable row on mobile, bento grid-inspired layout on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => handleCategorySelect(cat.name)}
                className="group cursor-pointer flex flex-col items-center"
              >
                {/* Rounded/Circular Image frame with glass outline */}
                <div 
                  className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden transition-all duration-500 p-1 bg-white shadow-md hover:shadow-xl group-hover:shadow-brand-gold/20 flex items-center justify-center ${
                    isSelected 
                      ? "ring-2 ring-brand-gold scale-105" 
                      : "ring-1 ring-brand-sand group-hover:scale-105"
                  }`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient slide up hover layer */}
                    <div className="absolute inset-0 bg-linear-to-t from-brand-forest/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-brand-ivory drop-shadow-sm transform -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                {/* Category label with elegant underlay */}
                <div className="text-center mt-4 space-y-1">
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-brand-forest group-hover:text-brand-gold transition-colors duration-300">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block text-[10px] text-brand-forest/60 max-w-[130px] mx-auto leading-normal opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {cat.description.substring(0, 50)}...
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
