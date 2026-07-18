import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";
import { 
  X, 
  User, 
  Crown, 
  Compass, 
  History, 
  Settings, 
  LogOut, 
  Loader, 
  Flame, 
  Database, 
  Mail, 
  Lock, 
  ArrowRight,
  Sparkles,
  Info,
  CreditCard
} from "lucide-react";

const STUDIO_UPI_ID = import.meta.env.VITE_STUDIO_UPI_ID || "6305472006@axl";

export default function AccountDrawer() {
  const { 
    isAccountOpen, 
    setAccountOpen, 
    user, 
    setUser, 
    isSupabaseConfigured, 
    showToast 
  } = useShop();

  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isSignUp) {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name || email.split("@")[0],
              }
            }
          });
          if (signUpError) throw signUpError;
          
          if (data.user && data.session) {
            setUser({
              id: data.user.id,
              email: data.user.email || "",
              name: data.user.user_metadata?.name || name || "Collector",
              isMock: false
            });
            showToast("Welcome to the Grove!", `Profile created for ${email}`);
          } else {
            setSuccess("Registration successful! Please check your email inbox to verify your account.");
          }
        } else {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (signInError) throw signInError;
          
          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || "",
              name: data.user.user_metadata?.name || "Collector",
              isMock: false
            });
            showToast("Welcome Back!", `Logged in as ${email}`);
          }
        }
      } catch (err: any) {
        setError(err.message || "An authentication error occurred.");
      } finally {
        setLoading(false);
      }
    } else {
      // Offline Demo Mode bypass if Supabase is not configured yet
      setTimeout(() => {
        setUser({
          id: "mock-user-777",
          email: email,
          name: name || email.split("@")[0] || "Joel Premtej",
          isMock: true
        });
        showToast("Logged In (Demo Mode)", `Bypassed authentication as ${email}`);
        setLoading(false);
      }, 600);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setLoading(false);
    showToast("Signed Out", "You have successfully signed out.");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (oauthError) throw oauthError;
      } catch (err: any) {
        setError(err.message || "An error occurred during Google Sign In.");
        setLoading(false);
      }
    } else {
      // Offline Demo Mode bypass
      setTimeout(() => {
        setUser({
          id: "google-mock-user-555",
          email: "google.collector@gmail.com",
          name: "Vanguard Google Collector",
          isMock: true,
        });
        showToast("Logged In with Google", "Simulated secure Google integration!");
        setLoading(false);
      }, 800);
    }
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "Curation Requested":
        return { stage: "Curation", step: 1, percent: 15, desc: "Order submitted, reviewing botanical specimens" };
      case "Botanical Layout":
        return { stage: "Layout", step: 2, percent: 35, desc: "Arranging specimens on organic wood base" };
      case "Resin Pouring":
      case "In Crafting":
        return { stage: "Pouring", step: 3, percent: 55, desc: "Bespoke handcrafting & layering premium epoxy resin" };
      case "Degassing / Curing":
        return { stage: "Curing", step: 4, percent: 75, desc: "Extracting microbubbles & heat-curing glass layer" };
      case "Polishing / Finish":
      case "Shipped":
        return { stage: "Polishing", step: 5, percent: 90, desc: "Precision polishing, applying natural oils & packaging for shipment" };
      case "Delivered":
        return { stage: "Delivered", step: 6, percent: 100, desc: "Your bespoke masterwork has arrived!" };
      default:
        return { stage: "Curation", step: 1, percent: 15, desc: "Order submitted, reviewing botanical specimens" };
    }
  };

  const fetchUserOrders = async (isInitialLoad = false) => {
    if (!user?.email) return;
    
    // Only show the loading spinner on the very first load, NOT on background polls
    if (isInitialLoad) setLoadingOrders(true);
    
    try {
      const res = await fetch(`/api/user/orders?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error loading user orders:", err);
    } finally {
      if (isInitialLoad) setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAccountOpen && user?.email) {
      // 1. Initial load (shows the spinner)
      fetchUserOrders(true);

      // 2. Set up a background polling interval (every 4 seconds)
      const interval = setInterval(() => {
        fetchUserOrders(false); // Pass 'false' so it doesn't trigger the spinner!
      }, 4000);

      // 3. Clean up the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [isAccountOpen, user?.email]);

  // Get ALL orders that are not yet delivered
  const activeOrders = orders.filter(o => o.status !== "Delivered");

  return (
    <AnimatePresence>
      {isAccountOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAccountOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Sliding Panel Container */}
        <div className="absolute inset-y-0 right-0 max-w-full flex sm:pl-10 pl-2">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="w-screen max-w-md bg-brand-ivory border-l border-brand-sand/55 flex flex-col justify-between shadow-2xl relative h-full selection:bg-brand-gold/30 selection:text-brand-forest"
          >
            {/* Header */}
            <div className="bg-brand-forest px-6 py-5.5 text-brand-ivory flex justify-between items-center border-b border-brand-sand/20 relative overflow-hidden shrink-0">
              {/* Subtle ambient gold reflection */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-2.5 relative z-10">
                <User className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-base sm:text-lg font-normal tracking-wide">
                  {user ? "Your Collector Profile" : "Collector Sanctuary"}
                </h3>
              </div>
              <button
                onClick={() => setAccountOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-brand-ivory transition-all cursor-pointer relative z-10"
                aria-label="Close account drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {!user ? (
                /* Auth Form */
                <div className="space-y-5">
                  {/* Poetic & Elegant Supabase Warning Node */}
                  {!isSupabaseConfigured && (
                    <div className="bg-white/90 border border-brand-gold/30 p-5 rounded-[2px] shadow-xs space-y-2.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 rounded-bl-full flex items-start justify-end p-2 text-brand-gold/40">
                        <Database className="w-4 h-4 animate-pulse" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-brand-forest text-xs font-bold uppercase tracking-[1.5px]">
                        <Database className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Cloud Preservation Pending</span>
                      </div>
                      
                      <p className="text-[11px] text-[#5A5A5A] leading-relaxed">
                        To enable persistent collector registration, safe checkouts, and database synchronizations, bind your <strong className="font-bold text-brand-forest">VITE_SUPABASE_URL</strong> and <strong className="font-bold text-brand-forest">VITE_SUPABASE_ANON_KEY</strong> secrets.
                      </p>
                      
                      <div className="text-[10px] text-brand-forest italic bg-[#FAF8F5] p-2.5 rounded-[1px] border border-brand-sand/40">
                        ✨ <strong className="font-bold">Live Studio Bypass:</strong> Feel free to enter any email below to instantly simulate a secure checkout profile!
                      </div>
                    </div>
                  )}

                  {isSupabaseConfigured && (
                    <div className="bg-green-50/60 border border-green-200/40 p-4 rounded-[2px] flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-green-900 uppercase tracking-widest block">Secure Database Node Active</span>
                        <span className="text-[11px] text-[#5A5A5A]">Artisan-to-Cloud synchronization active.</span>
                      </div>
                    </div>
                  )}

                  {/* Auth Card */}
                  <div className="bg-white p-6 rounded-[2px] border border-brand-sand/60 shadow-xs space-y-5">
                    <div className="text-center space-y-1.5">
                      <h4 className="font-serif text-base font-normal text-brand-forest tracking-wide">
                        {isSignUp ? "Create Gallery Profile" : "Access Your Curation"}
                      </h4>
                      <p className="text-[11px] text-[#5A5A5A] max-w-xs mx-auto leading-relaxed">
                        {isSignUp 
                          ? "Register to preserve custom live-edge designs and sync your bespoke bag across devices."
                          : "Sign in to synchronize your bespoke acquisitions dossier and orders."
                        }
                      </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-[2px] text-xs font-medium">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-[2px] text-xs font-medium leading-relaxed">
                          {success}
                        </div>
                      )}

                      {isSignUp && (
                        <div>
                          <label className="text-[9px] uppercase font-bold text-brand-forest tracking-wider block mb-1.5">Collector Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 w-4 h-4 text-brand-gold/70" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Elizabeth Bennett"
                              className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] pl-9.5 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-hidden focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[9px] uppercase font-bold text-brand-forest tracking-wider block mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 w-4 h-4 text-brand-gold/70" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="collector@resingrove.com"
                            className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] pl-9.5 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-hidden focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-brand-forest tracking-wider block mb-1.5">Secret Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-brand-gold/70" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] pl-9.5 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 focus:outline-hidden focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-brand-forest hover:bg-brand-forest/90 text-brand-ivory rounded-[2px] text-xs font-bold uppercase tracking-[1.5px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>{isSignUp ? "Register Portfolio" : "Secure Authentication"}</span>
                            <ArrowRight className="w-4 h-4 text-brand-gold" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center my-3.5">
                        <div className="flex-grow border-t border-brand-sand/40"></div>
                        <span className="mx-3 text-[10px] font-bold text-[#5A5A5A]/50 uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-brand-sand/40"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3 bg-white hover:bg-brand-ivory border border-brand-sand text-brand-forest rounded-[2px] text-xs font-bold uppercase tracking-[1.5px] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    </form>

                    <div className="text-center pt-3 border-t border-brand-sand/30">
                      <button
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setError("");
                          setSuccess("");
                        }}
                        className="text-xs text-brand-gold hover:text-brand-gold/80 font-bold transition-colors cursor-pointer"
                      >
                        {isSignUp 
                          ? "Already registered? Sign In Instead" 
                          : "New to the Studio? Create Account"
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Authenticated Workspace */
                <div className="space-y-5">
                  {/* VIP Membership Pass Card */}
                  <div className="bg-white p-6 rounded-[2px] border border-brand-sand/65 shadow-xs text-center space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 border-[3px] border-[#FAF8F5]/50 pointer-events-none" />
                    
                    {/* Golden Crest Badging */}
                    <div className="absolute top-0 right-0 bg-brand-gold/10 px-3 py-1.5 rounded-bl-[4px] text-[9px] uppercase tracking-widest text-[#C9A76A] font-bold border-l border-b border-[#C9A76A]/20">
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>{user.isMock ? "Guest Collector" : "Vanguard"}</span>
                      </span>
                    </div>

                    <div className="relative inline-block mt-2">
                      <div className="w-20 h-20 bg-[#FAF8F5] text-brand-forest rounded-full flex items-center justify-center mx-auto border-2 border-brand-gold/30 shadow-md">
                        <span className="font-serif text-2xl font-bold tracking-wide text-brand-forest">
                          {user.name ? user.name[0].toUpperCase() : "C"}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center" title="Session Authenticated">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A] tracking-wide">
                        {user.name || "Collector"}
                      </h4>
                      <p className="text-[11px] text-brand-gold font-mono tracking-wider">{user.email}</p>
                    </div>

                    <div className="pt-3.5 border-t border-brand-sand/40 flex justify-around text-center">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#5A5A5A] block">Dossier ID</span>
                        <span className="font-mono text-[10px] font-bold text-brand-forest">#{user.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="border-l border-brand-sand/50 h-6" />
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#5A5A5A] block">Registry</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-forest">
                          {user.isMock ? "Offline" : "Verified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex border border-brand-sand/60 rounded-[2px] bg-white overflow-hidden p-1 shadow-xs">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex-1 py-2 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === "profile" 
                          ? "bg-brand-forest text-brand-ivory" 
                          : "text-[#5A5A5A] hover:bg-brand-ivory"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex-1 py-2 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === "orders" 
                          ? "bg-brand-forest text-brand-ivory" 
                          : "text-[#5A5A5A] hover:bg-brand-ivory"
                      }`}
                    >
                      Acquisitions
                    </button>
                  </div>

                  {/* Tab Panel switcher */}
                  {activeTab === "profile" ? (
                    <div className="space-y-4">
                      {/* Active Custom Order status - Maps over ALL active orders */}
                      {activeOrders.length > 0 ? (
                        <div className="space-y-4">
                          {activeOrders.map((latestActiveOrder) => {
                            const statusInfo = getStatusProgress(latestActiveOrder.status);
                            return (
                              <div key={latestActiveOrder.id} className="bg-white p-5 rounded-[2px] border border-brand-sand/65 shadow-xs space-y-4">
                                <div className="flex justify-between items-center border-b border-brand-sand/30 pb-2">
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A76A] flex items-center gap-1.5">
                                    <Loader className="w-3.5 h-3.5 animate-spin text-[#C9A76A]" />
                                    <span>Active Curation status</span>
                                  </span>
                                  <span className="text-[9px] bg-brand-forest/10 text-brand-forest font-bold px-2 py-0.5 rounded-[2px]">
                                    Order #{latestActiveOrder.id}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <h5 className="font-serif text-xs sm:text-sm font-normal text-[#1A1A1A]">
                                    {latestActiveOrder.cart && latestActiveOrder.cart[0] 
                                      ? latestActiveOrder.cart[0].product?.name || "Custom Piece"
                                      : "Custom Resin Curation"}
                                    {latestActiveOrder.cart && latestActiveOrder.cart.length > 1 && ` (+${latestActiveOrder.cart.length - 1} more items)`}
                                  </h5>
                                  <span className="text-[10px] text-[#5A5A5A] block leading-relaxed mt-1">
                                    {statusInfo?.desc}
                                  </span>
                                </div>

                                {/* Progress visual tracker */}
                                <div className="space-y-2 pt-1">
                                  <div className="flex justify-between text-[10px] font-bold text-[#1A1A1A]/70">
                                    <span>Stage: {latestActiveOrder.status}</span>
                                    <span className="text-[#C9A76A]">{statusInfo?.percent}%</span>
                                  </div>
                                  <div className="relative w-full bg-[#FAF8F5] rounded-[2px] h-2 overflow-hidden border border-brand-sand/60">
                                    <div className="bg-brand-gold h-full rounded-[2px] transition-all duration-500" style={{ width: `${statusInfo?.percent}%` }} />
                                  </div>
                                  
                                  {/* Staged Indicators */}
                                  <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-[#5A5A5A]/60 uppercase tracking-wider text-center pt-1">
                                    <span className={statusInfo?.step && statusInfo.step >= 1 ? "text-brand-forest font-bold" : ""}>Curation</span>
                                    <span className={statusInfo?.step && statusInfo.step >= 3 ? "text-brand-forest font-bold" : statusInfo?.step === 2 ? "text-brand-gold animate-pulse font-bold" : ""}>Pouring</span>
                                    <span className={statusInfo?.step && statusInfo.step >= 5 ? "text-brand-forest font-bold" : statusInfo?.step === 4 ? "text-brand-gold animate-pulse font-bold" : ""}>Curing</span>
                                    <span className={statusInfo?.step && statusInfo.step >= 6 ? "text-brand-forest font-bold" : ""}>Delivered</span>
                                  </div>
                                </div>

                                {/* Pay Now Button for Active Orders */}
                                {latestActiveOrder.status === "Curation Requested" && (
                                  <a 
                                    href={`upi://pay?pa=${STUDIO_UPI_ID}&pn=TheResinGrove&am=${Number(latestActiveOrder.grandTotal).toFixed(2)}&cu=INR&tn=Order ${latestActiveOrder.id}`}
                                    className="mt-2 w-full py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-[10px] font-bold uppercase tracking-[1px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Pay ₹{Number(latestActiveOrder.grandTotal).toFixed(2)} via UPI
                                  </a>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-[2px] border border-brand-sand/65 shadow-xs text-center space-y-3">
                          <Compass className="w-8 h-8 text-[#C9A76A]/40 mx-auto" />
                          <h5 className="font-serif text-sm font-normal text-brand-forest">No Active Curations</h5>
                          <p className="text-[11px] text-[#5A5A5A] leading-relaxed max-w-xs mx-auto">
                            Your active commissions will display here. Check the Acquisitions tab to view your completed gallery pieces.
                          </p>
                        </div>
                      )}

                      {/* Coupon card */}
                      <div className="bg-[#FAF8F5] p-5 rounded-[2px] border border-brand-gold/20 shadow-inner space-y-2.5 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-brand-gold/15">
                          <Flame className="w-12 h-12" />
                        </div>
                        <span className="text-[9px] uppercase font-bold text-brand-gold tracking-widest block">Private Offer</span>
                        <h5 className="font-serif text-sm font-normal text-[#1A1A1A]">Get 10% Off Limited Series</h5>
                        <p className="text-[11px] text-[#5A5A5A] leading-relaxed">Use promo code <span className="font-mono font-bold text-brand-gold text-xs bg-white border border-brand-sand/50 px-1.5 py-0.5 rounded-[1px]">GROVE10</span> at checkout simulator to save.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loadingOrders ? (
                        <div className="text-center py-12 space-y-2">
                          <Loader className="w-6 h-6 animate-spin text-[#C9A76A] mx-auto" />
                          <p className="text-xs text-[#5A5A5A]">Loading your gallery acquisitions...</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="bg-white p-8 rounded-[2px] border border-brand-sand/60 shadow-xs text-center space-y-3">
                          <History className="w-8 h-8 text-[#C9A76A]/40 mx-auto animate-pulse" />
                          <h5 className="font-serif text-sm font-normal text-brand-forest">No History Recorded</h5>
                          <p className="text-[11px] text-[#5A5A5A] leading-relaxed">
                            Your bespoke purchases, curated blocks, and custom commissions will display here once submitted.
                          </p>
                        </div>
                      ) : (
                        orders.map((ord) => (
                          <div key={ord.id} className="bg-white p-5 rounded-[2px] border border-brand-sand/60 shadow-xs space-y-3 text-xs text-[#1A1A1A]/80 relative overflow-hidden">
                            {/* Left decorative wood accent */}
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-gold" />
                            
                            <div className="flex justify-between items-center text-[10px] uppercase text-[#5A5A5A]/80 font-bold tracking-wider">
                              <span>Invoice #{ord.id}</span>
                              <span>{new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>

                            {/* Cart Items listing */}
                            <div className="space-y-2.5">
                              {ord.cart && ord.cart.map((item: any, idx: number) => (
                                <div key={idx} className="border-b border-brand-sand/15 last:border-0 pb-2.5 last:pb-0">
                                  <div className="flex justify-between font-serif text-xs text-[#1A1A1A] font-normal">
                                    <span>{item.product?.name || "Custom Piece"} <span className="font-sans text-[10px] text-[#5A5A5A]">x{item.quantity}</span></span>
                                    <span className="font-mono text-[10px]">₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                  </div>
                                  
                                  {/* Custom configurations */}
                                  {(item.selectedWood || item.selectedResinColor || item.selectedDeco || item.personalizationText) && (
                                    <div className="text-[9px] bg-[#FAF8F5] border border-brand-sand/30 rounded-[1px] p-2 mt-1.5 space-y-0.5 text-[#5A5A5A] leading-normal font-medium">
                                      {item.selectedWood && <div>• Wood: <span className="text-[#1A1A1A] font-semibold">{item.selectedWood}</span></div>}
                                      {item.selectedResinColor && <div>• Resin: <span className="text-[#1A1A1A] font-semibold">{item.selectedResinColor}</span></div>}
                                      {item.selectedDeco && item.selectedDeco.length > 0 && (
                                        <div>• Inclusions: <span className="text-[#1A1A1A] font-semibold">{item.selectedDeco.join(", ")}</span></div>
                                      )}
                                      {item.personalizationText && (
                                        <div>• Engraving: <span className="font-serif italic text-[#C9A76A]">"{item.personalizationText}"</span></div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-brand-sand/20">
                              <span className="text-brand-gold font-bold font-mono text-sm">₹{Number(ord.grandTotal).toFixed(2)}</span>
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] border ${
                                ord.status === "Delivered"
                                  ? "text-green-700 bg-green-50 border-green-200/40"
                                  : "text-brand-gold bg-[#FAF8F5] border-brand-gold/20"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${ord.status === "Delivered" ? "bg-green-500" : "bg-brand-gold animate-pulse"}`} /> 
                                {ord.status}
                              </span>
                            </div>

                            {/* Pay Now Button for History Orders */}
                            {ord.status === "Curation Requested" && (
                              <a 
                                href={`upi://pay?pa=${STUDIO_UPI_ID}&pn=TheResinGrove&am=${Number(ord.grandTotal).toFixed(2)}&cu=INR&tn=Order ${ord.id}`}
                                className="mt-3 w-full py-2.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-[2px] text-[10px] font-bold uppercase tracking-[1px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Pay ₹{Number(ord.grandTotal).toFixed(2)} via UPI
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="border-t border-brand-sand/55 p-6 bg-white flex flex-col gap-2.5 shrink-0 shadow-lg">
              {user && (
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Account</span>
                </button>
              )}

              <button
                onClick={() => setAccountOpen(false)}
                className="w-full py-3.5 bg-brand-forest hover:bg-brand-forest/90 text-brand-ivory rounded-[2px] text-xs font-bold uppercase tracking-[1px] transition-colors shadow-xs cursor-pointer text-center"
              >
                Return to Gallery
              </button>
            </div>

          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  );
}