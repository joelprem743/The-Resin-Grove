import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Sparkles, Check, ArrowRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API registration call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail("");
    }, 1500);
  };

  return (
    <section className="py-24 bg-brand-ivory relative overflow-hidden border-y border-brand-sand/50">
      {/* Abstract floating gold resin blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[35vw] h-[35vw] bg-brand-sand/10 rounded-full blur-2xl pointer-events-none" />
 
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="space-y-8">
          
          {/* Sparkle badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase tracking-[1px]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>The Grove Chronicles</span>
          </div>
 
          <div className="space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-forest tracking-tight">
              Join Our Circle of Collectors
            </h2>
            <p className="font-sans text-[#5A5A5A] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Subscribe to receive private previews of our newest botanical pours, limited studio releases, and exclusive design tutorials.
            </p>
          </div>
 
          {/* Form / Success state */}
          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white p-6 rounded-[2px] border border-brand-sand text-center space-y-2 shadow-xs"
                >
                  <div className="w-10 h-10 bg-brand-ivory text-brand-gold rounded-[2px] flex items-center justify-center mx-auto border border-brand-gold/20">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-normal text-brand-forest">Welcome to the Grove</h3>
                  <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto">
                    Check your inbox soon. We've sent a 15% welcome savings gift code to thank you for subscribing.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row items-stretch gap-3"
                >
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5A5A5A]/50">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white hover:bg-brand-ivory focus:bg-white text-xs sm:text-sm text-brand-forest placeholder-[#5A5A5A]/50 border border-brand-sand focus:border-brand-gold focus:outline-hidden rounded-[2px] pl-11 pr-4 py-3.5 transition-all duration-300"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-forest font-bold text-xs uppercase tracking-[1px] rounded-[2px] shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-brand-forest border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[10px] text-[#5A5A5A]/70 font-medium">
            We value your privacy. Unsubscribe at any time. No spam, ever.
          </p>

        </div>
      </div>
    </section>
  );
}
