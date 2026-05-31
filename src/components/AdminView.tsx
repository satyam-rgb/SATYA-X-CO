/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  UploadCloud, 
  DollarSign, 
  Tag, 
  Layers, 
  X, 
  RefreshCw, 
  Sparkles, 
  Lock 
} from 'lucide-react';
import { Product, Order } from '../types';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getOrders, 
  uploadProductImage 
} from '../firebase';

export default function AdminView() {
  // Authentication block passkey (Demo: empty represents unlocked)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [passkey, setPasskey] = useState<string>('');
  
  // Data list states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inventorySearch, setInventorySearch] = useState<string>('');

  // Form states (Add/Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Field values
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<string>('Couture');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]); // holds list of image URLs
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  // File Upload drag/drop references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Load backend systems
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const items = await getProducts();
      const submittedOrders = await getOrders();
      setProducts(items);
      setOrders(submittedOrders);
    } catch (err) {
      console.error("Could not fetch admin data parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const categories = [
  "SUNGLASSES",
  "HANDBAGS",
  "WALLETS",
  "ACCESSORIES",
  "NEW ARRIVALS"
];

  // Calculate high-end indicator metrics
  const totalAssetsCount = products.length;
  const totalOrdersValuation = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAtelierWorth = products.reduce((sum, p) => sum + p.price, 0);

  // Open Form for Adding a new Product
  const openAddForm = () => {
    setEditingProductId(null);
    setName('');
    setPrice(0);
    setCategory('SUNGLASSES');
    setDescription('');
    setImages([]);
    setIsFormOpen(true);
  };

  // Open Form for Editing a Product
  const openEditForm = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setPrice(p.price);
    setCategory(p.category);
    setDescription(p.description);
    setImages([...p.images]);
    setIsFormOpen(true);
  };

  // Handle Drag events (for File uploads)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  // Select files manually via click
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  // Core Multiple file upload worker utilizing storage SDK with base64 fallback
  const uploadFiles = async (files: FileList) => {
    setUploadProgress(true);
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          alert(`Skipping file: ₹{file.name} is not an image.`);
          continue;
        }
        const url = await uploadProductImage(file);
        uploadedUrls.push(url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Batch image upload failed:", err);
      alert("Error uploading images. Please try again.");
    } finally {
      setUploadProgress(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clean selector state
      }
    }
  };

  // Delete a specific image URL from active product form list
  const removeImageAtIndex = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Replace a specific image at index with a new selected file
  const replaceImageAtIndex = async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Selected file must be an image.");
      return;
    }
    setUploadProgress(true);
    try {
      const url = await uploadProductImage(file);
      setImages((prev) => {
        const copy = [...prev];
        copy[idx] = url;
        return copy;
      });
    } catch (err) {
      console.error("Image replacement upload failed:", err);
    } finally {
      setUploadProgress(false);
    }
  };

  const triggerImageReplacementSelector = (idx: number) => {
    const selector = document.createElement('input');
    selector.type = 'file';
    selector.accept = 'image/*';
    selector.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        replaceImageAtIndex(idx, target.files[0]);
      }
    };
    selector.click();
  };

  // Submit product Creation or Updating to database
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || !category) {
      alert("Please complete Product Name, positive Cost/Price, and Category.");
      return;
    }
    if (images.length === 0) {
      alert("Please load at least one product image.");
      return;
    }

    setLoading(true);
    const productPayload = {
      name,
      description,
      price: Number(price),
      category,
      images
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
      } else {
        await addProduct(productPayload);
      }
      setIsFormOpen(false);
      loadAdminData(); // Refresh list representation
    } catch (err) {
      console.error("Form submit error:", err);
      alert("Failed to save product details to storage. Check Firestore configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Handles item removals
  const handleDeleteProductAction = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this luxury asset? This action is irreversible.")) {
      setLoading(true);
      try {
        await deleteProduct(id);
        loadAdminData();
      } catch (err) {
        console.error("Delete operation failure:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter products by searching term
  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-screen">
      {/* ---------------- DECORATIVE PASSKEY LOCK SCREEN GATE ---------------- */}
      {!isAdminUnlocked ? (
        <div id="admin-passcode-view" className="max-w-md mx-auto py-24 text-center">
          <div className="w-16 h-16 bg-[#1a1711] border border-[#D4AF37]/35 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4AF37] animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-white tracking-widest uppercase font-light mb-2">Maison Ledger Vault</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-8">Access is restricted to authorized personnel. Enter your Administrative Passcode to unlock the ledger core.</p>
          
          <div className="space-y-4">
           <input
  type="password"
  placeholder="PASSCODE"
  value={passkey}
  onChange={(e) => setPasskey(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      if (passkey === 'SatyaX@2026') {
        setIsAdminUnlocked(true);
      } else {
        alert('Wrong Password');
      }
    }
  }}
  className="w-full bg-[#111] border border-[#D4AF37]/30 text-center py-3.5 text-xs text-white uppercase tracking-[0.3em] font-mono focus:outline-none focus:border-[#D4AF37]"
/>

<button
  onClick={() => {
    if (passkey === 'SatyaX@2026') {
      setIsAdminUnlocked(true);
    } else {
      alert('Wrong Password');
    }
  }}
  className="w-full py-4 bg-transparent border border-[#D4AF37]/45 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black tracking-widest text-xs uppercase font-semibold transition-all cursor-pointer"
>
  Verify Credentials
</button>
          </div>
        </div>
      ) : (
        /* ------------------ ACTIVE ADMIN DASHBOARD ------------------ */
        <div className="space-y-12 animate-fade-in">
          {/* Page Headers */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#D4AF37]/20">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Maison Satya Collection Manager</span>
              </div>
              <h1 id="admin-title" className="font-serif text-3xl md:text-4xl text-white tracking-[0.1em] font-light uppercase">
                Satya X Co <span className="text-[#D4AF37] italic">Ledger</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="refresh-data-btn"
                onClick={loadAdminData}
                disabled={loading}
                className="px-5 py-3.5 bg-[#111111] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-xs text-gray-300 font-medium tracking-widest uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ₹{loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                Sync Data
              </button>

              <button
                id="add-product-btn"
                onClick={openAddForm}
                className="px-6 py-3.5 bg-[#D4AF37] text-black hover:bg-[#c5a12f] text-xs font-semibold tracking-widest uppercase flex items-center gap-2 transition-transform cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Asset
              </button>
            </div>
          </div>

          {/* Luxury Dashboard Metrics cards */}
          <div 
            id="admin-metrics-grid"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-[#080808] border border-[#D4AF37]/15 p-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-widest text-[#D4AF37] uppercase font-sans font-semibold mb-1">Maison Product Count</p>
                <h3 className="font-serif text-2xl text-white font-light">{totalAssetsCount} <span className="text-xs font-sans text-gray-500">models</span></h3>
              </div>
              <div className="w-10 h-10 rounded-none bg-[#111] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Layers className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-[#080808] border border-[#D4AF37]/15 p-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-widest text-[#D4AF37] uppercase font-sans font-semibold mb-1">Total Ledger Orders Amount</p>
                <h3 className="font-mono text-xl text-[#D4AF37] font-semibold">₹{totalOrdersValuation.toLocaleString()} <span className="text-xs font-sans text-gray-500 font-light">₹</span></h3>
              </div>
              <div className="w-10 h-10 rounded-none bg-[#111] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-[#080808] border border-[#D4AF37]/15 p-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-widest text-[#D4AF37] uppercase font-sans font-semibold mb-1">Cumulative Catalog Valuation</p>
                <h3 className="font-mono text-xl text-[#D4AF37] font-semibold">₹{totalAtelierWorth.toLocaleString()} <span className="text-xs font-sans text-gray-500 font-light">₹</span></h3>
              </div>
              <div className="w-10 h-10 rounded-none bg-[#111] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Tag className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* INVENTORY SUITE - 7 columns */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/15">
                <h3 className="font-serif text-lg text-white tracking-widest uppercase font-light">Product Catalog</h3>
                
                {/* Admin small search */}
                <div className="relative w-48 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search Catalog..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#111111] border border-[#D4AF37]/20 text-[10px] text-white rounded-none focus:outline-none focus:border-[#D4AF37] tracking-widest uppercase font-sans placeholder-gray-600"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-24 text-[#D4AF37] font-mono text-xs animate-pulse">Synchronizing vault logs...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 border border-[#D4AF37]/10 bg-[#080808] text-gray-500 font-sans text-xs uppercase tracking-widest">
                  No products loaded in Maison catalogs.
                </div>
              ) : (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {filteredProducts.map((p) => (
                    <div 
                      key={p.id}
                      id={`admin-item-₹{p.id}`}
                      className="bg-[#080808] border border-[#D4AF37]/12 p-4 flex items-center justify-between gap-4 relative hover:border-[#D4AF37]/35 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={p.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=100'} 
                          alt={p.name} 
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover bg-[#050505] border border-[#D4AF37]/15 text-center text-[#D4AF37] text-[8px]"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-white tracking-widest uppercase">{p.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono text-[#D4AF37] py-0.5 px-2 bg-[#171510] border border-[#D4AF37]/30 uppercase tracking-widest font-bold">
                              {p.category}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls trigger buttons (Edit/Delete) */}
                      <div className="flex items-center gap-2">
                        <button
                          id={`edit-item-btn-₹{p.id}`}
                          onClick={() => openEditForm(p)}
                          className="p-2.5 bg-[#121212] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/20 transition-colors"
                          title="Edit Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-item-btn-₹{p.id}`}
                          onClick={() => handleDeleteProductAction(p.id)}
                          className="p-2.5 bg-[#1a1212] text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOMER CUSTOM ORDERS LEDGER - 5 columns */}
            <div className="lg:col-span-5 space-y-6">
              <div className="pb-4 border-b border-[#D4AF37]/15">
                <h3 className="font-serif text-lg text-white tracking-widest uppercase font-light">Submitted Orders</h3>
              </div>

              {loading ? (
                <div className="text-center py-24 text-[#D4AF37] font-mono text-xs animate-pulse">Syncing transactions ledger...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 border border-[#D4AF37]/10 bg-[#080808] text-gray-500 font-sans text-xs uppercase tracking-widest">
                  No orders cataloged yet.
                </div>
              ) : (
                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div 
                      key={o.id}
                      className="bg-[#080808] border border-[#D4AF37]/15 p-5 space-y-4 rounded-none hover:border-[#D4AF37]/35 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/10">
                        <span className="font-mono text-xs text-[#D4AF37] font-bold">#{o.id.substring(0, 10).toUpperCase()}</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 tracking-wide">
                        <p className="text-white font-semibold uppercase">{o.customerName}</p>
                        <p className="text-gray-400 font-mono text-[11px]">{o.customerPhone}</p>
                        {o.customerEmail && <p className="text-gray-500 text-[11px]">{o.customerEmail}</p>}
                        <p className="text-gray-400 leading-relaxed mt-2 bg-[#121212] p-3 border border-[#D4AF37]/10 font-sans italic text-[11px]">{o.customerAddress}</p>
                      </div>

                      {/* Display item summary list */}
                      <div className="border-t border-b border-[#D4AF37]/10 py-3 space-y-2">
                        {o.items.map((item, idItem) => (
                          <div key={idItem} className="flex justify-between text-xs font-sans tracking-wide">
                            <span className="text-gray-400">{item.name} <span className="font-mono text-[10px] text-[#D4AF37] font-semibold">x{item.quantity}</span></span>
                            <span className="text-white font-mono font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] uppercase text-gray-500 tracking-wider">Luxe valuation</span>
                        <span className="text-[#D4AF37] font-bold font-mono text-xs">₹{o.totalAmount.toLocaleString()} INR</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------------- CREATE / EDIT PRODUCT SLIDEOVER MODAL ---------------- */}
          {isFormOpen && (
            <div 
              id="product-form-modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
              onClick={() => setIsFormOpen(false)}
            >
              <div 
                className="bg-[#0e0e0e] border border-[#D4AF37]/40 w-full max-w-2xl p-6 sm:p-10 rounded-none shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Form model */}
                <button
                  id="close-product-form"
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#141414] border border-[#D4AF37]/30"
                >
                  <X className="w-4 h-4" />
                </button>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl tracking-widest text-white uppercase font-light">
                      {editingProductId ? "Modify Luxury Asset" : "Establish New Asset"}
                    </h3>
                    <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.25em] mt-1">
                      {editingProductId ? "Atelier Inventory Mod" : "Registre New Design"}
                    </p>
                    <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-3"></div>
                  </div>

                  {/* Asset Name text fields */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase text-gray-400 font-sans font-medium">Design / Asset Name</label>
                    <input
                      id="form-name-input"
                      type="text"
                      required
                      placeholder="e.g. Satya Gold Crown Chrono"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none uppercase tracking-wider font-sans"
                    />
                  </div>

                  {/* Pricing and Category row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 font-sans font-medium">Cost / Price (₹ INR)</label>
                      <input
                        id="form-price-input"
                        type="number"
                        min={0}
                        required
                        placeholder="Cost"
                        value={price || ''}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none font-mono tracking-wider"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-gray-400 font-sans font-medium">Category</label>
                      <select
                        id="form-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none tracking-widest uppercase font-mono"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description long fields */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase text-gray-400 font-sans font-medium">Design Narrative &amp; Description</label>
                    <textarea
                      id="form-desc-textarea"
                      rows={4}
                      placeholder="Write the editorial background narrative of craftsmanship..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#141414] border border-[#D4AF37]/20 px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] rounded-none leading-relaxed tracking-wider resize-none"
                    />
                  </div>

                  {/* Drag-and-Drop and manual dual File selector uploads */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase text-gray-400 font-sans font-medium">Asset Illustration Images</label>
                    
                    {/* Drag layout container box */}
                    <div
                      id="drag-upload-container"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 relative rounded-none ${
                        isDragOver 
                          ? 'border-[#D4AF37] bg-[#1c1810]' 
                          : 'border-[#D4AF37]/30 bg-[#141414] hover:bg-[#1a1a1a] hover:border-[#D4AF37]/60'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 text-[#D4AF37] opacity-80" />
                      <div>
                        <p className="text-xs text-white font-medium tracking-wide uppercase">Drag &amp; Drop imagery here</p>
                        <p className="text-[9px] text-[#D4AF37] uppercase mt-1 tracking-widest">or click to manually browse storage (Multiple uploads supported)</p>
                      </div>
                      {uploadProgress && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                          <span className="text-[10px] tracking-widest font-mono text-[#D4AF37] uppercase">Uploading Asset into Storage...</span>
                        </div>
                      )}
                    </div>

                    {/* Loaded Product Image Previews with Edit replacement/Delete buttons */}
                    {images.length > 0 && (
                      <div className="pt-4 space-y-2">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider font-medium">Uploaded Asset Files ({images.length})</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {images.map((imgUrl, imgIdx) => (
                            <div 
                              key={imgIdx} 
                              className="relative aspect-square border border-[#D4AF37]/25 bg-black group rounded-none"
                            >
                              <img 
                                src={imgUrl} 
                                alt={`Asset Preview ${imgIdx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover text-center text-xs text-[#D4AF37]"
                              />
                              
                              {/* Overlay operations index controller */}
                              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => triggerImageReplacementSelector(imgIdx)}
                                  className="px-2 py-1 bg-[#1a160e] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] tracking-wider uppercase font-semibold hover:border-[#D4AF37] transition-colors"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImageAtIndex(imgIdx)}
                                  className="px-2 py-1 bg-red-950/80 text-rose-400 border border-rose-500/20 text-[10px] tracking-wider uppercase font-semibold hover:border-rose-400 transition-colors cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                              <span className="absolute bottom-1 right-2 bg-black/80 font-mono text-[8px] text-gray-400 px-1 py-0.5 border border-[#D4AF37]/10">
                                #{imgIdx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission and reset control buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#D4AF37]/15">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3.5 bg-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 text-gray-400 hover:text-white text-xs tracking-widest uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-[#D4AF37] text-black hover:bg-[#c5a12f] text-xs font-semibold tracking-widest uppercase rounded-none transition-shadow cursor-pointer"
                    >
                      Save Design Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
