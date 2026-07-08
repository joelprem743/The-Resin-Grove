import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Check, 
  Instagram, 
  Facebook, 
  Youtube,
  Globe
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate contact form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      setTimeout(() => setIsSuccess(false), 4000);
    }, 1500);
  };

  const studioInfo = [
    { label: "Direct Phone", detail: "+1 (503) 555-0142", icon: Phone },
    { label: "Studio Email", detail: "hello@theresingrove.com", icon: Mail },
    { label: "Working Hours", detail: "Monday – Saturday, 9:00 AM – 6:00 PM PST", icon: Clock }
  ];

  return (
    <section id="contact" className="py-24 bg-brand-ivory relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-[2px] font-bold text-[#C9A76A] font-sans block">
            Studio Touchpoints
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Connect with Us
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A76A]/40 mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-xl mx-auto">
            Have a question about a piece, a custom order, or our bouquet drying service? Reach out to our studio team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Side: Contact Information & Studio Consultation (7 Columns) */}
          <div className="lg:col-span-7 space-y-8 flex flex-col justify-between">
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {studioInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <div key={idx} className="bg-white p-5 rounded-[2px] border border-brand-sand/40 flex flex-col justify-between shadow-xs">
                    <div className="w-9 h-9 bg-[#FAF8F5] text-[#C9A76A] rounded-[2px] flex items-center justify-center flex-shrink-0 mb-3">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[9px] uppercase font-bold text-[#C9A76A] tracking-wider">{info.label}</h4>
                      <p className="text-xs text-[#1A1A1A] font-medium leading-relaxed break-all">{info.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stylized Digital Consultation Feature Card */}
            <div className="relative p-6 sm:p-8 rounded-[2px] overflow-hidden bg-white border border-[#C9A76A]/30 shadow-xs flex-grow flex flex-col justify-center space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#C9A76A_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
              
              <div className="flex items-center gap-2 text-[#C9A76A]">
                <Globe className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-[2px]">Seamless Global Delivery</span>
              </div>

              <h3 className="font-serif text-lg sm:text-xl font-normal text-[#1A1A1A] leading-tight">
                Crafted in Our Studio, Delivered to Your Door
              </h3>

              <p className="font-sans text-xs text-[#5A5A5A] leading-relaxed max-w-xl">
                We design and handcraft each custom resin masterpiece directly in our secure studio environment. By coordinating our orders digitally and via direct studio email, we maintain low overhead, secure individual attention to your design, and ship with insured express delivery globally.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-[10px] uppercase font-bold tracking-wider text-[#C9A76A]">
                <span>✓ Insured Premium Freight</span>
                <span>✓ Photoreal Progress Proofs</span>
                <span>✓ 100% Quality Inspected</span>
              </div>
            </div>

          </div>

          {/* Right Side: Message form (5 Columns) */}
          <div className="lg:col-span-5 bg-white p-8 sm:p-10 rounded-[2px] border border-brand-sand/50 shadow-xs flex flex-col justify-between">
            <div className="space-y-6 flex-grow">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-[#1A1A1A]">Send A Message</h3>
                <p className="text-xs text-[#5A5A5A]">We'll get back to you within one business day.</p>
              </div>

              {isSuccess ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-[#FAF8F5] text-[#C9A76A] rounded-[2px] flex items-center justify-center mx-auto border border-[#C9A76A]/20">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-base font-normal text-[#1A1A1A]">Message Dispatched</h4>
                  <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                    Thank you for writing. Our studio coordinator will connect with you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                      placeholder="Diana Prince"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Email Address *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                      placeholder="diana@domain.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                      placeholder="Custom geode coaster set query"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5A5A5A] block mb-1">Your Message *</label>
                    <textarea
                      required
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-brand-ivory/50 border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                      placeholder="Write your questions or notes here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Social channels bottom */}
            <div className="pt-6 border-t border-brand-sand/50 flex justify-between items-center text-[#5A5A5A] text-xs">
              <span>Find us on social:</span>
              <div className="flex gap-3">
                <a href="https://instagram.com" className="p-2 rounded-[2px] hover:bg-[#FAF8F5] text-[#1A1A1A] hover:text-[#C9A76A] transition-colors duration-200 border border-transparent hover:border-[#C9A76A]/20">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" className="p-2 rounded-[2px] hover:bg-[#FAF8F5] text-[#1A1A1A] hover:text-[#C9A76A] transition-colors duration-200 border border-transparent hover:border-[#C9A76A]/20">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" className="p-2 rounded-[2px] hover:bg-[#FAF8F5] text-[#1A1A1A] hover:text-[#C9A76A] transition-colors duration-200 border border-transparent hover:border-[#C9A76A]/20">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
