/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Sparkles, Sliders } from 'lucide-react';
import { ViewPage } from '../types';

interface NavbarProps {
  currentView: ViewPage;
  onViewChange: (view: ViewPage) => void;
  cartCount: number;
  onCartToggle: () => void;
}

export default function Navbar({ 
  currentView, 
  onViewChange, 
  cartCount, 
  onCartToggle 
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 h-20 border-b border-[#D4AF37]/30 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand Logo Accent */}
        <div 
          onClick={() => onViewChange('home')} 
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-logo"
        >
          <Sparkles className="w-4 h-4 text-gold-accent group-hover:rotate-12 transition-transform duration-500" />
          <h1 className="text-2xl sm:text-3xl font-serif tracking-[0.2em] text-[#D4AF37] font-light group-hover:opacity-90 transition-opacity">
            SATYA <span className="opacity-50">X</span> CO
          </h1>
        </div>

        {/* Navigation Menus */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.15em] font-medium">
          <button 
            id="nav-link-home"
            onClick={() => onViewChange('home')}
            className={`transition-colors duration-300 uppercase ${currentView === 'home' ? 'text-[#D4AF37] border-b border-[#D4AF37] pb-1 font-semibold' : 'text-gray-400 hover:text-[#D4AF37]'}`}
          >
            Home
          </button>
          <button 
            id="nav-link-shop"
            onClick={() => onViewChange('shop')}
            className={`transition-colors duration-300 uppercase ${currentView === 'shop' ? 'text-[#D4AF37] border-b border-[#D4AF37] pb-1 font-semibold' : 'text-gray-400 hover:text-[#D4AF37]'}`}
          >
            Collections
          </button>
         <button
  id="nav-link-admin"
  onClick={() => onViewChange('admin')}
  className="transition-colors duration-300 uppercase text-gray-400 hover:text-[#D4AF37]"
>
  Admin
</button>
        </nav>

        {/* Interaction Group & Live Status Indicator */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#D4AF37]/60 uppercase tracking-widest select-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
            Firebase Connected
          </div>

          {/* Quick Mobile Admin Menu or Mobile Active Views */}
          

          <button 
            id="nav-shop-mobile"
            onClick={() => onViewChange('shop')}
            className="md:hidden text-xs tracking-[0.1em] text-gray-400 hover:text-white uppercase"
          >
            Shop
          </button>

          {/* Immersive UI Cart Button */}
          <button
            id="nav-cart-trigger"
            onClick={onCartToggle}
            className="px-5 py-2 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all font-medium relative group cursor-pointer"
            aria-label="Cart"
          >
            Cart ({cartCount})
            {cartCount > 0 && (
              <span 
                id="cart-badge-count"
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-black shadow-[0_0_6px_#10b981]"
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
