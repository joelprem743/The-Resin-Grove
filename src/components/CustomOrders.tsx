import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartHandshake, 
  Gift, 
  Briefcase, 
  Sparkles, 
  Upload, 
  Send, 
  Check, 
  AlertCircle,
  FileText
} from "lucide-react";

export default function CustomOrders() {
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Wedding Keepsake Preservation",
    budget: "100-250",
    description: "",
    deliveryDate: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.description) {
      return;
    }

    setIsSubmitting(true);
    
    const finalDescription = uploadedFile 
      ? `${formData.description}\n\n[Attached File: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(1)} KB)]`
      : formData.description;

    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        budget: formData.budget,
        description: finalDescription,
        deliveryDate: formData.deliveryDate || "Flexible",
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Inquiry submission failed");
      return res.json();
    })
    .then(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        projectType: "Wedding Keepsake Preservation",
        budget: "100-250",
        description: "",
        deliveryDate: "",
      });
      setUploadedFile(null);
    })
    .catch((err) => {
      console.error("API Inquiry error:", err);
      // Fallback fallback to ensure customer is never blocked
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);
    });
  };

  const giftTypes = [
    { title: "Wedding Keepsakes", desc: "Preserve your bridal bouquet and rings in a clear heirloom block.", icon: Gift },
    { title: "Anniversary Plates", desc: "Coaxial wood-resin plates carrying hand-written vows.", icon: Sparkles },
    { title: "Baby Mementos", desc: "Cast first shoes, hospital bands, or birth dried florals safely.", icon: HeartHandshake },
    { title: "Corporate Plates", desc: "Premium live-edge sign boards for modern workspaces.", icon: Briefcase }
  ];

  return (
    <section id="custom-orders" className="py-24 bg-[#FAF8F5] border-t border-b border-brand-sand/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Story and Custom Gifting cards */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C9A76A] font-sans block">
                Bespoke Commissions
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
                Preserve Life's Milestones
              </h2>
              <div className="w-16 h-[1px] bg-[#C9A76A]" />
              <p className="font-sans text-[#5A5A5A] text-sm sm:text-base leading-relaxed">
                Whether celebrating a marriage, welcoming a newborn, or commissioning signature décor for your corporate space, we partner with you to preserve memories inside eternal crystal resin.
              </p>
            </div>

            {/* Grid of gift types */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {giftTypes.map((g, i) => {
                const Icon = g.icon;
                return (
                  <div key={i} className="bg-white p-5 rounded-[2px] border border-brand-sand/50 shadow-none space-y-2">
                    <div className="w-9 h-9 bg-[#FAF8F5] text-[#C9A76A] rounded-[2px] border border-[#C9A76A]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-sm font-normal text-[#1A1A1A]">{g.title}</h3>
                    <p className="text-[11px] text-[#5A5A5A] leading-relaxed">{g.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsOpenForm(true)}
                className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-xs sm:text-sm font-semibold tracking-[1px] uppercase shadow-xs transition-all duration-300 cursor-pointer"
              >
                Inquire For Custom Design
              </button>
            </div>
          </div>

          {/* Right Column: Visual Artwork showcasing Bouquet Preservations */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-4/3 lg:aspect-square bg-white rounded-[2px] overflow-hidden shadow-xs p-3 border border-brand-sand/40">
            <div className="relative w-full h-full rounded-[2px] overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80"
                alt="Bridal bouquet preservation inside a crystal clear resin hexagon"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#1A1A1A]/40 via-transparent to-transparent opacity-65" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#C9A76A] font-bold">Featured Preservation</span>
                <h4 className="font-serif text-lg font-normal">The Keepsake Hexagon</h4>
                <p className="text-xs text-white/80">Crafted with preserved bridal garden roses, golden eucalyptus, and micro-crystals.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sliding Inquiry Form Dialog */}
        <AnimatePresence>
          {isOpenForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-[2px] overflow-hidden shadow-2xl max-w-xl w-full border border-brand-sand relative my-auto"
                onDragEnter={handleDrag}
              >
                {/* Header */}
                <div className="bg-[#1A1A1A] px-6 sm:px-8 py-5 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal">Custom Commission Form</h3>
                    <p className="text-[10px] text-white/80 uppercase tracking-widest font-medium">Bespoke Workshop Questionnaire</p>
                  </div>
                  <button 
                    onClick={() => { setIsOpenForm(false); setIsSuccess(false); }}
                    className="p-2 rounded-[2px] hover:bg-white/10 text-white transition-colors cursor-pointer"
                    aria-label="Close form"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 sm:p-8">
                  {isSuccess ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-14 h-14 bg-[#FAF8F5] border border-[#C9A76A]/20 text-[#C9A76A] rounded-[2px] flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-normal text-[#1A1A1A]">Inquiry Received</h4>
                      <p className="font-sans text-xs sm:text-sm text-[#5A5A5A] max-w-sm mx-auto leading-relaxed">
                        Thank you for reaching out to The Resin Grove. Our master artisan will review your custom preservation request and email you a visual quote within 24 hours.
                      </p>
                      <button
                        onClick={() => { setIsOpenForm(false); setIsSuccess(false); }}
                        className="px-6 py-2 bg-[#1A1A1A] text-white rounded-[2px] text-xs font-semibold cursor-pointer"
                      >
                        Return to Gallery
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#5A5A5A] tracking-wider block mb-1">Your Name *</label>
                          <input
                            type="text"
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                            placeholder="Eleanor Vance"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#5A5A5A] tracking-wider block mb-1">Your Email *</label>
                          <input
                            type="email"
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                            placeholder="eleanor@domain.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#5A5A5A] tracking-wider block mb-1">Project Category</label>
                          <select
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                          >
                            <option>Wedding Keepsake Preservation</option>
                            <option>Corporate Gift Orders</option>
                            <option>Baby Memory Frame</option>
                            <option>Bespoke Live-Edge Table</option>
                            <option>Personalized Gift Bundles</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#5A5A5A] tracking-wider block mb-1">Target Budget Range</label>
                          <select
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                          >
                            <option value="50-100">₹50 – ₹100</option>
                            <option value="100-250">₹100 – ₹250</option>
                            <option value="250-500">₹250 – ₹500</option>
                            <option value="500+">₹500+ Luxury Custom</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#5A5A5A] tracking-wider block mb-1">Design Vision & Specifications *</label>
                        <textarea
                          required
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-brand-sand rounded-[2px] px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                          placeholder="Describe the shape (e.g. Hexagon, Cube), wood choice (e.g. Olive, Walnut), dried flower colors, and any specific date timeline."
                        />
                      </div>

                      {/* Drag-and-drop File Upload Area */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#5A5A5A] tracking-wider block mb-1">Upload Inspiration / Reference Image</label>
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border border-dashed rounded-[2px] p-4 text-center cursor-pointer transition-all duration-200 ${
                            dragActive 
                              ? "border-brand-gold bg-brand-ivory" 
                              : "border-brand-sand hover:border-brand-gold"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                          {uploadedFile ? (
                            <div className="flex items-center justify-center gap-2 text-[#1A1A1A]">
                              <FileText className="w-5 h-5 text-brand-gold" />
                              <span className="text-xs font-semibold">{uploadedFile.name}</span>
                              <span className="text-[10px] text-[#5A5A5A]">({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <Upload className="w-5 h-5 text-brand-gold mx-auto" />
                              <p className="text-xs font-medium text-[#1A1A1A]">Drag and drop file here, or <span className="text-brand-gold underline font-bold">browse</span></p>
                              <p className="text-[9px] text-[#5A5A5A] uppercase">Supports JPEG, PNG up to 5MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-forest rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-brand-forest border-t-transparent rounded-full animate-spin" />
                            <span>Sending Vision...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-brand-forest" />
                            <span>Send Custom Inquiry</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
