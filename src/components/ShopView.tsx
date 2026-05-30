/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  PhoneCall, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Check, 
  Loader2 
} from 'lucide-react';
import { Product, CartItem, Order } from '../types';
import { getProducts, createOrder } from '../firebase';

interface ShopViewProps {
  cart: CartItem[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  isCartOpen: boolean;
  onCartClose: () => void;
  defaultCategory?: string;
  adminWhatsAppPhone?: string; // Optional custom Whatsapp phone
}

export default function ShopView({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onClearCart,
  isCartOpen,
  onCartClose,
  defaultCategory = "All",
}: ShopViewProps) {

  const adminWhatsAppPhone = "+917558378398";
  // Products list states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  
  // Active product details popup state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [popupQuantity, setPopupQuantity] = useState<number>(1);

  // Billing and shipping checkout form states
  const [isCheckoutModelOpen, setIsCheckoutModelOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');

 const categories = [
  "ALL",
  "SUNGLASSES",
  "HANDBAGS",
  "WALLETS",
  "ACCESSORIES",
  "NEW ARRIVALS"
];

  // Fetch products from Firebase on load
  const loadShopData = async () => {
    setLoading(true);
    try {
      const items = await getProducts();
      setProducts(items);
    } catch (err) {
      console.error("Could not fetch shop items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  // Update selected category if navigated from Home page with dynamic selected filter
  useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  // Filter products based on category & search terms
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate cart totals
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Multi-image slider controllers
  const handleNextImage = (e: React.MouseEvent, maxCount: number) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % maxCount);
  };

  const handlePrevImage = (e: React.MouseEvent, maxCount: number) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + maxCount) % maxCount);
  };

  // Open particular product detailed view
  const openProductPopup = (p: Product) => {
    setSelectedProduct(p);
    setActiveImageIndex(0);
    setPopupQuantity(1);
  };

