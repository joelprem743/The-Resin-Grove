import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Compass, ShieldCheck } from "lucide-react";
import heroArt from "../assets/images/resin_hero_art_1783070133084.jpg";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-brand-ivory"
    >
      {/* Background Liquid Resin Blobs (Artistic glassmorphic blobs) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-sage/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-brand-sand/15 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -20, 10, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-brand-gold/5 blur-2xl"
        />
      </div>

      {/* Floating Botanical/Gilded Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute top-[20%] right-[12%] text-brand-gold/30"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24">
            <path d="M12 3v18M3 12h18" strokeWidth="0.5" strokeLinecap="round" />
            <path d="M5 5l14 14M19 5L5 19" strokeWidth="0.5" strokeLinecap="round" />
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] left-[8%] text-brand-sage/40"
          animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" opacity="0.1" />
            <path d="M17 8c.5-1.5-1-3-2.5-2.5-2 .5-3 2.5-3.5 4.5-.5-2-1.5-4-3.5-4.5C6 5 4.5 6.5 5 8c.5 2 2.5 3 4.5 3.5-2 .5-4 1.5-4.5 3.5-.5 1.5 1 3 2.5 2.5 2-.5 3-2.5 3.5-4.5.5 2 1.5 4 3.5 4.5 1.5.5 3-1 2.5-2.5-.5-2-2.5-3-4.5-3.5 2-.5 4-1.5 4.5-3.5z" />
          </svg>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-3 text-brand-gold text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-2">
                <span className="w-6 h-[1px] bg-brand-gold/40"></span>
                <span>Artisanal Resin & Woodwork</span>
                <span className="w-6 h-[1px] bg-brand-gold/40"></span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-normal text-[#1A1A1A] leading-[1.15]">
                Where <span className="italic font-normal text-brand-gold">Nature</span> Meets<br />
                <span className="italic font-normal text-brand-forest">Artistry</span> in Resin
              </h1>

              {/* Subheading Description */}
              <p className="font-sans text-sm sm:text-base text-[#5A5A5A] leading-relaxed max-w-xl">
                Discover handcrafted creations made with passion—from elegant botanical home d&eacute;cor to personalized keepsakes that are as unique as you.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <a
                  href="#shop"
                  className="px-8 py-4 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                {/* <a
                  href="#custom-builder"
                  className="px-8 py-4 bg-transparent hover:bg-brand-forest/5 border border-[#C9A76A] text-[#C9A76A] rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Custom Commissions</span>
                </a> */}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-8 border-t border-brand-sand/50">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-forest/70">
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>Food-Safe & Non-Toxic</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-forest/70">
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>UV-Resistant Glaze</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-forest/70">
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>Proudly Handmade</span>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Hero Right Media (Splendid Frame with Generated Resin Image & Minimalist Arched Aesthetic) */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative w-full max-w-lg aspect-square sm:aspect-4/3 lg:aspect-square rounded-t-[240px] rounded-b-none overflow-hidden shadow-xl bg-white border border-brand-sand/30 p-2"
            >
              {/* Inner container with Clean Minimalism fluid resin layers */}
              <div className="relative w-full h-full rounded-t-[232px] rounded-b-none overflow-hidden group">
                {/* Image */}
                <img
                  src={heroArt}
                  alt="Premium Handcrafted Ocean Wave Resin River Art Board"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Clean Minimalism Radial Gradient Overlays */}
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-55 bg-[radial-gradient(circle_at_30%_20%,#A5B69B,transparent_60%),radial-gradient(circle_at_70%_80%,#E8DDD2,transparent_60%)]" />
                
                {/* Floating Optical Resin Spheres */}
                <div className="absolute w-[100px] h-[100px] rounded-full bg-white/40 backdrop-blur-[10px] border border-white/80 top-[15%] left-[15%] pointer-events-none shadow-xs" />
                <div className="absolute w-[70px] h-[70px] rounded-full bg-[#A5B69B]/30 backdrop-blur-[5px] bottom-[20%] right-[15%] pointer-events-none" />

                {/* Overlaid Label */}
                <div className="absolute bottom-8 left-8 text-brand-forest font-serif italic text-base bg-white/70 backdrop-blur-xs py-1 px-4 rounded-full border border-white/40 shadow-xs">
                  "Ocean Drift" Series
                </div>

                {/* Aesthetic golden shimmer overlay reflex on image hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-linear-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full" />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}