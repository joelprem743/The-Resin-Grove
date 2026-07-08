import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, X } from "lucide-react";
import { Product, CartItem } from "../types";
import { PRODUCTS } from "../data";
import { supabase, isSupabaseConfigured, syncCartToSupabase, loadCartFromSupabase } from "../lib/supabase";

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
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  showToast: (message: string, submessage?: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [user, setUser] = useState<{ id: string; email: string; name?: string; isMock?: boolean } | null>(null);
  const [isSyncingCart, setIsSyncingCart] = useState(false);

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
  }, []);

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("resingrove_cart");
    const savedWishlist = localStorage.getItem("resingrove_wishlist");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse saved wishlist", e);
      }
    }
  }, []);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    const loadUserCart = async () => {
      if (!user) return;
      
      if (user.isMock) {
        // Mock user can just use localStorage, which is already loaded on mount
        return;
      }
      
      if (isSupabaseConfigured && supabase) {
        setIsSyncingCart(true);
        try {
          const dbItems = await loadCartFromSupabase(user.id);
          if (dbItems && dbItems.length > 0) {
            const loadedCart: CartItem[] = dbItems.map((dbItem) => {
              const product = PRODUCTS.find((p) => p.id === dbItem.product_id);
              const resolvedProduct: Product = product || {
                id: dbItem.product_id,
                name: "Custom Resin Piece",
                price: 25.00,
                category: "Custom Gifts",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80",
                description: "Preserved custom artisan artwork.",
                rating: 5.0,
                reviewsCount: 1,
                dimensions: "Varies",
                materials: ["Resin"],
                inStock: true,
                features: []
              };

              return {
                product: resolvedProduct,
                quantity: dbItem.quantity,
                selectedWood: dbItem.selected_wood || undefined,
                selectedResinColor: dbItem.selected_resin_color || undefined,
                selectedDeco: dbItem.selected_deco || undefined,
                personalizationText: dbItem.personalization_text || undefined,
              };
            });

            setCart(loadedCart);
            showToast("Cart Synchronized", `Restored ${loadedCart.length} items from your collector profile.`);
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

  // Save cart to localStorage on changes & sync to Supabase
  useEffect(() => {
    localStorage.setItem("resingrove_cart", JSON.stringify(cart));

    const syncCart = async () => {
      if (user && !user.isMock && isSupabaseConfigured && !isSyncingCart) {
        await syncCartToSupabase(user.id, cart);
      }
    };

    const timer = setTimeout(() => {
      syncCart();
    }, 500);

    return () => clearTimeout(timer);
  }, [cart, user]);

  // Save wishlist to localStorage on changes
  useEffect(() => {
    localStorage.setItem("resingrove_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Helper to generate a unique key for custom configurations
  const getConfigKey = (
    wood?: string,
    color?: string,
    deco?: string[],
    text?: string
  ) => {
    const dStr = deco ? [...deco].sort().join(",") : "";
    return `${wood || "none"}-${color || "none"}-${dStr}-${text || "none"}`;
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
      // Find if this exact product with exact configuration already exists in cart
      const existingIndex = prevCart.findIndex((item) => {
        if (item.product.id !== product.id) return false;
        return (
          item.selectedWood === selectedWood &&
          item.selectedResinColor === selectedResinColor &&
          JSON.stringify(item.selectedDeco) === JSON.stringify(selectedDeco) &&
          item.personalizationText === personalizationText
        );
      });

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
        };
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity,
            selectedWood,
            selectedResinColor,
            selectedDeco,
            personalizationText,
          },
        ];
      }
    });
    showToast("Added to Cart Successfully!", product.name);
  };

  const removeFromCart = (productId: string, configId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const itemConfigId = getConfigKey(
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
        isSupabaseConfigured,
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
