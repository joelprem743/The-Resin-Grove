import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShop } from "../context/ShopContext";
import { 
  X, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  ShoppingBag, 
  Mail, 
  Calendar, 
  DollarSign, 
  Check, 
  RefreshCw, 
  Trash, 
  Eye, 
  Filter, 
  User, 
  Clock, 
  Smartphone,
  ChevronDown,
  Lock,
  ChevronRight,
  Info
} from "lucide-react";

export default function AdminDashboard() {
  const { isAdminOpen, setAdminOpen, showToast } = useShop();
  
  // Auth state
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Data states
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"inquiries" | "orders" | "analytics">("inquiries");
  const [filterStatus, setFilterStatus] = useState("All");
  const [supabaseStatus, setSupabaseStatus] = useState<any | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showSetupSql, setShowSetupSql] = useState(false);

  // Detail Modal target
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [detailType, setDetailType] = useState<"inquiry" | "order" | null>(null);

  // Deletion and reset confirmation states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Fetch admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Inquiries
      try {
        const inqRes = await fetch("/api/admin/inquiries");
        if (inqRes.ok) {
          const inqData = await inqRes.ok ? await inqRes.json() : [];
          setInquiries(inqData);
        }
      } catch (err) {
        console.error("Error fetching inquiries:", err);
      }

      // 2. Fetch Orders
      try {
        const ordRes = await fetch("/api/admin/orders");
        if (ordRes.ok) {
          const ordData = await ordRes.ok ? await ordRes.json() : [];
          setOrders(ordData);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }

      // 3. Fetch Supabase Status
      try {
        const dbRes = await fetch("/api/admin/supabase-status");
        if (dbRes && dbRes.ok) {
          const dbData = await dbRes.json();
          setSupabaseStatus(dbData);
          if (dbData.initialized && (!dbData.ordersTableOk || !dbData.inquiriesTableOk)) {
            setShowSetupSql(true);
          }
        }
      } catch (err) {
        console.error("Error fetching Supabase status:", err);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync now action
  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-now", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast(
            "Sync Successful",
            `Successfully synced ${data.syncedOrders} orders and ${data.syncedInquiries} inquiries to Supabase!`
          );
          await fetchData();
        } else {
          showToast("Sync Error", data.error || "Failed to sync records.");
        }
      } else {
        showToast("Sync Error", "Server returned an error status during sync.");
      }
    } catch (err) {
      console.error("Error running sync:", err);
      showToast("Sync Error", "Could not connect to the sync endpoint.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isAdminOpen && isAuthenticated) {
      fetchData();

      // Real-time polling to keep the admin dashboard inquiries and orders perfectly updated
      const interval = setInterval(() => {
        fetchData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAdminOpen, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin" || password === "groveadmin") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid administrator passcode.");
    }
  };

  const handleBypass = () => {
    setIsAuthenticated(true);
    setAuthError("");
  };

  // Update status handlers
  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/update-inquiry-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(prev => ({ ...prev, status: newStatus }));
        }
        showToast("Status Updated", `Inquiry ${id} set to ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(prev => ({ ...prev, status: newStatus }));
        }
        showToast("Order Updated", `Order ${id} set to ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete single record from backend
  const handleDeleteSingleItem = async (id: string, type: "order" | "inquiry") => {
    try {
      const res = await fetch("/api/admin/delete-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type })
      });
      if (res.ok) {
        if (type === "order") {
          setOrders(prev => prev.filter(o => o.id !== id));
        } else {
          setInquiries(prev => prev.filter(i => i.id !== id));
        }
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
          setDetailType(null);
        }
        setDeleteConfirmId(null);
        showToast("Record Deleted", `Successfully removed ${type} record ${id}.`);
      } else {
        const errData = await res.json();
        showToast("Deletion Failed", errData.error || "Could not delete record.");
      }
    } catch (err) {
      console.error(err);
      showToast("Deletion Error", "A network error occurred while deleting.");
    }
  };

  // Reset database logs
  const handleResetDatabase = async () => {
    try {
      const res = await fetch("/api/admin/clear", { method: "DELETE" });
      if (res.ok) {
        setInquiries([]);
        setOrders([]);
        setSelectedItem(null);
        setResetConfirm(false);
        showToast("Database Cleared", "Local log files have been reset.");
      }
    } catch (err) {
      console.error(err);
      showToast("Reset Error", "A network error occurred during reset.");
    }
  };

  // Analytics helper calculations
  const totalSales = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
  const pendingInquiries = inquiries.filter(i => i.status === "Pending Review").length;
  const activeCommissions = orders.filter(o => o.status === "Curation Requested" || o.status === "In Crafting").length;

  // Filter lists based on status
  const filteredInquiries = inquiries.filter(i => filterStatus === "All" || i.status === filterStatus);
  const filteredOrders = orders.filter(o => filterStatus === "All" || o.status === filterStatus);

  if (!isAdminOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        
        {/* Main Dashboard Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-brand-ivory border border-brand-sand max-w-6xl w-full rounded-[2px] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header Banner */}
          <div className="bg-[#1A1A1A] text-white px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#C9A76A]" />
              <span className="font-serif text-base font-normal tracking-[1px]">Artisan Admin Workspace</span>
              <span className="bg-[#C9A76A]/20 text-[#C9A76A] text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] border border-[#C9A76A]/30">
                Studio Node
              </span>
            </div>
            <button
              onClick={() => setAdminOpen(false)}
              className="p-2 hover:bg-white/10 rounded-[2px] transition-colors cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isAuthenticated ? (
            /* Elegant Security Gateway */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto relative overflow-hidden">
              {/* Thin background foliage or luxury pattern */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-gold/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-16 h-16 bg-brand-forest/5 text-brand-gold rounded-full flex items-center justify-center border-2 border-brand-gold/20 shadow-md">
                <Lock className="w-6 h-6 animate-pulse-slow" />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-lg font-bold text-brand-forest tracking-wide">Curator Verification</h4>
                <p className="text-xs text-[#5A5A5A] leading-relaxed">
                  Access is strictly reserved for authorized studio curators and design evaluators. Kindly present your passcode.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-brand-forest tracking-[1.5px] block mb-2 text-left">Curator Secret Key</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-brand-sand rounded-[2px] px-4 py-3.5 text-sm text-center focus:outline-hidden focus:border-brand-gold focus:ring-1 focus:ring-brand-gold tracking-[4px] text-brand-forest placeholder:text-brand-forest/20 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {authError && (
                  <p className="text-[10px] text-red-600 font-bold bg-red-50 py-1.5 px-3 rounded-[2px] border border-red-100">{authError}</p>
                )}
                
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-forest hover:bg-brand-forest/90 text-brand-ivory rounded-[2px] text-xs font-bold uppercase tracking-[1.5px] transition-all duration-300 shadow-xs cursor-pointer"
                >
                  Verify Access Credentials
                </button>
              </form>

              <div className="w-full border-t border-brand-sand/35 pt-4 flex flex-col items-center space-y-2">
                <span className="text-[9px] text-[#5A5A5A]/60 uppercase tracking-widest font-bold">Simulator Override</span>
                <button
                  onClick={handleBypass}
                  className="text-xs text-brand-gold hover:text-brand-gold/80 font-bold tracking-wide transition-colors cursor-pointer"
                >
                  Enter Studio Dashboard →
                </button>
              </div>
            </div>
          ) : (
            /* Fully Operational Workspace */
            <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
              
              {/* Analytics Summary Panel */}
              <div className="bg-[#FAF8F5] border-b border-brand-sand/55 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                {/* Metric 1 */}
                <div className="bg-white border border-brand-sand/40 p-4 rounded-[2px] shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C9A76A]/10 text-[#C9A76A] rounded-[2px] flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#5A5A5A] font-bold block">Total Value</span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">₹{totalSales.toFixed(2)}</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white border border-brand-sand/40 p-4 rounded-[2px] shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C9A76A]/10 text-[#C9A76A] rounded-[2px] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#5A5A5A] font-bold block">Total Orders</span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">{orders.length}</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white border border-brand-sand/40 p-4 rounded-[2px] shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C9A76A]/10 text-[#C9A76A] rounded-[2px] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#5A5A5A] font-bold block">Active Crafts</span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">{activeCommissions}</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white border border-brand-sand/40 p-4 rounded-[2px] shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C9A76A]/10 text-[#C9A76A] rounded-[2px] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#5A5A5A] font-bold block">New Inquiries</span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">{pendingInquiries}</span>
                  </div>
                </div>
              </div>

              {/* Toolbar Actions & Workspace Tabs */}
              <div className="px-6 py-3 border-b border-brand-sand/35 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActiveTab("inquiries"); setFilterStatus("All"); }}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] border transition-all duration-200 cursor-pointer ${
                      activeTab === "inquiries"
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-transparent text-[#5A5A5A] border-brand-sand hover:bg-[#FAF8F5]"
                    }`}
                  >
                    Custom Inquiries ({inquiries.length})
                  </button>
                  <button
                    onClick={() => { setActiveTab("orders"); setFilterStatus("All"); }}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] border transition-all duration-200 cursor-pointer ${
                      activeTab === "orders"
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-transparent text-[#5A5A5A] border-brand-sand hover:bg-[#FAF8F5]"
                    }`}
                  >
                    Boutique Orders ({orders.length})
                  </button>
                </div>

                {/* Filters and Utilities */}
                <div className="flex items-center gap-2">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 text-xs text-[#5A5A5A] font-medium">
                    <Filter className="w-3.5 h-3.5 text-[#C9A76A]" />
                    <span>Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-[#FAF8F5] border border-brand-sand rounded-[2px] px-2 py-1 text-xs text-[#1A1A1A]"
                    >
                      <option value="All">All Statuses</option>
                      {activeTab === "inquiries" ? (
                        <>
                          <option value="Pending Review">Pending Review</option>
                          <option value="Artisan Replied">Artisan Replied</option>
                          <option value="Declined">Declined</option>
                        </>
                      ) : (
                        <>
                          <option value="Curation Requested">Curation Requested</option>
                          <option value="In Crafting">In Crafting</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Divider */}
                  <span className="text-brand-sand/50">|</span>

                  {/* Sync button */}
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="p-1.5 border border-brand-sand hover:bg-brand-sand/20 rounded-[2px] text-[#1A1A1A] transition-colors cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C9A76A]" : ""}`} />
                  </button>

                  {/* Clear button */}
                  {resetConfirm ? (
                    <div className="flex items-center gap-2 border border-red-200 bg-red-50/50 p-1 rounded-[2px]">
                      <span className="text-[9px] text-red-600 font-bold uppercase">Reset?</span>
                      <button
                        onClick={handleResetDatabase}
                        className="text-[9px] font-bold bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded-[2px] cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setResetConfirm(false)}
                        className="text-[9px] font-bold bg-white border border-brand-sand hover:bg-[#FAF8F5] text-gray-700 px-1.5 py-0.5 rounded-[2px] cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResetConfirm(true)}
                      className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
                      title="Clear Database Logs"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Live Lists scroll box */}
              <div className="flex-grow overflow-y-auto p-6 bg-white space-y-6">
                {/* Supabase Integration Advisor */}
                {supabaseStatus && (
                  <div className={`p-4 border rounded-[2px] text-xs leading-relaxed space-y-3 ${
                    supabaseStatus.initialized 
                      ? (supabaseStatus.ordersTableOk && supabaseStatus.inquiriesTableOk)
                        ? "bg-green-50/50 border-green-200 text-green-800"
                        : "bg-amber-50/60 border-amber-300 text-amber-900"
                      : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}>
                    <div className="flex items-center justify-between font-bold text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            supabaseStatus.initialized ? "bg-green-400" : "bg-red-400"
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            supabaseStatus.initialized ? "bg-green-500" : "bg-red-500"
                          }`}></span>
                        </span>
                        <span>Supabase Sync Service Status</span>
                      </div>
                      <span className="font-mono text-[10px] bg-white/60 px-1.5 py-0.5 rounded border font-bold">
                        {supabaseStatus.initialized ? "CONNECTED" : "LOCAL MODE ONLY"}
                      </span>
                    </div>

                    {!supabaseStatus.initialized ? (
                      <p className="text-[#5a5a5a]">
                        The database integration is running in offline local file mode. To sync with your cloud Supabase database, please add your <code className="font-mono bg-gray-100 px-1 rounded text-red-600">VITE_SUPABASE_URL</code> and <code className="font-mono bg-gray-100 px-1 rounded text-red-600">VITE_SUPABASE_ANON_KEY</code> variables in your environment or secrets config.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <p className="text-[#5a5a5a]">
                            Connected to: <code className="font-mono text-[11px] bg-white/70 px-1.5 py-0.5 rounded border">{supabaseStatus.url}</code>
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowSetupSql(!showSetupSql)}
                            className="text-[10px] text-[#C9A76A] hover:text-[#bfa065] font-bold flex items-center gap-1 cursor-pointer bg-white border border-[#C9A76A]/20 px-2.5 py-1 rounded-[2px] transition-colors hover:bg-[#FAF8F5] uppercase tracking-wider"
                          >
                            <span>{showSetupSql ? "Hide SQL Setup" : "Copy/View SQL Setup"}</span>
                          </button>
                        </div>
                        
                        {/* Table validation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className={`p-2.5 rounded-[2px] border ${
                            supabaseStatus.ordersTableOk ? "bg-green-100/40 border-green-300 text-green-900" : "bg-red-50 border-red-200 text-red-900"
                          }`}>
                            <div className="font-bold flex justify-between items-center">
                              <span>Table: orders</span>
                              <span className={supabaseStatus.ordersTableOk ? "text-green-700" : "text-red-700"}>
                                {supabaseStatus.ordersTableOk ? "✓ Active & Connected" : "✗ Missing"}
                              </span>
                            </div>
                            {!supabaseStatus.ordersTableOk && (
                              <p className="text-[10px] text-red-600/90 mt-1">
                                Error: {supabaseStatus.errorOrders || "Relation 'orders' does not exist."}
                              </p>
                            )}
                          </div>

                          <div className={`p-2.5 rounded-[2px] border ${
                            supabaseStatus.inquiriesTableOk ? "bg-green-100/40 border-green-300 text-green-900" : "bg-red-50 border-red-200 text-red-900"
                          }`}>
                            <div className="font-bold flex justify-between items-center">
                              <span>Table: inquiries</span>
                              <span className={supabaseStatus.inquiriesTableOk ? "text-green-700" : "text-red-700"}>
                                {supabaseStatus.inquiriesTableOk ? "✓ Active & Connected" : "✗ Missing"}
                              </span>
                            </div>
                            {!supabaseStatus.inquiriesTableOk && (
                              <p className="text-[10px] text-red-600/90 mt-1">
                                Error: {supabaseStatus.errorInquiries || "Relation 'inquiries' does not exist."}
                              </p>
                            )}
                          </div>
                        </div>

                        {(showSetupSql || !supabaseStatus.ordersTableOk || !supabaseStatus.inquiriesTableOk) && (
                          <div className="bg-white p-3 rounded border border-amber-200 mt-2 text-[#4a3618] space-y-2 shadow-xs">
                            <p className="font-bold">⚠️ Action Required: Create Tables in Supabase</p>
                            <p className="text-[11px]">
                              Your Supabase database has mismatched, missing, or cached tables. Paste this script into the <strong>SQL Editor</strong> in your Supabase Dashboard to reset and configure them with the correct columns:
                            </p>
                            <pre className="text-[10px] font-mono bg-slate-900 text-slate-100 p-2.5 rounded overflow-x-auto select-all max-h-[160px] leading-relaxed">
{`-- 1. Drop existing conflicting tables to clear old schemas
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;

-- 2. Create orders table with correct column structures
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  shipping_details JSONB,
  cart JSONB,
  grand_total NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT,
  order_time TEXT
);

