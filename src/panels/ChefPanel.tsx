import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  MapPin, 
  CheckCircle, 
  Play, 
  Square, 
  MessageCircle, 
  Globe,
  Bell,
  Wallet
} from 'lucide-react';
import { User, Order, OrderStatus, AppConfig } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function ChefPanel({ user, config }: { user: User, config: AppConfig | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(user.isOnline || false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [otpInput, setOtpInput] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
      
      const withdrawalsData = await api.getWithdrawals();
      const myWithdrawals = withdrawalsData.filter((w: any) => w.chefId === user.id);
      setWithdrawals(myWithdrawals);
      
      const allOrders = await api.getOrders();
      const myEarnings = allOrders
        .filter((o: Order) => o.chefId === user.id && o.status === OrderStatus.PAID)
        .reduce((acc: number, o: Order) => acc + (o.commissionChef || 0), 0);
      
      const totalWithdrawn = myWithdrawals
        .filter((w: any) => w.status !== 'REJECTED')
        .reduce((acc: number, w: any) => acc + w.amount, 0);
      
      setWalletBalance(myEarnings - totalWithdrawn);
    };
    
    loadData();
  }, [isOnline]);

  useEffect(() => {
    let interval: any;
    if (activeOrder && activeOrder.status === OrderStatus.COOKING) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeOrder]);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.filter((o: Order) => o.status === OrderStatus.PENDING && !o.chefId));
      const active = data.find((o: Order) => o.chefId === user.id && (o.status === OrderStatus.COOKING || o.status === OrderStatus.PENDING));
      if (active) setActiveOrder(active);
    } catch (err) {
      console.warn("Failed to fetch orders", err);
    }
  };

  const toggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const acceptOrder = async (order: Order) => {
    try {
      const updated = await api.updateOrder(order.id, { 
        chefId: user.id,
        chefName: `${user.name} ${user.surname}`,
        chefPhone: user.phone || user.whatsapp
      });
      setActiveOrder(updated);
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (err) {
      alert('Failed to accept order');
    }
  };

  const startCooking = async () => {
    if (otpInput === activeOrder?.otp) {
      try {
        const updated = await api.updateOrder(activeOrder.id, { status: OrderStatus.COOKING, startTime: new Date() });
        setActiveOrder(updated);
      } catch (err) {
        alert('Failed to start cooking');
      }
    } else {
      alert('Invalid OTP');
    }
  };

  const endCooking = async () => {
    const rate = config?.cookingRatePerMin || 3;
    const totalMin = Math.ceil(elapsedTime / 60);
    const amount = totalMin * rate;
    const commAdmin = Math.round(amount * 0.3);
    const commChef = amount - commAdmin;

    try {
      const updated = await api.updateOrder(activeOrder!.id, { 
        status: OrderStatus.PAYMENT_PENDING, 
        endTime: new Date(),
        totalAmount: amount,
        commissionAdmin: commAdmin,
        commissionChef: commChef
      });
      setActiveOrder(updated);
    } catch (err) {
      alert('Failed to end cooking');
    }
  };

  const collectCash = async () => {
    try {
      const updated = await api.updateOrder(activeOrder!.id, { status: OrderStatus.PAID });
      setActiveOrder(null);
      setElapsedTime(0);
      setOtpInput('');
    } catch (err) {
      alert('Failed to update payment');
    }
  };

  const requestWithdrawal = async () => {
     if (walletBalance < 100) return alert('Minimum withdrawal is Rs. 100');
     setIsWithdrawing(true);
     try {
       await api.createWithdrawal({ 
         chefId: user.id, 
         chefName: `${user.name} ${user.surname}`,
         amount: walletBalance, 
         status: 'PENDING',
         bankDetails: user.bankDetails,
         createdAt: new Date()
       });
       setWalletBalance(0);
       setIsWithdrawing(false);
       alert('Withdrawal Request Sent Successfully!');
       
       const data = await api.getWithdrawals();
       setWithdrawals(data.filter((w: any) => w.chefId === user.id));
     } catch (err) {
       alert('Withdrawal failed');
       setIsWithdrawing(false);
     }
  };

  const shareAddressOnWhatsApp = (address: string) => {
    const phone = activeOrder?.userPhone || '';
    const text = encodeURIComponent(`Hello, I have accepted your booking and am on my way to: ${address}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Online Status Toggle */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
             "w-3 h-3 rounded-full",
             isOnline ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-300"
          )} />
          <div>
            <h2 className="font-black text-lg tracking-tight">Status: {isOnline ? 'ONLINE' : 'OFFLINE'}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Toggle to receive new booking alerts</p>
          </div>
        </div>
        <button 
          onClick={toggleOnline}
          className={cn(
            "px-8 py-3 rounded-2xl font-black text-sm tracking-tight transition-all",
            isOnline ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
          )}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeOrder ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-red-100/20 space-y-8"
            >
               <div className="flex justify-between items-start">
                 <div>
                   <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Active Mission</span>
                   <h2 className="text-3xl font-black mt-3">Cooking Session</h2>
                   <p className="text-gray-400 font-medium">Customer: {activeOrder.userId}</p>
                 </div>
                 <div className="text-right">
                    <div className="text-5xl font-mono text-red-600 tabular-nums font-black">
                       {activeOrder.status === OrderStatus.PAYMENT_PENDING 
                          ? formatCurrency(activeOrder.totalAmount || 0)
                          : `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`
                       }
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-2">
                       {activeOrder.status === OrderStatus.PAYMENT_PENDING ? 'Total Due' : `Rs. ${config?.cookingRatePerMin || 3}.00 / minute`}
                    </p>
                 </div>
               </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Order Details</h3>
                   <div className="flex items-center gap-3">
                      <Globe size={18} className="text-red-600" />
                      <span className="text-sm font-medium">Destination: {activeOrder.address}</span>
                   </div>
                    <div className="flex gap-2 pt-2">
                       <button 
                        onClick={() => shareAddressOnWhatsApp(activeOrder.address || '')}
                        className="flex-1 h-12 bg-[#25D366] rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-green-500/10"
                       >
                         <MessageCircle size={18} /> Chat with User
                       </button>
                      <button 
                        onClick={() => {
                          if (activeOrder.googleLocation) {
                            window.open(activeOrder.googleLocation, '_blank');
                          } else {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder.address || '')}`, '_blank');
                          }
                        }}
                        className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        <MapPin size={18} />
                      </button>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Session Control</h3>
                   {activeOrder.status === OrderStatus.PENDING ? (
                    <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="Enter User OTP" 
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className="w-full h-12 bg-white/10 border-none rounded-xl px-4 text-center text-xl font-black outline-none focus:ring-2 focus:ring-red-600 tracking-[0.5em]"
                        />
                        <button onClick={startCooking} className="w-full h-12 bg-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700">
                           <Play size={18} fill="currentColor" /> Start Cooking
                        </button>
                     </div>
                   ) : activeOrder.status === OrderStatus.COOKING ? (
                     <button onClick={endCooking} className="w-full h-12 bg-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600">
                        <Square size={18} fill="currentColor" /> End & Generate Bill
                     </button>
                   ) : (
                     <div className="space-y-3">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/5 text-center">
                           <p className="text-xs text-gray-400 mb-1">Waiting for user payment...</p>
                           <p className="text-lg font-black text-green-500">Total: {formatCurrency(activeOrder.totalAmount || 0)}</p>
                        </div>
                        <button 
                          onClick={collectCash}
                          className="w-full h-12 bg-green-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-95"
                        >
                           <CheckCircle size={18} /> Collect Cash Payment
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <h3 className="font-black text-2xl tracking-tight">Available Bookings</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <Wallet size={14} className="text-red-600" />
                      <span className="text-sm font-black text-gray-900">Wallet: {formatCurrency(walletBalance)}</span>
                   </div>
                </div>
                <button 
                 onClick={requestWithdrawal} 
                 disabled={isWithdrawing || walletBalance === 0}
                 className="flex items-center gap-2 text-sm font-black text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 px-6 py-3 rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95"
                >
                  {isWithdrawing ? 'Processing...' : 'Withdraw Commission'}
                </button>
             </div>
             
             {orders.length === 0 ? (
               <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                    <Bell size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-500">No pending orders nearby</h4>
                    <p className="text-gray-400 text-sm">Stay online to receive live notifications</p>
                  </div>
               </div>
             ) : (
               <div className="grid gap-4">
                 {orders.map(order => (
                   <motion.div 
                     layout
                     key={order.id} 
                     className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-red-200 transition-all cursor-pointer group"
                   >
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                             {order.type === 'PARTY' ? '🎉' : '🍱'}
                         </div>
                         <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{order.type} ORDER</span>
                            <h4 className="font-bold text-lg text-gray-900">{order.items.length} Items Selected</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                               <MapPin size={12} /> 2.5 km away • Rs. 3/min
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => acceptOrder(order)}
                        className="bg-gray-900 text-white px-6 h-12 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95"
                      >
                         Accept Order
                      </button>
                   </motion.div>
                 ))}
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
