/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShopProvider } from "./context/ShopContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import ProductGrid from "./components/ProductGrid";
import BestSellers from "./components/BestSellers";
import WhyChooseUs from "./components/WhyChooseUs";
import CustomBuilder from "./components/CustomBuilder";
import CustomOrders from "./components/CustomOrders";
import Testimonials from "./components/Testimonials";
import InstagramGallery from "./components/InstagramGallery";
import Newsletter from "./components/Newsletter";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// Overlays and drawers
import QuickViewModal from "./components/QuickViewModal";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import AccountDrawer from "./components/AccountDrawer";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  return (
    <ShopProvider>
      <div className="relative min-h-screen flex flex-col justify-between selection:bg-brand-gold/30 selection:text-brand-forest">
        {/* Navigation Bar */}
        <Navbar />

        {/* Content body sections */}
        <main className="flex-grow">
          {/* Hero */}
          <Hero />

          {/* Shop by Category circles */}
          <CategorySection />

          {/* Featured Product grid with search and sort */}
          <ProductGrid />

          {/* Best Sellers signature showcase */}
          <BestSellers />

          {/* Core artisan brand values */}
          <WhyChooseUs />

          {/* Interactive Custom Resin Creator Playground */}
          {/* <CustomBuilder /> */}

          {/* Custom Gifting and bouquet preservations */}
          {/* <CustomOrders /> */}

          {/* Verified Customer Reviews with Submission form */}
          <Testimonials />

          {/* Instagram photo mosaic gallery */}
          {/* <InstagramGallery /> */}

          {/* Elegant email signup banner */}
          {/* <Newsletter /> */}

          {/* Contact coordinates, form, and stylized map */}
          <Contact />
        </main>

        {/* Brand footer details */}
        <Footer />

        {/* E-Commerce Interactive Drawers and Overlays */}
        <QuickViewModal />
        <CartDrawer />
        <WishlistDrawer />
        <AccountDrawer />
        <AdminDashboard />
      </div>
    </ShopProvider>
  );
}