-- 3. Create inquiries table with correct column structures
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  project_type TEXT,
  budget TEXT,
  description TEXT,
  delivery_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT,
  configuration JSONB
);

-- 4. Enable Row-Level Security (RLS) and define permissive policies
-- This ensures that even if you have RLS enabled, reads and writes will succeed.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to orders" ON orders;
CREATE POLICY "Allow public access to orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to inquiries" ON inquiries;
CREATE POLICY "Allow public access to inquiries" ON inquiries FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Grant explicit table privileges to all API roles
GRANT ALL ON TABLE orders TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE inquiries TO postgres, anon, authenticated, service_role;

-- 6. Force Supabase PostgREST to reload the API schema cache
NOTIFY pgrst, 'reload schema';`}
                            </pre>
                            <button
                              type="button"
                              onClick={() => {
                                const sql = `-- 1. Drop existing conflicting tables to clear old schemas\nDROP TABLE IF EXISTS orders CASCADE;\nDROP TABLE IF EXISTS inquiries CASCADE;\n\n-- 2. Create orders table with correct column structures\nCREATE TABLE orders (\n  id TEXT PRIMARY KEY,\n  shipping_details JSONB,\n  cart JSONB,\n  grand_total NUMERIC,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  status TEXT,\n  order_time TEXT\n);\n\n-- 3. Create inquiries table with correct column structures\nCREATE TABLE inquiries (\n  id TEXT PRIMARY KEY,\n  name TEXT,\n  email TEXT,\n  project_type TEXT,\n  budget TEXT,\n  description TEXT,\n  delivery_date TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  status TEXT,\n  configuration JSONB\n);\n\n-- 4. Enable Row-Level Security (RLS) and define permissive policies\nALTER TABLE orders ENABLE ROW LEVEL SECURITY;\nALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;\n\nDROP POLICY IF EXISTS "Allow public access to orders" ON orders;\nCREATE POLICY "Allow public access to orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);\n\nDROP POLICY IF EXISTS "Allow public access to inquiries" ON inquiries;\nCREATE POLICY "Allow public access to inquiries" ON inquiries FOR ALL TO public USING (true) WITH CHECK (true);\n\n-- 5. Grant explicit table privileges to all API roles\nGRANT ALL ON TABLE orders TO postgres, anon, authenticated, service_role;\nGRANT ALL ON TABLE inquiries TO postgres, anon, authenticated, service_role;\n\n-- 6. Force Supabase PostgREST to reload the API schema cache\nNOTIFY pgrst, 'reload schema';`;
                                navigator.clipboard.writeText(sql);
                                showToast("SQL Copied", "Copy the SQL into your Supabase SQL Editor and run it!");
                              }}
                              className="px-3 py-1.5 bg-[#C9A76A] hover:bg-[#bfa065] text-white rounded-[2px] font-bold text-[10px] uppercase cursor-pointer"
                            >
                              Copy Setup SQL
                            </button>
                          </div>
                        )}

                        {/* Sync controls */}
                        <div className="pt-3 border-t border-gray-200/60 mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="text-[11px] text-[#5A5A5A] max-w-sm">
                            If you have existing orders or inquiries saved locally from offline mode, you can push them directly to Supabase now.
                          </div>
                          <button
                            type="button"
                            disabled={syncing || !supabaseStatus.ordersTableOk || !supabaseStatus.inquiriesTableOk}
                            onClick={handleSyncNow}
                            className={`px-3 py-1.5 text-white rounded-[2px] font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              (supabaseStatus.ordersTableOk && supabaseStatus.inquiriesTableOk)
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400"
                            }`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                            <span>{syncing ? "Syncing..." : "Sync Local Data"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {loading && inquiries.length === 0 && orders.length === 0 ? (
                  <div className="text-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#C9A76A] mx-auto mb-2" />
                    <span className="text-xs text-[#5A5A5A]">Syncing with local workshop file...</span>
                  </div>
                ) : (activeTab === "inquiries" ? filteredInquiries : filteredOrders).length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-brand-sand/60 rounded-[2px] bg-[#FAF8F5] space-y-2">
                    <Info className="w-8 h-8 text-brand-sand mx-auto" />
                    <h5 className="font-serif text-sm font-normal text-[#1A1A1A]">No Records Found</h5>
                    <p className="text-xs text-[#5A5A5A] max-w-xs mx-auto">
                      Submit an inquiry on the bespoke form or place an order from your bag to see logs populate instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTab === "inquiries" ? (
                      /* Render Inquiries */
                      filteredInquiries.map((inq: any) => (
                        <div
                          key={inq.id}
                          className="border border-brand-sand/55 p-5 rounded-[2px] bg-white hover:bg-[#FAF8F5]/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-xs"
                        >
                          <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-[#1A1A1A] bg-brand-forest/5 border border-brand-sand px-2 py-0.5 rounded-[2px]">
                                {inq.id}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-[#C9A76A] bg-[#FAF8F5] border border-[#C9A76A]/20 px-2 py-0.5 rounded-[2px]">
                                {inq.projectType}
                              </span>
                              <span className="text-[10px] text-[#5A5A5A] flex items-center gap-1.5 font-mono" title="Order / Inquiry Creation Time">
                                <Calendar className="w-3.5 h-3.5 text-[#5A5A5A]/50" />
                                {inq.createdAt ? `${new Date(inq.createdAt).toLocaleDateString()} at ${new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "N/A"}
                              </span>
                            </div>

                            <div className="text-xs text-[#1A1A1A] font-medium">
                              From: <strong className="font-bold">{inq.name}</strong> • <span className="text-[#5A5A5A]">{inq.email}</span>
                            </div>

                            <p className="text-xs text-[#5A5A5A] line-clamp-2 leading-relaxed italic bg-brand-ivory/40 p-2.5 rounded-[2px] border border-brand-sand/20">
                              "{inq.description}"
                            </p>
                          </div>

                          {/* Actions / Status Right Side */}
                          <div className="flex flex-col items-end gap-2.5 self-stretch md:self-auto min-w-[150px]">
                            {/* Status label */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[2px] border text-center ${
                              inq.status === "Pending Review"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : inq.status === "Artisan Replied"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {inq.status}
                            </span>

                            {/* Dropdown update status */}
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                              className="text-[11px] bg-white border border-brand-sand rounded-[2px] px-2 py-1 w-full text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="Artisan Replied">Artisan Replied</option>
                              <option value="Declined">Declined</option>
                            </select>

                            {/* View Full Specs button */}
                            <button
                              onClick={() => { setSelectedItem(inq); setDetailType("inquiry"); }}
                              className="text-xs font-bold text-[#C9A76A] hover:text-[#bfa065] flex items-center gap-1 cursor-pointer w-full justify-end"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Specs</span>
                            </button>

                            {/* Delete single inquiry */}
                            {deleteConfirmId === inq.id ? (
                              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-brand-sand/30 w-full justify-end">
                                <span className="text-[10px] text-red-600 font-bold">Delete?</span>
                                <button
                                  onClick={() => handleDeleteSingleItem(inq.id, "inquiry")}
                                  className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-[2px] cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-[10px] font-bold bg-[#EAEAEA] hover:bg-[#DDD] text-gray-700 px-2 py-0.5 rounded-[2px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(inq.id)}
                                className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 cursor-pointer w-full justify-end mt-1 pt-1 border-t border-brand-sand/30"
                                title="Delete inquiry permanently"
                              >
                                <Trash className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Render Orders */
                      filteredOrders.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="border border-brand-sand/55 p-5 rounded-[2px] bg-white hover:bg-[#FAF8F5]/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-xs"
                        >
                          <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-[#1A1A1A] bg-brand-forest/5 border border-brand-sand px-2 py-0.5 rounded-[2px]">
                                {ord.id}
                              </span>
                              <span className="text-[10px] text-[#C9A76A] font-bold font-mono">
                                Total: ₹{ord.grandTotal.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-[#5A5A5A] flex items-center gap-1.5 font-mono" title="Order / Inquiry Creation Time">
                                <Calendar className="w-3.5 h-3.5 text-[#5A5A5A]/50" />
                                {ord.createdAt ? `${new Date(ord.createdAt).toLocaleDateString()} at ${new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "N/A"}
                              </span>
                            </div>

                            <div className="text-xs text-[#1A1A1A] font-medium">
                              Buyer: <strong className="font-bold">{ord.shippingDetails.name}</strong> • <span className="text-[#5A5A5A]">{ord.shippingDetails.email}</span>
                            </div>

                            {/* Cart List Preview */}
                            <div className="text-[11px] text-[#5A5A5A] space-y-0.5 bg-brand-ivory/30 p-2.5 rounded-[2px] border border-brand-sand/20">
                              <strong className="text-[#1A1A1A] font-bold">Items Count: {ord.cart.length}</strong>
                              <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
                                {ord.cart.map((item: any, i: number) => (
                                  <li key={i}>
                                    {item.product.name} (x{item.quantity}) -{" "}
                                    {item.selectedWood ? (
                                      <span className="text-[#C9A76A]">Custom Crafted</span>
                                    ) : (
                                      <span className="text-gray-400 text-[10px]">Standard</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Actions / Status Right Side */}
                          <div className="flex flex-col items-end gap-2.5 self-stretch md:self-auto min-w-[150px]">
                            {/* Status label */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[2px] border text-center ${
                              ord.status === "Curation Requested"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : ord.status === "In Crafting"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : ord.status === "Shipped"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}>
                              {ord.status}
                            </span>

                            {/* Dropdown update status */}
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="text-[11px] bg-white border border-brand-sand rounded-[2px] px-2 py-1 w-full text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A76A]"
                            >
                              <option value="Curation Requested">Curation Requested</option>
                              <option value="In Crafting">In Crafting</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>

                            {/* View Full Specs button */}
                            <button
                              onClick={() => { setSelectedItem(ord); setDetailType("order"); }}
                              className="text-xs font-bold text-[#C9A76A] hover:text-[#bfa065] flex items-center gap-1 cursor-pointer w-full justify-end"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Details</span>
                            </button>

                            {/* Delete single order */}
                            {deleteConfirmId === ord.id ? (
                              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-brand-sand/30 w-full justify-end">
                                <span className="text-[10px] text-red-600 font-bold">Delete?</span>
                                <button
                                  onClick={() => handleDeleteSingleItem(ord.id, "order")}
                                  className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-[2px] cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-[10px] font-bold bg-[#EAEAEA] hover:bg-[#DDD] text-gray-700 px-2 py-0.5 rounded-[2px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(ord.id)}
                                className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 cursor-pointer w-full justify-end mt-1 pt-1 border-t border-brand-sand/30"
                                title="Delete order permanently"
                              >
                                <Trash className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </motion.div>

        {/* Nested Detailed Inspect Modal */}
        <AnimatePresence>
          {selectedItem && detailType && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="absolute inset-0" onClick={() => { setSelectedItem(null); setDetailType(null); }} />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white border border-brand-sand p-6 max-w-lg w-full rounded-[2px] shadow-2xl relative z-10 space-y-5 my-auto max-h-[85vh] overflow-y-auto"
              >
                {/* Modal close */}
                <button
                  onClick={() => { setSelectedItem(null); setDetailType(null); }}
                  className="absolute top-4 right-4 p-1.5 hover:bg-brand-sand/20 rounded-[2px] text-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="border-b border-brand-sand/20 pb-3">
                  <span className="font-mono text-xs font-bold text-[#C9A76A]">{selectedItem.id}</span>
                  <h4 className="font-serif text-lg font-normal text-[#1A1A1A] mt-0.5">
                    {detailType === "inquiry" ? "Bespoke Design Inquiry" : "Order Full Dossier"}
                  </h4>
                </div>

                {/* Common client info */}
                <div className="space-y-2 text-xs text-[#5A5A5A] font-medium leading-relaxed">
                  <span className="text-[10px] uppercase font-bold text-[#1A1A1A] tracking-wider block">Customer Details</span>
                  <div className="bg-[#FAF8F5] border border-brand-sand/30 rounded-[2px] p-3 space-y-1 text-[#1A1A1A]">
                    <div>Name: <strong className="font-bold">{detailType === "inquiry" ? selectedItem.name : selectedItem.shippingDetails.name}</strong></div>
                    <div>Email: <span className="font-bold">{detailType === "inquiry" ? selectedItem.email : selectedItem.shippingDetails.email}</span></div>
                    {detailType === "order" && (
                      <>
                        <div>Phone: <span className="font-bold">{selectedItem.shippingDetails.phone}</span></div>
                        <div>Address: <span className="font-bold">{selectedItem.shippingDetails.address}, {selectedItem.shippingDetails.zip}</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Specific custom configuration detailing */}
                {detailType === "inquiry" ? (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#1A1A1A] tracking-wider block">Inquiry Project Details</span>
                    <div className="text-xs text-[#5A5A5A] space-y-1.5 bg-brand-ivory/50 border border-brand-sand/20 p-4 rounded-[2px]">
                      <div><strong>Type:</strong> {selectedItem.projectType}</div>
                      <div><strong>Budget Range:</strong> {selectedItem.budget}</div>
                      <div><strong>Target Delivery:</strong> {selectedItem.deliveryDate}</div>
                      <div className="pt-2 border-t border-brand-sand/30 mt-2 font-serif text-[#1A1A1A]/85 whitespace-pre-line leading-relaxed italic">
                        "{selectedItem.description}"
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#1A1A1A] tracking-wider block">Ordered Products</span>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {selectedItem.cart.map((item: any, idx: number) => (
                        <div key={idx} className="bg-[#FAF8F5] border border-brand-sand/40 p-3 rounded-[2px] space-y-1.5 text-xs text-[#1A1A1A]">
                          <div className="flex justify-between font-bold">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span className="font-mono text-[#C9A76A]">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          {/* Nested custom choices */}
                          {(item.selectedWood || item.selectedResinColor || item.selectedDeco || item.personalizationText) && (
                            <div className="bg-white border border-brand-sand/30 text-[10px] p-2 rounded-[2px] text-[#5A5A5A] space-y-0.5">
                              {item.selectedWood && <div>• Wood Slab: <span className="font-semibold text-black">{item.selectedWood}</span></div>}
                              {item.selectedResinColor && <div>• Epoxy Color: <span className="font-semibold text-black">{item.selectedResinColor}</span></div>}
                              {item.selectedDeco && item.selectedDeco.length > 0 && (
                                <div>• Inclusions: <span className="font-semibold text-black">{item.selectedDeco.join(", ")}</span></div>
                              )}
                              {item.personalizationText && (
                                <div>• Monogram: <span className="font-serif italic text-[#C9A76A]">"{item.personalizationText}"</span></div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-brand-forest/5 p-3 rounded-[2px] border border-brand-sand/40 flex justify-between items-center text-xs text-[#1A1A1A] font-bold">
                      <span>Curation Grand Total:</span>
                      <span className="font-mono text-[#C9A76A]">₹{selectedItem.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Progress quick updates */}
                <div className="pt-2 flex justify-between gap-3">
                  <div className="text-[10px] text-[#5A5A5A] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Quick Update Status:</span>
                  </div>
                  <div className="flex gap-1.5">
                    {detailType === "inquiry" ? (
                      <>
                        <button
                          onClick={() => handleUpdateInquiryStatus(selectedItem.id, "Artisan Replied")}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-[2px] cursor-pointer"
                        >
                          Mark Replied
                        </button>
                        <button
                          onClick={() => handleUpdateInquiryStatus(selectedItem.id, "Declined")}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-[2px] cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedItem.id, "In Crafting")}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-[2px] cursor-pointer"
                        >
                          Start Crafting
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedItem.id, "Shipped")}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-[2px] cursor-pointer"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedItem.id, "Delivered")}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-[2px] cursor-pointer"
                        >
                          Deliver
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
}
