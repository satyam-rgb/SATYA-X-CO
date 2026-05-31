/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Gem, Compass } from 'lucide-react';

interface HomeViewProps {
  onNavigateToShop: (category?: string) => void;
}

export default function HomeView({ onNavigateToShop }: HomeViewProps) {
  const brandPillars = [
    {
      icon: <Gem className="w-5 h-5 text-[#D4AF37]" />,
      title: "Unyielding Perfection",
      description: "Each item is crafted in limited numbers, incorporating high-purity gold alloys, flawless gems, or luxurious full-grain fabrics."
    },
    {
      icon: <Compass className="w-5 h-5 text-[#D4AF37]" />,
      title: "Maison Heritage",
      description: "Fusing traditional European couture secrets with modern digital precision for a flawless structural feel."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />,
      title: "Bespoke Delivery",
      description: "Direct courier networks and private dispatch processes ensure your acquisition arrives securely and immediately."
    }
  ];

  const collections = [
    {
      title: "SHOP NOW",
      desc: "Tailored luxury gowns and outerwear curated for high-profile gatherings.",
      category: "Couture",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Fine Timepieces",
      desc: "Calibrated automatic chronographs detailed in rare rose gold and matte dark titanium.",
      category: "Timepieces",
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Imperial Jewelry",
      desc: "Heavy modern rings, crowns, and bands in flawless platinum and hammered gold.",
      category: "Jewelry",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Calfskin Goods",
      desc: "Premium soft travel duffels, bags, and luxury accessories colored in natural noir.",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      {/* Premium Hero Section */}
      <section 
        id="hero-section"
        className="relative bg-[radial-gradient(circle_at_70%_50%,#1a1505,transparent)] bg-[#050505] py-24 md:py-32 border-b border-[#D4AF37]/30 overflow-hidden flex items-center min-h-[500px]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#1a1505,transparent)] opacity-60"></div>
        <div className="absolute inset-x-0 bottom-0 top-0 opacity-5 bg-[linear-gradient(rgba(212,175,55,0.1)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(212,175,55,0.1)_1px,_transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Main Hero Message */}
          <div className="text-left max-w-2xl">
            {/* Subtle luxurious badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/80 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-widest uppercase mb-6">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>The 2024 Collection</span>
            </div>

            <h1 
              id="hero-title"
              className="font-serif text-4xl sm:text-6xl font-light tracking-wide text-white mb-6 leading-tight"
            >
              PREMIUM FASHION & LUXURY ACCESSORIES <br />
              <span className="text-[#D4AF37] italic font-normal">Pure Luxury</span>
            </h1>

            <p className="font-sans text-gray-400 font-light text-sm md:text-base mb-10 tracking-wider leading-relaxed">
              Discover premium sunglasses, handbags, wallets and accessories designed for modern style and everyday luxury.

Order directly through WhatsApp with fast support and secure service.

            <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
              <button
                id="hero-shop-now-btn"
                onClick={() => onNavigateToShop()}
                className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.22em] bg-[#D4AF37] text-black hover:bg-[#C5A028] transition-all flex items-center justify-center gap-2"
              >
                Explore Catalogue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="hero-couture-btn"
                onClick={() => onNavigateToShop('Couture')}
                className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.22em] bg-transparent border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                SHOP NOW
              </button>
            </div>
          </div>

          {/* Luxury Geometric Line Indicator */}
          <div className="hidden lg:flex relative items-center justify-center w-80 h-80">
            <div className="absolute w-80 h-80 border border-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <div className="w-64 h-64 border border-[#D4AF37]/20 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-tr from-[#050505] to-[#161616] rounded-full shadow-2xl flex flex-col items-center justify-center border border-[#D4AF37]/30">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1">Maison</span>
                  <span className="font-serif text-[11px] text-[#D4AF37] uppercase tracking-[0.3em]">Satya x Co</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* House Philosophy (Heritage, Scarcity, Craft) */}
      <section className="bg-[#080808] py-20 border-b border-[#D4AF37]/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-2xl md:text-3xl text-white tracking-[0.2em] font-light uppercase">
              The Maison <span className="text-[#D4AF37] italic">Philosophy</span>
            </h2>
            <div className="w-16 h-[1px] bg-[#D4AF37]/40 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {brandPillars.map((pillar, i) => (
              <div 
                key={i} 
                className="bg-[#050505] border border-[#D4AF37]/10 p-8 hover:border-[#D4AF37]/40 transition-all duration-500 text-center md:text-left shadow-lg"
              >
                <div className="mb-6 w-11 h-11 rounded-full bg-black flex items-center justify-center border border-[#D4AF37]/20 mx-auto md:mx-0">
                  {pillar.icon}
                </div>
                <h3 className="text-white font-serif text-base tracking-wider mb-3 font-medium">
                  {pillar.title}
                </h3>
                <p className="text-gray-400 font-sans text-xs tracking-wide leading-relaxed font-light">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Collection Category Grids */}
      <section className="bg-[#0a0a0a] py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="mb-6 md:mb-0">
              <h2 className="font-serif text-2xl md:text-3xl text-white tracking-[0.2em] font-light uppercase">
                The Curated <span className="text-[#D4AF37] italic">Ateliers</span>
              </h2>
              <p className="text-[#D4AF37]/60 text-[10px] tracking-[0.25em] uppercase mt-2">Selected Collections of Statement Scarce Goods</p>
            </div>
            <button
              id="view-all-collections"
              onClick={() => onNavigateToShop()}
              className="text-[#D4AF37] hover:text-white text-[11px] tracking-widest uppercase flex items-center gap-2 group transition-colors cursor-pointer"
            >
              Browse All Assets
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#D4AF37]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col, idx) => (
              <div 
                key={idx}
                id={`cat-card-${col.category}`}
                onClick={() => onNavigateToShop(col.category)}
                className="group relative h-96 overflow-hidden border border-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all duration-700 cursor-pointer flex flex-col justify-end p-6 bg-black"
              >
                {/* Background image overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={col.image} 
                    alt={col.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-[0.35] transition-all duration-700 text-gold-accent text-center text-xs"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#05050530] to-transparent"></div>
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] tracking-[0.3em] font-mono font-medium text-[#D4AF37] uppercase mb-2 block">
                    Collection / {col.category}
                  </span>
                  <h3 className="font-serif text-lg font-normal text-white mb-2 tracking-wide group-hover:text-[#D4AF37] transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-gray-400 font-sans text-xs font-light leading-relaxed tracking-wide opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                    {col.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exquisite Brand Quote Banner */}
      <section className="bg-gradient-to-r from-[#14120f] via-[#080808] to-[#14120f] py-20 text-center border-t border-b border-[#D4AF37]/20">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-serif text-xl md:text-2xl font-light italic text-[#F5F5F5] leading-relaxed mb-6">
            &ldquo;Luxe is not in multiple things, but in the sole and perfect piece, crafted with absolute patience and dedication.&rdquo;
          </p>
          <span className="font-sans text-[10px] tracking-[0.4em] text-[#D4AF37] uppercase">
            &mdash; SATYA MALVIYA, FOUNDER
          </span>
        </div>
      </section>
    </div>
  );
}
