/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import AdminView from './components/AdminView';
import { ViewPage, Product, CartItem } from './types';
import { Sparkles, Mail, Check, Phone } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewPage>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedNavCategory, setSelectedNavCategory] = useState<string>("All");

  // Notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Navigating directly with preset category selector triggered from home grid
  const handleHomeCategoryNavigation = (category?: string) => {
    if (category) {
      setSelectedNavCategory(category);
    } else {
      setSelectedNavCategory("All");
    }
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add Item to cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    triggerToast(`"${product.name}" added to Acquisitions bag.`);
  };

  // Remove Item from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Modify quantities
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear selections
  const handleClearCart = () => {
    setCart([]);
  };

  // Core navigation selector
  const handleViewChange = (view: ViewPage) => {
    setCurrentView(view);
    // Reset category if shifting menus
    if (view !== 'shop') {
      setSelectedNavCategory("All");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col justify-between selection:bg-gold-accent selection:text-black">
      {/* Dynamic Golden Header */}
      <Navbar 
        currentView={currentView}
        onViewChange={handleViewChange}
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />

      {/* Main View Port router rendering processes */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomeView onNavigateToShop={handleHomeCategoryNavigation} />
        )}
        
        {currentView === 'shop' && (
          <ShopView 
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onClearCart={handleClearCart}
            isCartOpen={isCartOpen}
            onCartClose={() => setIsCartOpen(false)}
            defaultCategory={selectedNavCategory}
          />
        )}
        
        {currentView === 'admin' && (
          <AdminView />
        )}
      </main>

      {/* ---------------- SLIDING CONFIRMATION TOAST OVERLAYS ---------------- */}
      {toastMessage && (
        <div 
          id="acquisition-toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-[#0e0e0e] border border-[#D4AF37] p-4 shadow-2xl max-w-sm rounded-none text-xs flex items-center gap-3.5 animate-fade-in"
        >
          <div className="w-6 h-6 rounded-none bg-[#171510] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-sans text-gray-400 font-semibold tracking-widest text-[9px] uppercase">Acquisition Confirmed</p>
            <p className="text-white font-medium mt-0.5 tracking-wider leading-tight">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Premium Luxury Footer */}
      <footer className="bg-[#050505] border-t border-[#D4AF37]/15 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16">
          {/* Brand identity column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#D4AF37]" />
              <span className="font-serif text-lg tracking-[0.3em] text-white">SATYA X CO</span>
            </div>
            <p className="text-gray-400 text-xs font-light leading-relaxed tracking-wider max-w-sm">
              Artistic atelier dedicated to creating ultra-luxurious, exclusive couture, legendary chronographs, and platine Statement bands for refined collectors.
            </p>
            <p className="text-gray-600 font-mono text-[9px] tracking-widest uppercase">
              &copy; {new Date().getFullYear()} SATYA X CO MAISON. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Quick links navigation mapping columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif text-xs text-white tracking-[0.2em] uppercase font-semibold text-[#D4AF37]">The Maison</h4>
            <div className="flex flex-col space-y-2.5 text-xs text-gray-400 font-light tracking-widest font-sans">
              <button onClick={() => handleViewChange('home')} className="text-left hover:text-white transition-colors cursor-pointer uppercase">The Experience</button>
              <button onClick={() => handleViewChange('shop')} className="text-left hover:text-white transition-colors cursor-pointer uppercase">Our Atelier</button>
              <button onClick={() => handleViewChange('admin')} className="text-left hover:text-white transition-colors cursor-pointer uppercase">Registry Ledger</button>
            </div>
          </div>

          {/* Maison Contacts newsletter inputs */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-serif text-xs text-white tracking-[0.2em] uppercase font-semibold text-[#D4AF37]">Atelier Inquiries</h4>
            <div className="space-y-4 text-xs text-gray-400 font-light">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span className="tracking-widest font-mono text-[11px]">concierge@satyaxco.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span className="tracking-widest font-mono text-[11px]">+91 99999 99999</span>
              </div>
              
              {/* Decorative premium news register */}
              <div className="pt-2">
                <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-2 font-semibold">Join private release alerts</p>
                <div className="flex border border-[#D4AF37]/20 rounded-none overflow-hidden">
                  <input
                    type="email"
                    placeholder="EMAIL RECIPIENT"
                    className="bg-[#111] px-3 py-2 text-[10px] text-white placeholder-gray-600 focus:outline-none w-full uppercase tracking-widest font-mono"
                  />
                  <button 
                    onClick={() => triggerToast("Registered successfully to Satya newsletters.")}
                    className="px-4 py-2 bg-[#D4AF37] text-black text-[9px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#c5a12f] transition-colors"
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
