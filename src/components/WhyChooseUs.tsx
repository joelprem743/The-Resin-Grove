import React from "react";
import { motion } from "motion/react";
import { 
  Heart, 
  Crown, 
  Settings, 
  ShieldCheck, 
  Truck, 
  Leaf 
} from "lucide-react";

export default function WhyChooseUs() {
  const coreValues = [
    {
      title: "Handmade with Love",
      desc: "Every single item is individually designed, mixed, poured, and sanded by our skilled studio artisans. No mass factories.",
      icon: Heart
    },
    {
      title: "Premium Quality Resin",
      desc: "We use only high-grade, non-yellowing, optical-quality eco-resin with advanced UV filters for archival preservation.",
      icon: Crown
    },
    {
      title: "Personalized Designs",
      desc: "Customize resin colors, wood species, and laser engravings. Choose botanical inserts or preserve your own memories.",
      icon: Settings
    },
    {
      title: "Secure Payments",
      desc: "Shop with absolute peace of mind. We use industry-standard bank-level 256-bit encryption for all purchases.",
      icon: ShieldCheck
    },
    {
      title: "Fast Shipping",
      desc: "We package each glasslike art piece inside double-walled foam cases to guarantee undamaged rapid courier transit.",
      icon: Truck
    },
    {
      title: "Eco-Friendly Packaging",
      desc: "We care about nature. Our gift boxes are crafted using recycled pulp, soy-based inks, and biodegradable lavender straws.",
      icon: Leaf
    }
  ];

  return (
    <section className="py-24 bg-brand-ivory relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[20%] left-[-10%] w-[25vw] h-[25vw] bg-brand-sage/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30vw] h-[30vw] bg-brand-sand/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[2px] font-bold text-[#C9A76A] font-sans block">
            Our Studio Values
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Why Choose The Resin Grove
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A76A]/40 mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-xl mx-auto">
            From raw materials selection to finishing glazes, discover the standards that define our artisan boutique.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
          {coreValues.map((value, idx) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2px] border border-brand-sand/40 hover:border-[#C9A76A]/60 shadow-xs transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Icon Container with subtle glow */}
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#FAF8F5] text-[#C9A76A] rounded-[2px] flex items-center justify-center mb-4 sm:mb-6 transition-colors duration-300">
                    <Icon className="w-4.5 h-4.5 sm:w-6 sm:h-6 group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xs sm:text-base lg:text-lg font-normal text-[#1A1A1A] leading-snug">
                      {value.title}
                    </h3>
                    <p className="font-sans text-[10px] sm:text-xs lg:text-sm text-[#5A5A5A] leading-relaxed">
                      {value.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