  // WhatsApp Order payload generation and dispatch trigger
  const handleInitiateWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModelOpen(true);
  };

  const submitOrderAndOpenWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Please fill out Name, Phone, and Delivery Address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || ''
      }));

      const newOrder: Omit<Order, 'id'> = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: orderItems,
        totalAmount: subtotal,
        status: 'pending'
      };

      // Add to Firestore (or local fallback)
      const orderId = await createOrder(newOrder);
      setPlacedOrderId(orderId);
      setCheckoutSuccess(true);

      // Create pre-formatted elegant WhatsApp message
      let textMessage = `*SATYA X CO — NEW ACQUISITION MEMORANDUM*\n`;
      textMessage += `===============================\n`;
      textMessage += `*Order ID:* #${orderId}\n`;
      textMessage += `*Client Name:* ${customerName}\n`;
      textMessage += `*Client Phone:* ${customerPhone}\n`;
      if (customerEmail) textMessage += `*Client Email:* ${customerEmail}\n`;
      textMessage += `*Delivery Address:* ${customerAddress}\n\n`;

      textMessage += `*ACQUISITIONS & LINE-ITEMS:*\n`;
      cart.forEach((item, index) => {
        textMessage += `${index + 1}. _${item.product.name}_ (Qty: *${item.quantity}*) — $${(item.product.price * item.quantity).toLocaleString()}\n`;
      });

      textMessage += `\n*TOTAL VALUATION:* $${subtotal.toLocaleString()} USD\n`;
      textMessage += `===============================\n`;
      textMessage += `_Please confirm my luxury dispatch of items. Thank you._`;

      const encodedMessage = encodeURIComponent(textMessage);
      const cleanPhone = adminWhatsAppPhone.replace(/[^0-9+]/g, ''); // Numbers & '+' only
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

      // Open in a new window/tab safely
      window.open(whatsappUrl, '_blank');
      onClearCart();
    } catch (err) {
      console.error("Purchase checkout process error:", err);
      alert("Order registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryCount = (catName: string) => {
    if (catName === "All") return products.length;
    return products.filter(p => p.category.toLowerCase() === catName.toLowerCase()).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative min-h-screen">
      {/* Search Header Banner */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-[#D4AF37]/25">
        <div>
          <h1 id="shop-title" className="font-serif text-3xl text-white tracking-[0.15em] font-light uppercase">
            The <span className="text-[#D4AF37] italic">Atelier</span> Catalogue
          </h1>
          <p className="text-gray-400 font-sans text-xs tracking-wider uppercase mt-1">Exquisite couture, gems, and horology</p>
        </div>

        {/* Search Input field */}
        <div className="relative w-full md:w-80">
          <input 
            id="product-search-input"
            type="text"
            placeholder="Search acquisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#D4AF37]/20 text-xs text-white rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-gray-600 font-sans uppercase tracking-widest"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid + Sidebar Filters arrangement */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/10 pb-8 lg:pb-0 lg:pr-8 flex flex-col gap-8">
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] mb-6 font-bold">Categories</h3>
            <ul className="space-y-4 text-xs tracking-wider text-gray-400">
              {categories.map((cat) => {
                const count = getCategoryCount(cat);
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <li 
                    key={cat}
                    id={`cat-filter-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between group cursor-pointer transition-colors ${isActive ? 'text-[#D4AF37] font-semibold' : 'hover:text-white'}`}
                  >
                    <span className="uppercase tracking-[0.1em]">{cat}</span>
                    <span className="text-[10px] opacity-40 group-hover:opacity-85 transition-opacity font-mono">
                      {count < 10 ? `0${count}` : count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Concierge Widget */}
          <section className="mt-4">
            <div className="p-5 border border-[#D4AF37]/20 bg-gradient-to-b from-[#121212] to-transparent shadow-xl rounded-none">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mb-2 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Concierge Desk
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed font-light tracking-wide">
                Secure checkout is routed directly via encrypted WhatsApp message channels for premium members.
              </p>
            </div>
          </section>
        </aside>

        {/* Catalog Main Feed Grid */}
        <div className="flex-1">
          {loading ? (
            <div id="shop-loading-spinner" className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              <p className="text-xs text-[#D4AF37]/75 tracking-widest uppercase font-mono">Opening Atelier Vaults...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div id="shop-empty-state" className="text-center py-20 border border-[#D4AF37]/10 bg-[#080808]">
              <Sparkles className="w-6 h-6 text-[#D4AF37]/30 mx-auto mb-3" />
              <p className="font-serif text-base text-white font-light tracking-wide mb-1">No Acquisitions Found</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto font-light leading-relaxed">We could not locate items matching your search. Please try modifying your criteria.</p>
            </div>
          ) : (
            <div 
              id="products-display-grid"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  id={`prod-card-${p.id}`}
                  onClick={() => openProductPopup(p)}
                  className="group bg-[#080808] border border-[#D4AF37]/10 hover:border-[#D4AF37]/50 shadow-md hover:shadow-[0_0_15px_rgba(212,175,55,0.06)] transition-all duration-500 flex flex-col h-full cursor-pointer"
                >
                  {/* Image Frame */}
                  <div className="aspect-[4/3] bg-black overflow-hidden relative border-b border-[#D4AF37]/10">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700 font-mono text-[9px] text-[#D4AF37] text-center"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-[#050505] border border-[#D4AF37]/20 text-[#D4AF37] text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 font-mono">
                      {p.category}
                    </span>
                  </div>

                  {/* Text Information card */}
                  <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-sm font-normal text-white mb-1.5 tracking-wide line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                        {p.name}
                      </h3>
                      <p className="font-sans text-xs text-gray-400 font-light line-clamp-2 leading-relaxed tracking-wider">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/10">
                      <span className="font-mono text-xs tracking-widest text-[#D4AF37] font-semibold">
                        ${p.price.toLocaleString()} USD
                      </span>
                      <span className="text-[9px] tracking-[0.15em] font-mono text-gray-500 uppercase group-hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                        VIEW PIECE &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- PRODUCT VIEW POPUP MODAL ----------------- */}
      {selectedProduct && (
        <div 
          id="product-preview-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-[#0e0e0e] border border-[#D4AF37]/40 w-full max-w-4xl rounded-none shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Trigger */}
            <button
              id="close-preview-modal"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-white bg-[#151515] hover:bg-[#202020] border border-[#D4AF37]/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Images Columns with dynamic interactive slider */}
            <div className="md:col-span-6 bg-[#090909] aspect-square md:aspect-auto md:h-[500px] relative flex items-center justify-center border-b md:border-b-0 md:border-r border-[#D4AF37]/15">
              {selectedProduct.images.length > 0 ? (
                <>
                  <img
                    id="slider-active-image"
                    src={selectedProduct.images[activeImageIndex]}
                    alt={`${selectedProduct.name} - View ${activeImageIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover text-[#D4AF37] text-center text-sm"
                  />
                  
                  {/* Slider controllers */}
                  {selectedProduct.images.length > 1 && (
                    <>
                      <button
                        id="slider-prev-btn"
                        onClick={(e) => handlePrevImage(e, selectedProduct.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/20 transition-all rounded-full"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        id="slider-next-btn"
                        onClick={(e) => handleNextImage(e, selectedProduct.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/20 transition-all rounded-full"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Dot index markers */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                        {selectedProduct.images.map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              activeImageIndex === dotIdx ? 'bg-[#D4AF37] w-4' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-gray-600 font-mono text-center text-xs">No Imagery Provided</div>
              )}
            </div>

            {/* Information Column details */}
            <div className="md:col-span-6 p-8 md:p-10 flex flex-col justify-between h-full md:h-[500px] overflow-y-auto">
              <div>
                <span className="text-[9px] tracking-[0.3em] font-mono font-medium text-[#D4AF37] uppercase mb-2 block">
                  Collection / {selectedProduct.category}
                </span>
                <h2 id="popup-product-name" className="font-serif text-2xl font-light text-white mb-4 tracking-wide leading-tight">
                  {selectedProduct.name}
                </h2>
                <div className="inline-block px-3 py-1.5 bg-[#171510] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono tracking-widest mb-6">
                  ${selectedProduct.price.toLocaleString()} USD
                </div>
                <div className="border-t border-[#D4AF37]/15 pt-6 mb-6">
                  <h4 className="text-[10px] tracking-widest uppercase text-gray-500 font-medium mb-2">Acquisition Details</h4>
                  <p id="popup-product-desc" className="text-gray-300 font-sans text-xs tracking-wider leading-relaxed font-light">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* Quantity selectors and Bag add trigger */}
              <div className="border-t border-[#D4AF37]/15 pt-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center border border-[#D4AF37]/30 bg-[#121212] w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    id="qty-decrement"
                    onClick={() => setPopupQuantity(Math.max(1, popupQuantity - 1))}
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span id="qty-count" className="px-5 font-mono text-xs font-semibold text-white">
                    {popupQuantity}
                  </span>
                  <button
                    id="qty-increment"
                    onClick={() => setPopupQuantity(popupQuantity + 1)}
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  id="add-to-cart-action"
                  onClick={() => {
                    onAddToCart(selectedProduct, popupQuantity);
                    setSelectedProduct(null);
                  }}
                  className="w-full sm:flex-grow py-4 bg-[#1e1a12] border border-[#D4AF37] text-black bg-[#D4AF37] hover:bg-[#c5a12f] transition-colors text-xs font-semibold uppercase tracking-[0.24em] cursor-pointer"
                >
                  Confirm Acquisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SHOPPING BAG CART SIDEBAR ----------------- */}
      {isCartOpen && (
        <div 
          id="cart-sidebar-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end"
          onClick={onCartClose}
        >
          <div 
            id="cart-sidebar-panel"
            className="w-full max-w-md bg-[#0a0a0a] h-full border-l border-[#D4AF37]/20 flex flex-col justify-between p-6 sm:p-8 animate-slide-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls */}
            <div className="flex items-center justify-between pb-6 border-b border-[#D4AF37]/15">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg tracking-widest text-white uppercase font-light">Acquisitions</h3>
              </div>
              <button
                id="close-cart-sidebar"
                onClick={onCartClose}
                className="p-2 text-gray-400 hover:text-white bg-[#141414] border border-[#D4AF37]/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List items block */}
            <div className="flex-grow overflow-y-auto py-6 space-y-6">
              {cart.length === 0 ? (
                <div id="cart-item-empty" className="text-center py-24">
                  <ShoppingBag className="w-8 h-8 text-gray-700 mx-auto mb-4" />
                  <p className="font-serif text-sm italic text-gray-500">Your shopping bag is completely empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="flex items-start gap-4 pb-4 border-b border-[#D4AF37]/10 relative"
                  >
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=150'}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover bg-[#111] border border-[#D4AF37]/15 text-[#D4AF37] text-center text-[10px]"
                    />
                    <div className="flex-grow">
                      <h4 className="font-serif text-xs text-white tracking-wide leading-snug line-clamp-1">{item.product.name}</h4>
                      <div className="font-mono text-xs text-[#D4AF37] mt-1 mb-2 font-semibold">
                        ${item.product.price.toLocaleString()} USD
                      </div>
                      
                      {/* Plus / Minus selector controls */}
                      <div className="flex items-center border border-[#D4AF37]/15 w-24 justify-between bg-[#111111]">
                        <button
                          onClick={() => onUpdateCartQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Delete item trigger */}
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-gray-500 hover:text-rose-500 text-[10px] font-mono font-medium p-1 ml-2 transition-colors cursor-pointer uppercase tracking-widest"
                      title="Remove Item"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total checkout value summary and trigger */}
            <div className="border-t border-[#D4AF37]/15 pt-6 bg-[#0a0a0a]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-sans">Valuation Sum</span>
                <span id="cart-subtotal-payout" className="font-mono text-base tracking-wider text-[#D4AF37] font-semibold">
                  ${subtotal.toLocaleString()} USD
                </span>
              </div>
              
              <button
                id="checkout-bag-trigger"
                onClick={handleInitiateWhatsAppCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 uppercase tracking-[0.25em] text-[10px] font-bold text-center flex items-center justify-center gap-2 transition-all duration-300 ${
                  cart.length > 0 
                    ? 'bg-[#D4AF37] text-black hover:bg-[#c5a12f] cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                    : 'bg-[#181818] text-gray-600 border border-[#D4AF37]/10 cursor-not-allowed'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Secure Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CUSTOMER DETAILS BILLING MODAL ---------------- */}
      {isCheckoutModelOpen && (
        <div 
          id="checkout-billing-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xs"
          onClick={() => setIsCheckoutModelOpen(false)}
        >
          <div 
            className="bg-[#0f0f0f] border border-[#D4AF37]/40 w-full max-w-lg p-6 sm:p-10 rounded-none shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="close-billing-modal"
              onClick={() => {
                setIsCheckoutModelOpen(false);
                setCheckoutSuccess(false);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#141414] border border-[#D4AF37]/30"
            >
              <X className="w-4 h-4" />
            </button>

            {!checkoutSuccess ? (
              <form onSubmit={submitOrderAndOpenWhatsApp} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="font-serif text-lg tracking-widest text-white uppercase font-light">Client Information</h3>
                  <p className="text-[9px] text-[#D4AF37] uppercase tracking-[0.25em] mt-1">Acquisition Dispatch File</p>
                  <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-3"></div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[9px] tracking-widest uppercase text-gray-400 font-sans font-semibold flex items-center gap-1.5Packed">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Full Legal Name
                  </label>
                  <input
                    id="client-name-field"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your billing name"
                    className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none uppercase tracking-wider"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <label className="text-[9px] tracking-widest uppercase text-gray-400 font-sans font-semibold flex items-center gap-1.5Packed">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Secure Email (Optional)
                  </label>
                  <input
                    id="client-email-field"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none tracking-wider"
                  />
                </div>

                {/* WhatsApp Phone coordinate */}
                <div className="space-y-2">
                  <label className="text-[9px] tracking-widest uppercase text-gray-400 font-sans font-semibold flex items-center gap-1.5Packed">
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    WhatsApp Phone Number
                  </label>
                  <input
                    id="client-phone-field"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 99999 99999"
                    className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none tracking-wider"
                  />
                </div>

                {/* Shipping Coordinates */}
                <div className="space-y-2">
                  <label className="text-[9px] tracking-widest uppercase text-gray-400 font-sans font-semibold flex items-center gap-1.5Packed font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Luxury Dispatch Delivery Address
                  </label>
                  <textarea
                    id="client-address-field"
                    required
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Street, Suite, Corporate Penthouse, City, Zip"
                    className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none tracking-wider resize-none"
                  />
                </div>

                {/* Checkout pricing details card */}
                <div className="p-4 bg-[#14120e] border border-[#D4AF37]/20 text-center mb-2">
                  <p className="text-[9px] font-sans tracking-widest text-gray-500 uppercase">Acquisitions Total Valuation</p>
                  <h4 className="font-mono text-sm text-[#D4AF37] font-semibold mt-1">${subtotal.toLocaleString()} USD</h4>
                </div>

                {/* Submit trigger button */}
                <button
                  id="submit-checkout-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#D4AF37] text-black hover:bg-[#c5a12f] transition-all text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging Order Dispatch...
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      Confirm & WhatsApp Order
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ORDER CONCLUDE BLOCK SCREEN */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-[#161d12] border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-500">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-light tracking-wide mb-2">Maison Dispatch Cataloged</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                    Your acquisition number <span className="font-mono text-[#D4AF37] font-bold">#{placedOrderId}</span> has been logged safely. We have opened WhatsApp to finalise private courier arrangements with Satya X Co directly.
                  </p>
                </div>
                
                <div className="p-4 bg-[#111] border border-[#D4AF37]/20 text-xs font-mono text-gray-400 uppercase tracking-widest max-w-xs mx-auto">
                  Courier Phone: {adminWhatsAppPhone}
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setIsCheckoutModelOpen(false);
                      setCheckoutSuccess(false);
                      onCartClose();
                    }}
                    className="px-8 py-3.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37] text-xs tracking-widest uppercase cursor-pointer"
                  >
                    Close Catalogue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
