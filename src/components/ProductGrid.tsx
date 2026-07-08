import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PRODUCTS, CATEGORIES } from "../data";
import { useShop } from "../context/ShopContext";
import ProductCard from "./ProductCard";
import { SlidersHorizontal, ArrowUpDown, RefreshCw, X } from "lucide-react";

export default function ProductGrid() {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    searchTerm, 
    setSearchTerm 
  } = useShop();

  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [priceRange, setPriceRange] = useState<number>(200);

  // Category list including "All"
  const categoriesList = useMemo(() => {
    return ["All", ...CATEGORIES.map(c => c.name)];
  }, []);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = 
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price <= priceRange;

      return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // "featured" (default array order)
    });
  }, [selectedCategory, searchTerm, sortBy, priceRange]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setSortBy("featured");
    setPriceRange(200);
  };

  return (
    <section id="shop" className="py-24 bg-brand-ivory/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[2px] font-bold text-brand-gold font-sans block">
              Artisan Catalog
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-brand-forest">
              Explore Our Collection
            </h2>
            <div className="w-12 h-[1px] bg-brand-gold/40" />
          </div>

          {/* Sorting & Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-[2px] border border-brand-sand/60 text-xs font-semibold text-brand-forest shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden text-brand-forest cursor-pointer"
              >
                <option value="featured">Featured Masterpieces</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Price slider overlay button */}
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-[2px] border border-brand-sand/60 text-xs font-semibold text-brand-forest shadow-xs">
              <span className="text-brand-gold font-bold">Max Price:</span>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-24 accent-brand-gold cursor-pointer"
              />
              <span className="min-w-[45px] text-right font-mono text-brand-forest font-bold font-sans">₹{priceRange}</span>
            </div>
          </div>
        </div>

        {/* Categories Tab Navigation Bar */}
        <div className="mb-12 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max border-b border-brand-sand/40 pb-2">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 text-xs font-bold tracking-[1px] uppercase transition-all duration-300 rounded-[2px] ${
                    isActive
                      ? "border border-brand-gold text-brand-gold bg-white shadow-xs"
                      : "border border-transparent text-[#5A5A5A] hover:text-brand-gold"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== "All" || searchTerm || priceRange < 200) && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs font-semibold text-brand-forest/60 mr-2">Active filters:</span>
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-forest/5 text-brand-forest text-xs font-semibold rounded-full border border-brand-forest/10">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="hover:text-brand-gold">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-forest/5 text-brand-forest text-xs font-semibold rounded-full border border-brand-forest/10">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="hover:text-brand-gold">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceRange < 200 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-forest/5 text-brand-forest text-xs font-semibold rounded-full border border-brand-forest/10">
                Under ₹{priceRange}
                <button onClick={() => setPriceRange(200)} className="hover:text-brand-gold">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-brand-gold hover:text-brand-forest underline ml-auto flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset All
            </button>
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-white rounded-3xl border border-brand-sand/50 shadow-xs max-w-xl mx-auto space-y-4"
            >
              <div className="w-16 h-16 bg-brand-sand/20 text-brand-gold rounded-full flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-forest">
                No matching masterworks found
              </h3>
              <p className="font-sans text-xs sm:text-sm text-brand-forest/70 max-w-sm mx-auto leading-relaxed">
                We couldn't find any items matching your exact search terms or criteria. Try resetting filters to view our standard collection.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-brand-forest text-brand-ivory hover:text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                Show All Products
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
