import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Sparkles, 
  Compass, 
  Info, 
  MessageSquare, 
  Mail,
  Flame
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import logoImg from "../assets/images/resin_grove_logo_1783539346251.jpg";

export default function Navbar() {
  const { 
    cart, 
    wishlist, 
    setCartOpen, 
    setWishlistOpen, 
    setAccountOpen,
    searchTerm,
    setSearchTerm,
    setSelectedCategory
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: "Home", href: "#home", icon: Compass },
    { name: "Shop", href: "#shop", icon: Flame },
    { name: "Categories", href: "#categories", icon: Sparkles },
    { name: "Custom Builder", href: "#custom-builder", icon: Sparkles },
    { name: "Reviews", href: "#reviews", icon: MessageSquare },
    { name: "Contact", href: "#contact", icon: Mail },
  ];

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href === "#shop") {
      setSelectedCategory("All");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled 
            ? "glass-navbar py-3 shadow-xs" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a 
              href="#home" 
              className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
              id="nav-logo"
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-brand-forest/5 group-hover:bg-brand-forest/10 transition-all duration-500 overflow-hidden border border-brand-sand/30">
                {/* Beautiful Watercolor Wreath Logo Image */}
                <img 
                  src={logoImg} 
                  alt="The Resin Grove Logo" 
                  className="w-full h-full object-cover scale-[1.42] transition-transform duration-500 group-hover:scale-[1.52] group-hover:rotate-12"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 rounded-full border border-brand-gold/15 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif text-lg sm:text-2xl font-semibold tracking-[0.04em] text-brand-forest group-hover:text-[#C9A76A] transition-colors duration-500 whitespace-nowrap leading-none">
                  The Resin Grove
                </span>
                <span className="text-[8px] sm:text-[9.5px] uppercase tracking-[0.3em] text-[#C9A76A]/90 font-sans font-semibold mt-1">
                  Artisan Boutique
                </span>
              </div>
            </a>

            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className="font-sans text-sm font-medium tracking-wide text-brand-forest/80 hover:text-brand-gold transition-colors duration-300 relative py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Interaction icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop-only action items */}
              <div className="hidden lg:flex items-center gap-2 sm:gap-4">
                {/* Search input bar */}
                <div className="relative flex items-center">
                  <AnimatePresence>
                    {isSearchExpanded && (
                      <motion.input
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 180, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        type="text"
                        placeholder="Search art pieces..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-brand-ivory/90 border border-brand-sand rounded-full py-1 px-4 pr-8 text-xs text-brand-forest placeholder-brand-forest/40 focus:outline-hidden focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                      />
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="p-2 rounded-full hover:bg-brand-forest/5 text-brand-forest hover:text-brand-gold transition-colors duration-300 relative"
                    aria-label="Search items"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => setWishlistOpen(true)}
                  className="p-2 rounded-full hover:bg-brand-forest/5 text-brand-forest hover:text-brand-gold transition-colors duration-300 relative"
                  aria-label="Open Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 bg-brand-gold text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </button>

                {/* Shopping Cart Button */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="p-2 rounded-full hover:bg-brand-forest/5 text-brand-forest hover:text-brand-gold transition-colors duration-300 relative"
                  aria-label="Open Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalCartItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-forest text-brand-ivory text-[9px] font-bold rounded-full flex items-center justify-center border border-brand-ivory"
                    >
                      {totalCartItems}
                    </motion.span>
                  )}
                </button>

                {/* Account Button */}
                <button
                  onClick={() => setAccountOpen(true)}
                  className="p-2 rounded-full hover:bg-brand-forest/5 text-brand-forest hover:text-brand-gold transition-colors duration-300"
                  aria-label="User Account"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button - Hamburger icon with cart item count badge */}
              <div className="lg:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-full hover:bg-brand-forest/5 text-brand-forest hover:text-brand-gold transition-colors duration-300 relative"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  {!isMobileMenuOpen && totalCartItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-forest text-brand-ivory text-[9px] font-bold rounded-full flex items-center justify-center border border-brand-ivory z-10"
                    >
                      {totalCartItems}
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[60px] sm:top-[72px] bg-[#FAF8F5]/98 backdrop-blur-md z-30 shadow-lg border-b border-brand-sand block lg:hidden max-h-[calc(100vh-72px)] overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-4 max-w-7xl mx-auto">
              
              {/* Dynamic Search Bar inside Mobile Dropdown */}
              <div className="px-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#C9A76A]" />
                  <input
                    type="text"
                    placeholder="Search bespoke art pieces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-brand-sand rounded-[2px] py-2.5 pl-10 pr-4 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A] focus:border-[#C9A76A]"
                  />
                </div>
              </div>

              {/* Action Operations listed vertically */}
              <div className="space-y-1 px-2">
                
                {/* Mobile Shopping Bag Trigger with number beside the cart */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between py-3 border-b border-brand-sand/30 text-[#1A1A1A] font-medium text-sm transition-colors duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-[#C9A76A]" />
                    <span>Shopping Bag</span>
                    {totalCartItems > 0 && (
                      <span className="bg-brand-forest text-brand-ivory text-[10px] px-2.5 py-0.5 rounded-[2px] font-bold">
                        {totalCartItems}
                      </span>
                    )}
                  </div>
                  {totalCartItems > 0 ? (
                    <span className="text-xs text-[#C9A76A] font-bold font-mono">
                      ₹{cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-[#5A5A5A]/50 font-mono">Empty</span>
                  )}
                </button>

                {/* Mobile Wishlist Trigger */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setWishlistOpen(true);
                  }}
                  className="w-full flex items-center justify-between py-3 border-b border-brand-sand/30 text-[#1A1A1A] font-medium text-sm transition-colors duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-[#C9A76A]" />
                    <span>Wishlist Keepsakes</span>
                  </div>
                  {wishlist.length > 0 ? (
                    <span className="bg-[#C9A76A] text-white text-[10px] px-2.5 py-0.5 rounded-[2px] font-bold">
                      {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
                    </span>
                  ) : (
                    <span className="text-xs text-[#5A5A5A]/50 font-mono">Empty</span>
                  )}
                </button>

                {/* Mobile Account Profile Trigger */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAccountOpen(true);
                  }}
                  className="w-full flex items-center justify-between py-3 text-[#1A1A1A] font-medium text-sm transition-colors duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#C9A76A]" />
                    <span>My Account & Orders</span>
                  </div>
                  <span className="text-[10px] text-[#C9A76A] uppercase tracking-wider font-bold font-sans">View</span>
                </button>

              </div>

              {/* Elegant Section Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brand-sand/50"></div>
                <span className="flex-shrink mx-4 text-[9px] uppercase tracking-widest text-[#C9A76A] font-bold">Navigation</span>
                <div className="flex-grow border-t border-brand-sand/50"></div>
              </div>

              {/* Navigation Links Grid for Compact Reachability */}
              <div className="grid grid-cols-2 gap-2 px-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className="flex items-center gap-2.5 p-3 rounded-[2px] hover:bg-brand-forest/5 text-brand-forest font-medium text-xs transition-colors duration-200 border border-brand-sand/20 bg-white"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#C9A76A]" />
                      <span className="text-[#1A1A1A]">{link.name}</span>
                    </a>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
