import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ChefHat, 
  Calendar, 
  UtensilsCrossed, 
  MapPin, 
  Navigation,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  QrCode,
  Star,
  MessageSquare,
  Send,
  XCircle,
  Plus,
  LocateFixed,
  CreditCard
} from 'lucide-react';
import { User, Order, AppConfig, MenuItem, OrderStatus, OrderType, UserAddress } from '../types';
import { formatCurrency, cn, generateOTP } from '../lib/utils';
import { SEASONS, PARTY_CATEGORIES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const socket = io();

export default function UserPanel({ user, config }: { user: User, config: AppConfig | null }) {
  const [activeTab, setActiveTab] = useState<'book' | 'orders' | 'profile'>('book');
  const [orderType, setOrderType] = useState<OrderType>('DAILY');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [newAddress, setNewAddress] = useState({ label: '', address: '', location: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [plateCount, setPlateCount] = useState<number>(10);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setNewAddress(prev => ({ ...prev, location: googleMapsUrl }));
        setDetectingLocation(false);
      },
      (error) => {
        console.error(error);
        alert('Could not detect location. Please enter manually.');
        setDetectingLocation(false);
      }
    );
  };
  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(setMenu);
    fetch('/api/orders').then(res => res.json()).then(data => {
      setMyOrders(data.filter((o: Order) => o.userId === user.id).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
    fetch(`/api/users`).then(res => res.json()).then(users => {
      const u = users.find((u: any) => u.id === user.id);
      if (u) setCurrentUser(u);
    });

    socket.on('orderAccepted', ({ orderId, chefId }) => {
       fetch('/api/orders').then(res => res.json()).then(data => {
        setMyOrders(data.filter((o: Order) => o.userId === user.id).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      });
    });

    return () => { socket.off('orderAccepted'); };
  }, [user.id]);

  const updateProfile = (updates: Partial<User>) => {
    fetch(`/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(res => res.json()).then(updated => {
      setCurrentUser(updated);
    });
  };

  const handleBook = () => {
    if (!selectedAddress) return alert('Please select a delivery address in Profile tab first');
    
    let itemsToBook = [...selectedItems];

    if (orderType === 'DAILY') {
      itemsToBook = [{
        id: 'daily_package_' + Date.now(),
        name: 'Daily Veg Cooking Session (Package)',
        price: 0,
        type: 'DAILY',
        category: 'Package'
      }];
    } else if (orderType === 'PARTY') {
      const selectedCategories = new Set(itemsToBook.map(i => i.category));
      if (selectedCategories.size < PARTY_CATEGORIES.length) {
        return alert(`Please select items from all ${PARTY_CATEGORIES.length} categories for a complete Party Menu.`);
      }
    }
    
    setIsBooking(true);
    const newOrder = {
      userId: user.id,
      userEmail: user.email,
      userPhone: currentUser.phone || currentUser.whatsapp,
      type: orderType,
      items: itemsToBook,
      status: OrderStatus.PENDING,
      otp: generateOTP(),
      address: selectedAddress.address,
      googleLocation: selectedAddress.googleLocation || selectedAddress.location,
      plateCount: orderType === 'PARTY' ? plateCount : 1,
      totalAmount: orderType === 'PARTY' ? (555 * plateCount) : itemsToBook.reduce((acc, curr) => acc + curr.price, 0)
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).then(res => res.json()).then(async saved => {
      setMyOrders([saved, ...myOrders]);
      
      // If it's a PARTY order, initiate payment immediately (50% or full as per business rule, here we use total)
      if (orderType === 'PARTY') {
        try {
          const payRes = await fetch('/api/phonepe/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: saved.totalAmount,
              orderId: saved.id,
              redirectUrl: window.location.origin + '/orders'
            })
          });
          const payData = await payRes.json();
          if (payData.redirectUrl) {
            window.location.href = payData.redirectUrl;
            return;
          }
        } catch (err) {
          console.error("Payment initiation failed", err);
        }
      }

      setIsBooking(false);
      setActiveTab('orders');
      setSelectedItems([]);
    });
  };

  const toggleItem = (item: MenuItem) => {
    setSelectedItems(prev => 
      prev.find(i => i.id === item.id) 
        ? prev.filter(i => i.id !== item.id) 
        : [...prev, item]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Promo */}
      <section className="bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 max-w-lg">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Elite Indian Service</span>
              <h2 className="text-5xl font-black tracking-tighter mt-4 leading-tight">Authentic Taste, <br/>Cooked in Your Kitchen.</h2>
              <p className="text-gray-400 mt-6 text-lg font-medium leading-relaxed">Book a professional chef for daily meals or special party celebrations. Only Rs. 3 per minute.</p>
              <button 
                onClick={() => setActiveTab('book')}
                className="mt-8 bg-white text-black px-10 h-16 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
              >
                Start Booking <ArrowRight size={20} />
              </button>
            </motion.div>
         </div>
         <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center brightness-75 hide-on-mobile opacity-50" />
      </section>

      {/* Main Nav */}
      <div className="flex border-b border-gray-200">
         {[
           { id: 'book', label: 'Book Chef', icon: <ChefHat size={18} /> },
           { id: 'orders', label: 'My Bookings', icon: <Calendar size={18} /> },
           { id: 'profile', label: 'Profile', icon: <Users size={18} /> }
         ].map((t) => (
           <button
             key={t.id}
             onClick={() => setActiveTab(t.id as any)}
             className={cn(
               "px-8 py-5 font-bold text-sm tracking-tight flex items-center gap-2 transition-all relative font-black uppercase tracking-widest",
               activeTab === t.id ? "text-red-600" : "text-gray-400 hover:text-gray-600"
             )}
           >
             {t.icon} {t.label}
             {activeTab === t.id && (
               <motion.div layoutId="user-tab" className="absolute bottom-0 left-0 w-full h-1 bg-red-600" />
             )}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'book' ? (
          <motion.div key="book-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
             <div className="flex gap-4">
                <button 
                  onClick={() => { setOrderType('DAILY'); setSelectedItems([]); }}
                  className={cn(
                    "flex-1 p-8 rounded-[2.5rem] border-2 transition-all text-left group",
                    orderType === 'DAILY' ? "border-red-600 bg-red-50/50" : "border-gray-100 bg-white"
                  )}
                >
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all", orderType === 'DAILY' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-600")}>
                      <Clock size={28} />
                   </div>
                   <h3 className="text-xl font-black">Daily Meals</h3>
                   <p className="text-sm font-medium text-gray-400 mt-2">Home cooked veg meals for daily needs. Rs. 3/min.</p>
                </button>
                <button 
                  onClick={() => { setOrderType('PARTY'); setSelectedItems([]); }}
                  className={cn(
                    "flex-1 p-8 rounded-[2.5rem] border-2 transition-all text-left group",
                    orderType === 'PARTY' ? "border-purple-500 bg-purple-50/50" : "border-gray-100 bg-white"
                  )}
                >
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all", orderType === 'PARTY' ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-500")}>
                      <TrendingUp size={28} />
                   </div>
                   <h3 className="text-xl font-black">Party Special</h3>
                   <p className="text-sm font-medium text-gray-400 mt-2">Starters + Main + Dessert • Rs. 555 Per Plate</p>
                   {orderType === 'PARTY' && (
                     <div className="mt-4 p-4 bg-white rounded-2xl border border-purple-100 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Plates (Min 10)</span>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setPlateCount(Math.max(10, plateCount - 1)); }}
                             className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black"
                           >-</button>
                           <span className="text-lg font-black w-8 text-center">{plateCount}</span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setPlateCount(plateCount + 1); }}
                             className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black"
                           >+</button>
                        </div>
                     </div>
                   )}
                   <p className="text-[9px] font-bold text-red-500 mt-4 leading-relaxed uppercase tracking-widest italic bg-red-100/50 p-3 rounded-xl">
                      50% advance payment is required at the time of booking, and the full payment must be cleared one day before the event.
                   </p>
                </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Daily Vegetable List Image Reference - No Selection anymore as per user request */}
                    {orderType === 'DAILY' && config?.dailyVegImageUrl && (
                      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Chef's Daily Vegetable Reference</h4>
                            <a href={config.dailyVegImageUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 text-[10px] font-black uppercase tracking-widest hover:underline">Full Image</a>
                        </div>
                        <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                            <img src={config.dailyVegImageUrl} className="w-full h-full object-contain bg-gray-50" alt="Daily Veg Reference" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black tracking-tight">{orderType === 'DAILY' ? 'Session Package' : 'Select Menu'}</h3>
                       <div className="flex gap-2">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">
                             {orderType === 'PARTY' ? 'Select 3 Items' : 'Unlimited Choice'}
                          </span>
                       </div>
                    </div>

                   {orderType === 'PARTY' ? (
                     <div className="space-y-10">
                        {config?.partyMenuImageUrl && (
                          <div className="mt-8 mb-8 group">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Reference Party Menu</h4>
                                <a href={config.partyMenuImageUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 text-[10px] font-black uppercase tracking-widest hover:underline">Full Image</a>
                            </div>
                            <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                                <img src={config.partyMenuImageUrl} className="w-full h-full object-contain bg-gray-50" alt="Party Menu Reference" />
                            </div>
                          </div>
                        )}
                        {PARTY_CATEGORIES.map(cat => (
                           <div key={cat.name} className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {cat.name}
                                 </h4>
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Any {cat.limit}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {menu.filter(m => m.type === 'PARTY' && m.category === cat.name).map(item => {
                                    const isSelected = selectedItems.some(i => i.id === item.id);
                                    const sameCatCount = selectedItems.filter(i => i.category === cat.name).length;
                                    
                                    return (
                                       <button 
                                         key={item.id}
                                         onClick={() => {
                                            if (isSelected) {
                                               toggleItem(item);
                                            } else if (sameCatCount < cat.limit) {
                                               toggleItem(item);
                                            } else if (cat.limit === 1) {
                                               setSelectedItems(prev => [...prev.filter(i => i.category !== cat.name), item]);
                                            } else {
                                               alert(`You can select max ${cat.limit} items from ${cat.name}`);
                                            }
                                         }}
                                         className={cn(
                                           "p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden",
                                           isSelected ? "border-purple-500 bg-purple-50/30" : "border-gray-50 bg-[#FBFBFB] hover:border-gray-200"
                                         )}
                                       >
                                          <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                          {isSelected && (
                                            <div className="absolute right-0 top-0 bg-purple-500 text-white p-2 rounded-bl-2xl">
                                               <CheckCircle2 size={16} />
                                            </div>
                                          )}
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        ))}
                     </div>
                   ) : (
                     <div className="p-10 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl">
                           <CheckCircle2 size={32} />
                        </div>
                        <h4 className="text-2xl font-black text-gray-900">Daily Package Activated</h4>
                        <p className="text-sm font-medium text-gray-600 max-w-sm">No individual item selection required. Our chef will prepare a healthy daily meal session for you.</p>
                     </div>
                   )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                   <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-10 shadow-2xl shadow-red-100">
                      <h3 className="text-xl font-black mb-2">Order Summary</h3>
                    {selectedAddress && (
                      <div className="flex items-center gap-2 mb-6">
                        <MapPin size={12} className="text-red-500" />
                        <span className="text-[10px] font-bold text-gray-400">Delivering to: {selectedAddress.label} • {currentUser.phone || currentUser.whatsapp}</span>
                      </div>
                    )}
                      
                              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                 {selectedItems.length === 0 && orderType !== 'DAILY' ? (
                                   <div className="space-y-2">
                                     <p className="text-gray-500 text-xs italic font-medium">No items selected yet</p>
                                   </div>
                                 ) : orderType === 'DAILY' ? (
                                   <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Standard Package</p>
                                      <p className="text-xs font-bold text-white">Daily Veg Cooking Session (Package)</p>
                                   </div>
                                 ) : (
                                   selectedItems.map(item => (
                                     <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                        <div className="flex flex-col">
                                           <span className="text-xs font-bold leading-tight">{item.name}</span>
                                        </div>
                                        <span className={cn("text-[10px] font-black", item.price === 0 ? "text-green-400" : "text-orange-400")}>
                                           {item.price === 0 ? 'FREE' : formatCurrency(item.price)}
                                        </span>
                                     </div>
                                   ))
                                 )}
                              </div>

                      <div className="space-y-4 py-6 border-y border-white/10">
                         <div className="space-y-2">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pick Delivery Address</h4>
                             <div className="space-y-2">
                                {currentUser.addresses?.map(addr => (
                                   <button 
                                      key={addr.id}
                                      onClick={() => setSelectedAddress(addr)}
                                      className={cn(
                                        "w-full p-4 rounded-2xl text-left text-[11px] font-bold border-2 transition-all",
                                        selectedAddress?.id === addr.id ? "border-red-500 bg-red-500/10 text-red-500" : "border-white/5 bg-white/5 text-gray-400"
                                      )}
                                   >
                                      <div className="flex justify-between items-center">
                                         <span>{addr.label}: {addr.address.slice(0, 30)}...</span>
                                         {(addr.googleLocation || addr.location) && <Navigation size={10} className="text-blue-400" />}
                                      </div>
                                   </button>
                                ))}
                                {(!currentUser.addresses || currentUser.addresses.length === 0) && (
                                   <button onClick={() => setActiveTab('profile')} className="text-red-600 text-xs font-black underline">Add Address First</button>
                                )}
                             </div>
                         </div>
                      </div>

                      <div className="mt-8 space-y-6">
                         <div className="flex justify-between items-end">
                            <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Total Amount</span>
                            <span className="text-3xl font-black text-red-600">
                               {orderType === 'PARTY' ? formatCurrency(555 * plateCount) : formatCurrency(selectedItems.reduce((acc, curr) => acc + curr.price, 0))}
                            </span>
                         </div>
                         <button 
                           onClick={handleBook}
                           disabled={isBooking || !selectedAddress}
                           className="w-full h-16 bg-[#E31E24] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                         >
                            {isBooking ? 'Processing...' : 'Confirm Booking'}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        ) : activeTab === 'orders' ? (
          <motion.div key="orders-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             {myOrders.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 space-y-4">
                 <Clock size={48} className="mx-auto text-gray-200" />
                 <p className="font-bold text-gray-400">You haven't made any bookings yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myOrders.map(order => (<div key={order.id}><OrderCard order={order} config={config!} /></div>))}
               </div>
             )}
          </motion.div>
        ) : (
          <motion.div key="profile-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                      <div className="w-24 h-24 bg-red-50 rounded-full mx-auto flex items-center justify-center text-red-600 mb-4">
                         <Users size={40} />
                      </div>
                      <h3 className="text-xl font-black">{currentUser.name} {currentUser.surname}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Code: {currentUser.customerCode || 'Not Assigned'}</p>
                   </div>

                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</h4>
                      <div className="space-y-3">
                         <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                            <UtensilsCrossed size={16} className="text-red-600" />
                            <div className="flex-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp</p>
                               <p className="text-sm font-bold text-gray-700">{currentUser.whatsapp || 'Not set'}</p>
                            </div>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                            <Navigation size={16} className="text-red-600" />
                            <div className="flex-1 text-xs break-all">
                               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location URL</p>
                               <span className="font-bold text-gray-700">{currentUser.googleLocation || 'Not set'}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-2xl font-black tracking-tight">Saved Addresses</h3>
                         <button 
                           onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setNewAddress({ label: '', address: '', location: '' }); }}
                           className="px-6 h-12 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                         >Add New</button>
                      </div>

                      {isAddingAddress && (
                        <div className="mb-10 p-8 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                           <div className="grid grid-cols-2 gap-4">
                              <input 
                                placeholder="Label (Home, Office, etc.)"
                                className="h-12 bg-white rounded-xl px-4 text-sm font-bold outline-orange-500"
                                value={newAddress.label}
                                onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                              />
                              <div className="relative group">
                                <input 
                                  placeholder="Google Maps Location URL"
                                  className="w-full h-12 bg-white rounded-xl pl-4 pr-10 text-sm font-bold outline-orange-500 border border-gray-100"
                                  value={newAddress.location}
                                  onChange={e => setNewAddress({...newAddress, location: e.target.value})}
                                />
                                <button 
                                  onClick={detectLocation}
                                  className={cn(
                                    "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
                                    detectingLocation ? "text-red-600 animate-pulse" : "text-gray-400 hover:text-red-600"
                                  )}
                                  title="Detect Current Location"
                                >
                                  <LocateFixed size={16} />
                                </button>
                              </div>
                           </div>
                           <textarea 
                              placeholder="Full Delivery Address"
                              className="w-full p-4 bg-white rounded-xl text-sm font-bold h-32 outline-red-600 resize-none"
                              value={newAddress.address}
                              onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                           />
                           <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const addr = { id: editingAddressId || Date.now().toString(), ...newAddress };
                                  const updatedAddresses = editingAddressId 
                                    ? currentUser.addresses?.map(a => a.id === editingAddressId ? addr : a)
                                    : [...(currentUser.addresses || []), addr];
                                  updateProfile({ addresses: updatedAddresses });
                                  setIsAddingAddress(false);
                                }}
                                className="flex-1 h-12 bg-gray-900 text-white rounded-xl text-xs font-bold"
                              >
                                {editingAddressId ? 'Update Address' : 'Save Address'}
                              </button>
                              <button onClick={() => setIsAddingAddress(false)} className="px-6 h-12 text-gray-400 font-bold">Cancel</button>
                           </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {currentUser.addresses?.length === 0 && <p className="text-gray-400 font-medium italic col-span-2 text-center py-10 border-2 border-dashed border-gray-50 rounded-3xl">No addresses saved yet</p>}
                         {currentUser.addresses?.map(addr => (
                           <div key={addr.id} className="p-6 rounded-[2rem] border-2 border-gray-50 bg-[#F9F8F7] space-y-3 relative group">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-orange-500">
                                    <MapPin size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{addr.label}</span>
                                 </div>
                                 <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setEditingAddressId(addr.id);
                                        setNewAddress({ label: addr.label, address: addr.address, location: addr.location || '' });
                                        setIsAddingAddress(true);
                                      }}
                                      className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors"
                                    >Edit</button>
                                 </div>
                              </div>
                              <p className="text-xs font-bold text-gray-600 leading-relaxed">{addr.address}</p>
                              {(addr.googleLocation || addr.location) && (
                                <a href={addr.googleLocation || addr.location} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline block">View on Map</a>
                              )}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  config: AppConfig | null;
}

function OrderCard({ order, config }: OrderCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [rating, setRating] = useState(order.rating || 0);
  const [review, setReview] = useState(order.review || '');
  const [isPaying, setIsPaying] = useState(false);

  const handlePhonePePay = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/phonepe/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: order.totalAmount,
          orderId: order.id,
          redirectUrl: window.location.origin + '/orders'
        })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Payment failed to initiate: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  const shareAddressOnWhatsApp = () => {
    const text = encodeURIComponent(`Hello, I've booked a session with ID #${order.bookingId || order.id.slice(-6).toUpperCase()}. Please come to this address: ${order.address} \n\nLocation: ${order.googleLocation || ''}`);
    window.open(`https://wa.me/${config?.contactPhone.replace(/\D/g, '') || ''}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
       <div className="p-8 space-y-6 flex-1">
          <div className="flex justify-between items-start">
             <div>
                <div className="flex items-center gap-2">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                     order.status === OrderStatus.PAID ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                   )}>
                     {order.status}
                   </span>
                   <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">#{order.bookingId || order.id.slice(-6).toUpperCase()}</span>
                </div>
                <h4 className="text-2xl font-black tracking-tight mt-2">{order.type} Session</h4>
                <div className="flex flex-col gap-1 mt-3">
                   <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                      <MapPin size={10} className="text-gray-400" />
                      {order.address}
                   </p>
                   <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                      <Clock size={10} className="text-gray-400" />
                      Contact: {order.userPhone || 'N/A'}
                   </p>
                </div>
             </div>
             <div className="text-xs text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest">
               {new Date(order.createdAt).toLocaleDateString()}
             </div>
          </div>

          <div className="space-y-2">
             {order.items.map(i => (
               <div key={i.id} className="text-sm font-medium flex items-center gap-2 text-gray-600">
                  <CheckCircle2 size={14} className="text-green-500" /> {i.name}
               </div>
             ))}
          </div>

      {order.chefId && (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                 <ChefHat size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Assigned Chef</p>
                 <h5 className="text-sm font-black text-gray-900">{order.chefName || 'Cooking Partner'}</h5>
                 <p className="text-[10px] font-bold text-gray-500">{order.chefPhone || 'Contacting...'}</p>
                 {order.chefPhone && (
                    <p className="text-[10px] font-bold text-blue-600 mt-1">Status: Chef is tracking your location</p>
                 )}
              </div>
           </div>
           {order.chefPhone && (
             <button 
                onClick={() => {
                   const text = encodeURIComponent(`Hello Chef, I am waiting for you at: ${order.address}`);
                   window.open(`https://wa.me/${order.chefPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
                }}
                className="w-10 h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
             >
                <MessageSquare size={18} />
             </button>
           )}
        </div>
      )}

      {(order.status === OrderStatus.PENDING || order.status === OrderStatus.COOKING) && (
            <div className="bg-[#F9F8F7] p-8 rounded-[2rem] text-center space-y-4 border border-gray-50 relative group">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">OTP For Chef</div>
               <div className="text-5xl font-black tracking-[0.5em] text-gray-900 border-2 border-dashed border-red-100 py-6 rounded-2xl bg-white">{order.otp}</div>
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-10">Verification code to start cooking session</p>
               
               <button 
                  onClick={shareAddressOnWhatsApp}
                  className="mt-4 w-full h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 font-black text-xs hover:scale-[1.02] transition-all"
               >
                  <MessageSquare size={16} /> Share Address on WhatsApp
               </button>
            </div>
          )}

          {order.status !== OrderStatus.PAID && order.status !== OrderStatus.COMPLETED && (
            <div className="space-y-3">
               <button 
                  onClick={handlePhonePePay}
                  disabled={isPaying}
                  className="w-full h-12 bg-[#5f259f] text-white rounded-xl flex items-center justify-center gap-2 font-black text-xs hover:scale-[1.02] transition-all shadow-lg"
               >
                  <CreditCard size={16} /> {isPaying ? 'Redirecting...' : 'Pay with PhonePe'}
               </button>
               <button 
                  onClick={() => setShowQR(!showQR)}
                  className="w-full h-12 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center gap-2 font-black text-xs hover:bg-gray-200 transition-all"
               >
                  <QrCode size={16} /> {showQR ? 'Hide QR Code' : 'Pay via UPI QR'}
               </button>
            </div>
          )}

          {order.status === OrderStatus.PAID && (
            <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-green-50 rounded-3xl border border-green-100">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Final Amount</p>
                      <div className="text-3xl font-black text-green-700">{formatCurrency(order.totalAmount || 0)}</div>
                  </div>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="p-4 bg-white text-gray-900 rounded-2xl shadow-sm hover:scale-110 transition-all border border-green-200"
                  >
                    <QrCode size={24} />
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Rate Your Chef</h5>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(s => (
                           <button 
                            key={s} 
                            onClick={() => setRating(s)}
                            disabled={!!order.rating}
                            className={cn(
                              "transition-all",
                              s <= (rating || 0) ? "text-red-600" : "text-gray-200",
                              !order.rating && "hover:scale-125"
                            )}
                           >
                               <Star size={24} fill={s <= (rating || 0) ? "currentColor" : "none"} />
                           </button>
                        ))}
                    </div>
                    {!order.rating ? (
                       <div className="mt-4 flex gap-2">
                           <input 
                            placeholder="Write a brief review..."
                            className="flex-1 h-10 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold outline-red-600"
                            value={review}
                            onChange={e => setReview(e.target.value)}
                           />
                           <button 
                            onClick={() => {
                              fetch(`/api/orders/${order.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ rating, review })
                              }).then(() => {
                                alert('Thank you for your rating!');
                              });
                            }}
                            className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center"
                           >
                               <Send size={16} />
                           </button>
                       </div>
                    ) : (
                       <p className="mt-4 text-xs text-gray-400 italic">" {order.review} "</p>
                    )}
                </div>
            </div>
          )}
       </div>
       
       <AnimatePresence>
         {showQR && (
            <motion.div 
               initial={{ height: 0 }} 
               animate={{ height: 'auto' }} 
               exit={{ height: 0 }}
               className="bg-gray-50 border-t border-gray-100 overflow-hidden"
            >
               <div className="p-10 flex flex-col items-center text-center space-y-6">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-xl">
                     <QRCodeSVG value={`upi://pay?pa=${config?.upiId}&am=${order.totalAmount}&tn=HC-Order-${order.bookingId}`} size={200} />
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Scan & Pay via UPI</p>
                     <p className="text-sm font-bold text-gray-900">{config?.upiId}</p>
                  </div>
               </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
