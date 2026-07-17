import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TESTIMONIALS, PRODUCTS } from "../data";
import { Testimonial } from "../types";
import { Star, MessageSquare, Check, ShieldCheck } from "lucide-react";
import { fetchReviewsFromSupabase, saveReviewToSupabase, isSupabaseConfigured } from "../lib/supabase";

export default function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    role: "",
    text: "",
    rating: 5,
    productName: PRODUCTS[0].name // Dynamically set default to the first product
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Load reviews from Supabase, fallback to local data if not configured or fetch fails
    const loadReviews = async () => {
      if (isSupabaseConfigured) {
        const dbReviews = await fetchReviewsFromSupabase();
        if (dbReviews && dbReviews.length > 0) {
          const mapped: Testimonial[] = dbReviews.map((r: any) => ({
            id: r.id,
            name: r.name,
            role: r.role || "Verified Collector",
            rating: r.rating,
            text: r.text,
            avatar: r.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            date: r.date,
            verified: r.verified ?? true,
            productName: r.product_name
          }));
          setReviews(mapped);
          return;
        }
      }
      // Fallback to static data
      setReviews(TESTIMONIALS);
    };

    loadReviews();
  }, []);

  const handleRatingSelect = (rate: number) => {
    setNewReview((prev) => ({ ...prev, rating: rate }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    setIsSubmitting(true);

    const addedReview: Testimonial = {
      id: `rev-${Date.now()}`,
      name: newReview.name,
      role: newReview.role || "Verified Collector",
      rating: newReview.rating,
      text: newReview.text,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      verified: true,
      productName: newReview.productName
    };

    // Save to Supabase
    await saveReviewToSupabase(addedReview);

    // Update local state
    setReviews((prev) => [addedReview, ...prev]);
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setShowForm(false);
      setNewReview({
        name: "",
        role: "",
        text: "",
        rating: 5,
        productName: PRODUCTS[0].name
      });
    }, 2000);
  };

  return (
    <section id="reviews" className="py-24 bg-brand-ivory/60 border-b border-brand-sand/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[2px] font-bold text-[#C9A76A] font-sans block">
              Collector Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
              What Our Collectors Say
            </h2>
            <div className="w-12 h-[1px] bg-[#C9A76A]/40" />
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-white hover:bg-brand-forest/5 text-[#C9A76A] border border-[#C9A76A] rounded-[2px] text-xs font-bold uppercase tracking-[1px] shadow-xs transition-all duration-300 flex items-center gap-2 cursor-pointer ml-auto md:ml-0"
          >
            <MessageSquare className="w-4 h-4 text-[#C9A76A]" />
            <span>Write A Review</span>
          </button>
        </div>

        {/* Sliding Review form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-16 overflow-hidden"
            >
              <div className="bg-white rounded-[2px] p-6 sm:p-8 border border-brand-sand/60 shadow-xs max-w-2xl mx-auto">
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A] mb-4">Share Your Experience</h3>
                
                {isSubmitted ? (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-10 h-10 bg-[#FAF8F5] text-[#C9A76A] rounded-[2px] flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-base font-normal text-[#1A1A1A]">Review Published</h4>
                    <p className="text-xs text-[#5A5A5A]">Thank you for supporting handcrafted luxury resin crafts!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={newReview.name}
                          onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                          placeholder="Charlotte Stone"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Profession / Title</label>
                        <input
                          type="text"
                          value={newReview.role}
                          onChange={(e) => setNewReview(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                          placeholder="Art Connoisseur (optional)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Product Purchased</label>
                        <select
                          value={newReview.productName}
                          onChange={(e) => setNewReview(prev => ({ ...prev, productName: e.target.value }))}
                          className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] cursor-pointer"
                        >
                          {/* Dynamically map products from data.ts */}
                          {PRODUCTS.map((product) => (
                            <option key={product.id} value={product.name}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Overall Rating</label>
                        <div className="flex items-center gap-1.5 py-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingSelect(star)}
                              className="text-[#C9A76A] hover:scale-105 transition-transform"
                            >
                              <Star 
                                className={`w-6 h-6 ${
                                  star <= newReview.rating 
                                    ? "fill-[#C9A76A] text-[#C9A76A]" 
                                    : "text-brand-sand"
                                  }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Review</label>
                      <textarea
                        required
                        rows={3}
                        value={newReview.text}
                        onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                        className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                        placeholder="Detail your thoughts regarding the glassy finish, colors, wood quality, and packaging..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#C9A76A] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] cursor-pointer shadow-xs hover:bg-[#bfa065] transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Publishing..." : "Publish Verified Review"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Testimonials Review Feed Horizontally Scrollable Row */}
        <div className="relative">
          {/* Scrollable Container */}
          <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-10 pt-4 snap-x snap-mandatory scroll-smooth pr-20 sm:pr-28 lg:pr-36 scrollbar-hide">
            {reviews.map((rev) => (
              <motion.div
                layout
                key={rev.id}
                className="w-[280px] sm:w-[380px] md:w-[440px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 lg:p-8 rounded-[2px] border border-brand-sand/40 hover:border-[#C9A76A]/60 shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Verified badge and product title */}
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#C9A76A]">
                      <ShieldCheck className="w-4 h-4 text-[#C9A76A]" />
                      Verified Collector
                    </span>
                    <span className="text-[#5A5A5A]/80 font-medium italic truncate max-w-[120px] sm:max-w-[200px]">{rev.productName}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center text-[#C9A76A]">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < rev.rating ? "fill-[#C9A76A] text-[#C9A76A]" : "text-brand-sand"}`} 
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="font-serif text-sm sm:text-base text-[#1A1A1A] leading-relaxed italic line-clamp-4 sm:line-clamp-none">
                    "{rev.text}"
                  </p>
                </div>

                {/* Reviewer bio */}
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-brand-sand/40">
                  <div className="w-11 h-11 rounded-[2px] overflow-hidden border border-brand-sand flex-shrink-0">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-normal text-[#1A1A1A]">{rev.name}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5A5A5A] font-sans">
                      <span>{rev.role}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Elegant Fade Glass Blur at Right End */}
          <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent pointer-events-none z-20 backdrop-blur-[1px]" />
        </div>

      </div>
    </section>
  );
}