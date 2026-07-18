// src/context/ShopContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, X } from "lucide-react";
import { Product, CartItem } from "../types";
import { PRODUCTS } from "../data";
import { supabase, isSupabaseConfigured, syncCartToSupabase, loadCartFromSupabase, syncWishlistToSupabase, loadWishlistFromSupabase, initializeSupabase } from "../lib/supabase";


interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isAccountOpen: boolean;
  isAdminOpen: boolean;
  quickViewProduct: Product | null;
  searchTerm: string;
  selectedCategory: string;
  user: { id: string; email: string; name?: string; isMock?: boolean } | null;
  setUser: (user: { id: string; email: string; name?: string; isMock?: boolean } | null) => void;
  isSupabaseConfigured: boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setAccountOpen: (open: boolean) => void;
  setAdminOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (cat: string) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedWood?: string,
    selectedResinColor?: string,
    selectedDeco?: string[],
    personalizationText?: string
  ) => void;
  removeFromCart: (productId: string, configId: string) => void;
  updateQuantity: (productId: string, configId: string, quantity: number) => void;
  attachCustomPhoto: (productId: string, configId: string, photoUrl: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  showToast: (message: string, submessage?: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Deduplicates a cart array safely without mutating objects
const deduplicateCart = (cartItems: CartItem[]): CartItem[] => {
  const map = new Map<string, CartItem>();
  for (const item of cartItems) {
    const dStr = item.selectedDeco ? [...item.selectedDeco].sort().join(",") : "";
    const key = `${item.product.id}-${item.selectedWood || "none"}-${item.selectedResinColor || "none"}-${dStr}-${item.personalizationText || "none"}`;
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      // Create a new object to prevent mutating the original state
      map.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("resingrove_cart");
    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        // Clean up any duplicate items that might have been saved previously
        return deduplicateCart(parsedCart);
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const savedWishlist = localStorage.getItem("resingrove_wishlist");
    if (savedWishlist) {
      try {
        return JSON.parse(savedWishlist);
      } catch (e) {
        console.error("Failed to parse saved wishlist", e);
      }
    }
    return [];
  });

  const [isCartOpen, setCartOpen] = useState(false);
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [user, setUser] = useState<{ id: string; email: string; name?: string; isMock?: boolean } | null>(null);
  const [isSyncingCart, setIsSyncingCart] = useState(false);

  const [supabaseConfigured, setSupabaseConfigured] = useState(isSupabaseConfigured);
  const [supabaseReady, setSupabaseReady] = useState(false);

  const [isSyncingWishlist, setIsSyncingWishlist] = useState(false);

  // Dynamically fetch Supabase credentials from the Express server at runtime
  useEffect(() => {
    const fetchConfigAndInit = async () => {
      try {
        const res = await fetch("/api/supabase-config");
        if (res.ok) {
          const data = await res.json();
          if (data.initialized && data.supabaseUrl && data.supabaseAnonKey) {
            initializeSupabase(data.supabaseUrl, data.supabaseAnonKey);
            setSupabaseConfigured(true);
            setSupabaseReady(true);
            console.log("[Supabase Sync] Dynamic runtime configuration successful.");
          } else {
            console.log("[Supabase Sync] Dynamic configuration: Server running in local file mode.");
            setSupabaseReady(true);
          }
        } else {
          setSupabaseReady(true);
        }
      } catch (err) {
        console.error("[Supabase Sync] Failed to fetch dynamic Supabase configuration:", err);
        setSupabaseReady(true);
      }
    };
    fetchConfigAndInit();
  }, []);

  // Listen to real Supabase auth state changes
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Collector",
            isMock: false
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Collector",
            isMock: false
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabaseReady]);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    const loadUserCart = async () => {
      if (!user || user.isMock) return;
      
      if (isSupabaseConfigured && supabase) {
        setIsSyncingCart(true);
        try {
          const dbItems = await loadCartFromSupabase(user.id);
          
          // 1. Map DB items to CartItem format
          const dbStandardItems: CartItem[] = (dbItems || []).map((dbItem) => {
            const product = PRODUCTS.find((p) => p.id === dbItem.product_id);
            if (!product) return null;
            return { product, quantity: dbItem.quantity };
          }).filter((item): item is CartItem => item !== null);

          // 2. Merge with local cart (preserves custom items, avoids doubling quantities)
          setCart((prevLocalCart) => {
            const mergedCart = [...dbStandardItems];
            
            prevLocalCart.forEach((localItem) => {
              const isCustom = !!localItem.selectedWood || !!localItem.selectedResinColor;
              
              if (isCustom) {
                mergedCart.push(localItem);
              } else {
                const existsInDb = dbStandardItems.some(
                  (dbItem) => dbItem.product.id === localItem.product.id
                );
                
                if (!existsInDb) {
                  mergedCart.push(localItem);
                }
              }
            });
            
            return deduplicateCart(mergedCart);
          });

          if (dbStandardItems.length > 0) {
            showToast("Cart Synchronized", `Restored ${dbStandardItems.length} items from your collector profile.`);
          }
        } catch (err) {
          console.error("Failed to load cart from Supabase:", err);
        } finally {
          setIsSyncingCart(false);
        }
      }
    };

    loadUserCart();
  }, [user]);

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    const loadUserWishlist = async () => {
      if (!user || user.isMock) return;
      
      if (isSupabaseConfigured && supabase) {
        setIsSyncingWishlist(true);
        try {
          const dbItems = await loadWishlistFromSupabase(user.id);
          
          const dbWishlist: Product[] = (dbItems || []).map((dbItem) => {
            const product = PRODUCTS.find((p) => p.id === dbItem.product_id);
            return product;
          }).filter((p): p is Product => Boolean(p));
  
          setWishlist((prevLocalWishlist) => {
            const mergedWishlist = [...dbWishlist];
            
            prevLocalWishlist.forEach((localItem) => {
              const existsInDb = mergedWishlist.some(
                (dbItem) => dbItem.id === localItem.id
              );
              
              if (!existsInDb) {
                mergedWishlist.push(localItem);
              }
            });
            
            return mergedWishlist;
          });
        } catch (err) {
          console.error("Failed to load wishlist from Supabase:", err);
        } finally {
          setIsSyncingWishlist(false);
        }
      }
    };
  
    loadUserWishlist();
  }, [user]);

  // Save cart to localStorage on changes & sync to Supabase
  useEffect(() => {
    localStorage.setItem("resingrove_cart", JSON.stringify(cart));

    if (isSyncingCart) return;

    const syncCart = async () => {
      if (user && !user.isMock && isSupabaseConfigured) {
        await syncCartToSupabase(user.id, cart);
      }
    };

    const timer = setTimeout(() => {
      syncCart();
    }, 500);

    return () => clearTimeout(timer);
  }, [cart, user, isSyncingCart]);

  // Save wishlist to localStorage on changes & sync to Supabase
  useEffect(() => {
    localStorage.setItem("resingrove_wishlist", JSON.stringify(wishlist));

    if (isSyncingWishlist) return;

    const syncWishlist = async () => {
      if (user && !user.isMock && isSupabaseConfigured) {
        await syncWishlistToSupabase(user.id, wishlist);
      }
    };

    const timer = setTimeout(() => {
      syncWishlist();
    }, 500);

    return () => clearTimeout(timer);
  }, [wishlist, user, isSyncingWishlist]);

  // Helper to generate a unique key for custom configurations
  const getConfigKey = (
    productId: string,
    wood?: string,
    color?: string,
    deco?: string[],
    text?: string
  ) => {
    const dStr = deco ? [...deco].sort().join(",") : "";
    return `${productId}-${wood || "none"}-${color || "none"}-${dStr}-${text || "none"}`;
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedWood?: string,
    selectedResinColor?: string,
    selectedDeco?: string[],
    personalizationText?: string
  ) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      
      // Find if this exact product with exact configuration already exists in cart
      const existingIndex = newCart.findIndex((item) => {
        if (item.product.id !== product.id) return false;
        
        const itemDeco = item.selectedDeco ? [...item.selectedDeco].sort().join(",") : "";
        const newDeco = selectedDeco ? [...selectedDeco].sort().join(",") : "";

        return (
          (item.selectedWood || "") === (selectedWood || "") &&
          (item.selectedResinColor || "") === (selectedResinColor || "") &&
          itemDeco === newDeco &&
          (item.personalizationText || "") === (personalizationText || "")
        );
      });

      if (existingIndex > -1) {
        // Create a new object to prevent mutating the original state
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
        };
      } else {
        newCart.push({
          product,
          quantity,
          selectedWood,
          selectedResinColor,
          selectedDeco,
          personalizationText,
        });
      }
      
      return deduplicateCart(newCart);
    });
    showToast("Added to Cart Successfully!", product.name);
  };

  const removeFromCart = (productId: string, configId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const itemConfigId = getConfigKey(
          item.product.id,
          item.selectedWood,
          item.selectedResinColor,
          item.selectedDeco,
          item.personalizationText
        );
        return !(item.product.id === productId && itemConfigId === configId);
      })
    );
  };

  const updateQuantity = (productId: string, configId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, configId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemConfigId = getConfigKey(
          item.product.id,
          item.selectedWood,
          item.selectedResinColor,
          item.selectedDeco,
          item.personalizationText
        );
        if (item.product.id === productId && itemConfigId === configId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const attachCustomPhoto = (productId: string, configId: string, photoUrl: string) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemConfigId = getConfigKey(
          item.product.id,
          item.selectedWood,
          item.selectedResinColor,
          item.selectedDeco,
          item.personalizationText
        );
        if (item.product.id === productId && itemConfigId === configId) {
          return { ...item, customPhotoUrl: photoUrl };
        }
        return item;
      })
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearCart = () => {
    setCart([]);
  };

  const [toast, setToast] = useState<{ message: string; submessage?: string } | null>(null);

  const showToast = (message: string, submessage?: string) => {
    setToast({ message, submessage });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        isWishlistOpen,
        isAccountOpen,
        isAdminOpen,
        quickViewProduct,
        searchTerm,
        selectedCategory,
        user,
        setUser,
        isSupabaseConfigured: supabaseConfigured,
        setCartOpen,
        setWishlistOpen,
        setAccountOpen,
        setAdminOpen,
        setQuickViewProduct,
        setSearchTerm,
        setSelectedCategory,
        addToCart,
        removeFromCart,
        updateQuantity,
        attachCustomPhoto,
        toggleWishlist,
        isInWishlist,
        clearCart,
        showToast,
      }}
    >
      {children}

      {/* Elegant floating toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-[9999] bg-white border border-brand-sand rounded-[2px] p-4 pr-10 shadow-lg flex items-center gap-3.5 max-w-[340px]"
          >
            <div className="w-9 h-9 bg-brand-forest/5 text-brand-gold rounded-full flex items-center justify-center flex-shrink-0 border border-brand-gold/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif text-sm font-normal text-brand-forest">
                {toast.message}
              </p>
              {toast.submessage && (
                <p className="font-sans text-[11px] text-[#5A5A5A] truncate max-w-[220px]">
                  {toast.submessage}
                </p>
              )}
            </div>
            <button
              onClick={() => setToast(null)}
              className="absolute top-2 right-2 p-1 text-[#5A5A5A]/50 hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};