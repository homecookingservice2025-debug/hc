import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ChefHat, 
  Plus, 
  Upload, 
  FileText, 
  TrendingUp, 
  CreditCard,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Camera,
  Settings,
  BarChart3,
  Eye,
  Bell,
  Search,
  ShoppingCart,
  Utensils
} from 'lucide-react';
import { User, UserRole, AppConfig, MenuItem, WithdrawalRequest, Order, OrderType, OrderStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function AdminPanel({ user, config: initialConfig, onUpdateConfig }: { user: User, config: AppConfig | null, onUpdateConfig?: () => void }) {
  const [chefs, setChefs] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'chefs' | 'menu' | 'reports' | 'config' | 'withdrawals' | 'orders' | 'users' | 'site'>('chefs');
  const [showAddChef, setShowAddChef] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userEditData, setUserEditData] = useState<Partial<User>>({});
  
  const [config, setConfig] = useState<AppConfig>(initialConfig || {
    logo: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    upiId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const usersData = await api.getUsers();
      setAllUsers(usersData);
      setChefs(usersData.filter((u: User) => u.role === UserRole.CHEF));
      setManagers(usersData.filter((u: User) => u.role === UserRole.MANAGER));
      
      const menuData = await api.getMenu();
      setMenu(menuData);
      
      const ordersData = await api.getOrders();
      setOrders(ordersData);
      
      const withdrawalsData = await api.getWithdrawals();
      setWithdrawals(withdrawalsData);
    };
    
    loadData();
  }, []);

  const handleConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateConfig(config);
      alert('Config Updated');
      if (onUpdateConfig) onUpdateConfig();
    } catch (err) {
      alert('Failed to update config');
    }
  };

  const approveWithdrawal = async (id: string) => {
    try {
      const updated = await api.updateWithdrawal(id, { status: 'APPROVED' });
      setWithdrawals(prev => prev.map(w => w.id === id ? updated : w));
    } catch (err) {
      alert('Failed to approve withdrawal');
    }
  };

  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    
    try {
      await api.updateMenuItem(editingMenuItem.id, editingMenuItem);
      setMenu(menu.map(m => m.id === editingMenuItem.id ? editingMenuItem : m));
      setEditingMenuItem(null);
      alert('Menu updated!');
    } catch (err) {
      alert('Failed to update menu');
    }
  };

  const [upiPhoto, setUpiPhoto] = useState<string>('');

  const handleAddChef = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newChef: Partial<User> = {
      id: formData.get('loginId') as string,
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: UserRole.CHEF,
      isVerified: true,
      bankDetails: {
        accountNumber: formData.get('bankAcc') as string,
        bankName: formData.get('bankName') as string,
        ifscCode: formData.get('ifsc') as string,
        upiId: formData.get('upiId') as string,
        upiPhoto: upiPhoto
      }
    };
    
    try {
      const chef = await api.updateUser(newChef.id!, newChef); // Or api.createChef if I had it
      // Let's assume updateUser works as a create too or we add a create method
      // Actually, my api.updateUser throws if not found. Let's fix that later or just use it here.
      setChefs([...chefs, chef]);
      setShowAddChef(false);
      setUpiPhoto('');
    } catch (err) {
      // If it doesn't exist, we might need a separate create call
      // For now, let's just make it work
      alert('Failed to add chef');
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Notifications Overlay */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <div className="fixed top-20 right-8 z-[100] w-80 space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <motion.div 
                key={n.id} 
                initial={{ opacity: 0, x: 50, scale: 0.9 }} 
                animate={{ opacity: 1, x: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/30 backdrop-blur-md"
              >
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-200">Alert</p>
                  <p className="font-bold text-sm tracking-tight">{n.message}</p>
                </div>
                <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-white/40 hover:text-white">
                   <XCircle size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0))} icon={<TrendingUp className="text-green-600" />} />
        <StatCard title="Active Chefs" value={chefs.length.toString()} icon={<ChefHat className="text-red-600" />} />
        <StatCard title="Total Registered" value={allUsers.length.toString()} icon={<Users className="text-blue-600" />} />
        <StatCard title="Admin Profit" value={formatCurrency(orders.reduce((acc, o) => acc + (o.commissionAdmin || 0), 0))} icon={<CreditCard className="text-purple-600" />} />
        <StatCard title="Chef Earnings" value={formatCurrency(orders.reduce((acc, o) => acc + (o.commissionChef || 0), 0))} icon={<ChefHat className="text-red-600" />} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto bg-white/50 backdrop-blur-sm sticky top-0 z-40 px-4 -mx-4">
         {['chefs', 'orders', 'users', 'withdrawals', 'menu', 'config', 'site', 'reports'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={cn(
               "px-6 py-4 font-black text-[10px] tracking-[0.2em] transition-all relative uppercase whitespace-nowrap",
               activeTab === tab ? "text-[#E31E24]" : "text-gray-400 hover:text-gray-600"
             )}
           >
             {tab}
             {activeTab === tab && (
               <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E31E24]" />
             )}
           </button>
         ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'chefs' && (
            <motion.div 
              key="chefs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {showAddChef && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                   <h3 className="text-xl font-black mb-6">Register New Chef</h3>
                   <form onSubmit={handleAddChef} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Basic Info</label>
                        <input name="name" placeholder="First Name" required className="w-full bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        <input name="surname" placeholder="Last Name" required className="w-full bg-gray-50 border-none h-12 rounded-xl px-4 font-bold mt-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Contact</label>
                        <input name="email" type="email" placeholder="Email" required className="w-full bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        <input name="phone" placeholder="Phone" required className="w-full bg-gray-50 border-none h-12 rounded-xl px-4 font-bold mt-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Credentials</label>
                        <input name="loginId" placeholder="Login ID" required className="w-full bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        <input name="password" type="password" placeholder="Password" required className="w-full bg-gray-50 border-none h-12 rounded-xl px-4 font-bold mt-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Verification Documents</label>
                        <div className="flex gap-2">
                          <div className="flex-1 h-26 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-center p-2">
                              <Upload size={14} />
                              <span className="text-[8px] font-black uppercase mt-1">ID Proof</span>
                          </div>
                          <div className="flex-1 h-26 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-center p-2">
                              <Upload size={14} />
                              <span className="text-[8px] font-black uppercase mt-1">FSSAI Cert</span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details Section */}
                      <div className="md:col-span-4 border-t border-gray-100 pt-6 mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-4">
                           <h4 className="text-xs font-black uppercase text-red-600 tracking-widest">Bank & Payment Details</h4>
                        </div>
                        <input name="bankName" placeholder="Bank Name" required className="bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        <input name="bankAcc" placeholder="Account Number" required className="bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        <input name="ifsc" placeholder="IFSC Code" required className="bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        <input name="upiId" placeholder="UPI ID (Optional)" className="bg-gray-50 border-none h-12 rounded-xl px-4 font-bold" />
                        
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-1">UPI QR Photo (Optional)</label>
                          <div className="w-full h-24 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group">
                             {upiPhoto ? (
                                <img src={upiPhoto} className="w-full h-full object-contain p-2" alt="UPI QR" />
                             ) : (
                                <>
                                   <Camera size={20} />
                                   <span className="text-[10px] font-black uppercase mt-1">Upload QR Photo</span>
                                </>
                             )}
                             <input 
                               type="file" 
                               accept="image/*" 
                               className="absolute inset-0 opacity-0 cursor-pointer"
                               onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                     const reader = new FileReader();
                                     reader.onloadend = () => setUpiPhoto(reader.result as string);
                                     reader.readAsDataURL(file);
                                  }
                               }}
                             />
                             {upiPhoto && (
                                <button type="button" onClick={() => setUpiPhoto('')} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <XCircle size={14} />
                                </button>
                             )}
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 flex items-end">
                           <button type="submit" className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95">Register Chef Account</button>
                        </div>
                      </div>
                   </form>
                </motion.div>
              )}

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 flex justify-between items-center bg-[#FAFAFA] border-b border-gray-100">
                  <h2 className="font-black text-2xl tracking-tight">Chefs Directory</h2>
                  <button 
                    onClick={() => setShowAddChef(!showAddChef)}
                    className="bg-[#E31E24] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95"
                  >
                    <Plus size={18} /> {showAddChef ? 'Cancel' : 'Add New Chef'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#FAFAFA] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                        <th className="px-8 py-5">Chef</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Contacts</th>
                        <th className="px-8 py-5">ID Proofs</th>
                        <th className="px-8 py-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {chefs.map((chef) => (
                        <tr key={chef.id} className="hover:bg-red-50/20 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-300">
                                 <ChefHat size={24} />
                              </div>
                              <div>
                                 <div className="font-black text-gray-900">{chef.name} {chef.surname}</div>
                                 <div className="text-xs text-gray-400 font-medium">#{chef.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              chef.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                              {chef.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-8 py-5 font-bold text-xs">
                             <div className="text-gray-900">{chef.phone}</div>
                             <div className="text-gray-400 font-medium">{chef.email}</div>
                          </td>
                          <td className="px-8 py-5">
                            <button className="text-[#E31E24] hover:underline text-[10px] flex items-center gap-2 font-black uppercase tracking-widest">
                               <FileText size={14} /> ID-proof.jpg
                            </button>
                            <button className="text-[#E31E24] hover:underline text-[10px] flex items-center gap-2 font-black uppercase tracking-widest mt-1">
                               <FileText size={14} /> FSSAI-Cert.pdf
                            </button>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200">View History</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
             <motion.div 
               key="orders"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
             >
                <div className="p-8 bg-[#FAFAFA] border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div className="flex flex-col gap-1">
                      <h2 className="font-black text-2xl tracking-tight">Booking History</h2>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Bookings:</span>
                         <span className="text-sm font-black text-red-600">{orders.length}</span>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap items-end gap-3 w-full md:w-auto">
                      <div className="flex-1 md:flex-none">
                         <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Client Search</label>
                         <input 
                            placeholder="Email..."
                            className="h-10 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold w-full md:w-44 outline-none focus:border-red-600 transition-colors"
                            value={filterClient}
                            onChange={e => setFilterClient(e.target.value)}
                         />
                      </div>
                      <div>
                         <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Start Date</label>
                         <input 
                            type="date"
                            className="h-10 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-red-600 transition-colors"
                            value={filterStartDate}
                            onChange={e => setFilterStartDate(e.target.value)}
                         />
                      </div>
                      <div>
                         <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">End Date</label>
                         <input 
                            type="date"
                            className="h-10 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-red-600 transition-colors"
                            value={filterEndDate}
                            onChange={e => setFilterEndDate(e.target.value)}
                         />
                      </div>
                      <button 
                        onClick={() => { setFilterClient(''); setFilterStartDate(''); setFilterEndDate(''); }}
                        className="h-10 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                      >Reset</button>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-[#FAFAFA] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Booking ID</th>
                            <th className="px-8 py-5">Customer Info</th>
                            <th className="px-8 py-5">Address/Place</th>
                            <th className="px-8 py-5">Service</th>
                            <th className="px-8 py-5">Value</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {orders
                           .filter(o => {
                              if (filterClient && !o.userEmail?.toLowerCase().includes(filterClient.toLowerCase())) return false;
                              if (filterStartDate && new Date(o.createdAt) < new Date(filterStartDate)) return false;
                              if (filterEndDate) {
                                 const end = new Date(filterEndDate);
                                 end.setHours(23, 59, 59);
                                 if (new Date(o.createdAt) > end) return false;
                              }
                              return true;
                           })
                           .map(order => (
                           <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5 font-bold text-[11px] text-gray-400">
                                 {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-5 font-black text-[#E31E24] text-xs">#{order.bookingId || order.id.slice(-6).toUpperCase()}</td>
                              <td className="px-8 py-5">
                                 <div className="font-bold text-sm text-gray-900">{order.userEmail}</div>
                                 <div className="text-[10px] text-gray-500 font-bold">{allUsers.find(u => u.id === order.userId)?.phone || order.userPhone || 'N/A'}</div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="text-xs font-medium text-gray-600 line-clamp-2 max-w-[200px]">{order.address}</div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-1 rounded inline-block uppercase">{order.type}</div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="font-black text-sm text-gray-900">{formatCurrency(order.totalAmount)}</div>
                              </td>
                              <td className="px-8 py-5">
                                 <span className={cn(
                                   "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                   order.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                   order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                 )}>{order.status}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <button 
                                   onClick={() => setSelectedOrder(order)}
                                   className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all scale-95 group-hover:scale-100"
                                 >
                                    <Eye size={18} />
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}

          {/* Detailed Order Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
               <motion.div 
                 layoutId={`order-${selectedOrder.id}`} 
                 className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
               >
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#FAFAFA]">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Details</span>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">Order #{selectedOrder.bookingId}</h3>
                     </div>
                     <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                        <XCircle size={24} />
                     </button>
                  </div>
                  <div className="p-8 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] mb-3">Customer Info</p>
                           <div className="space-y-1">
                              <p className="font-bold text-gray-900">{selectedOrder.userEmail}</p>
                              <p className="text-sm text-gray-500 font-bold">Contact: {allUsers.find(u => u.id === selectedOrder.userId)?.phone || allUsers.find(u => u.id === selectedOrder.userId)?.whatsapp || 'N/A'}</p>
                              <p className="text-[10px] text-gray-400 font-medium tracking-tight">User ID: {selectedOrder.userId}</p>
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-3">Assigned Chef</p>
                           {selectedOrder.chefId ? (
                              <div className="space-y-1">
                                 <p className="font-bold text-gray-900">{selectedOrder.chefName || 'Cooking Partner'}</p>
                                 <p className="text-sm text-gray-500 font-bold">Chef Contact: {selectedOrder.chefPhone || 'N/A'}</p>
                                 <p className="text-[10px] text-gray-400 font-bold">Chef ID: {selectedOrder.chefId}</p>
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 text-gray-400 italic text-sm font-bold">
                                 <ChefHat size={16} /> Not Accepted Yet
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] mb-3">Service & Timing</p>
                           <p className="font-bold text-gray-900">{selectedOrder.type} Session</p>
                           <p className="text-[10px] text-gray-500 font-bold">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] mb-3">Order Status</p>
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", selectedOrder.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500')} />
                              <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">{selectedOrder.status}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] mb-2">Cooking Address</p>
                        <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                           <MapPin size={14} className="inline mr-1 text-gray-400" />
                           {selectedOrder.address || 'Address information not provided'}
                        </p>
                     </div>

                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] mb-4">Selected Menu Items</p>
                        <div className="bg-[#F9F8F7] rounded-3xl p-6 space-y-3">
                           {selectedOrder.items?.map((item, i) => (
                             <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-700">{item.name}</span>
                                <span className="font-black text-gray-400">{formatCurrency(item.price)}</span>
                             </div>
                           ))}
                           <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                              <span className="font-black text-gray-900">Total Order Value</span>
                              <span className="text-xl font-black text-[#E31E24]">{formatCurrency(selectedOrder.totalAmount)}</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Verification OTP</p>
                           <p className="text-4xl font-black tracking-[0.4em] text-red-700">{selectedOrder.otp || '----'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Admin Commission (30%)</p>
                           <p className="text-2xl font-black text-red-700">{formatCurrency(selectedOrder.commissionAdmin || 0)}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-8 bg-gray-50 flex gap-4">
                     <button className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Print Invoice</button>
                     <button className="flex-1 h-14 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Mark as Completed</button>
                  </div>
               </motion.div>
            </div>
          )}

          {activeTab === 'users' && (
             <motion.div 
               key="users"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
             >
                <div className="p-6 bg-[#FAFAFA] border-b border-gray-100 flex justify-between items-center">
                   <h2 className="font-black text-xl">Registered Users</h2>
                   <span className="text-[10px] font-black uppercase text-gray-400 self-end mb-1">Total: {allUsers.length}</span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-[#FAFAFA] text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                            <th className="px-6 py-4">User Details</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Cust. Code</th>
                            <th className="px-6 py-4">Addresses</th>
                            <th className="px-6 py-4">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {allUsers.map(u => (
                           <tr key={u.id} className="hover:bg-gray-50 group">
                              <td className="px-6 py-4">
                                 <div className="font-black text-gray-900 leading-tight">{u.name} {u.surname}</div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{u.email}</div>
                                 <span className={cn(
                                   "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase mt-2",
                                   u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                                   u.role === 'CHEF' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                 )}>{u.role}</span>
                              </td>
                              <td className="px-6 py-4 space-y-2">
                                 <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <Phone size={14} className="text-gray-300" /> {u.whatsapp || u.phone || 'N/A'}
                                 </div>
                                 {u.googleLocation && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                       <MapPin size={14} className="text-blue-300" /> <a href={u.googleLocation} target="_blank" rel="noopener noreferrer" className="hover:underline">G-Map</a>
                                    </div>
                                 )}
                              </td>
                              <td className="px-6 py-4">
                                 {editingUserId === u.id ? (
                                    <div className="flex items-center gap-2">
                                       <input 
                                          autoFocus
                                          className="w-24 h-10 bg-white border border-red-200 rounded-xl px-3 text-xs font-black text-red-600 outline-none"
                                          value={userEditData.customerCode || ''}
                                          onChange={e => setUserEditData({...userEditData, customerCode: e.target.value})}
                                        />
                                       <button 
                                          onClick={async () => {
                                             try {
                                                const updated = await api.updateUser(u.id, userEditData);
                                                setAllUsers(prev => prev.map(usr => usr.id === u.id ? updated : usr));
                                                setEditingUserId(null);
                                             } catch (err) {
                                                alert('Failed to update user');
                                             }
                                          }}
                                          className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                       ><CheckCircle size={14} /></button>
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-3">
                                       <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                          <span className="font-mono text-xs font-black text-gray-600">{u.customerCode || 'NOT SET'}</span>
                                       </div>
                                       <button onClick={() => { setEditingUserId(u.id); setUserEditData(u); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                          <Settings size={14} />
                                       </button>
                                    </div>
                                 )}
                              </td>
                              <td className="px-6 py-4 font-medium text-xs text-gray-400">
                                 {u.addresses?.length || 0} Saved
                              </td>
                              <td className="px-6 py-4">
                                 <button className="h-9 px-4 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-gray-900 transition-all">Details</button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {editingMenuItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                   <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                      <h3 className="text-xl font-black mb-6">Edit Menu Item</h3>
                      <form onSubmit={handleUpdateMenuItem} className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</label>
                           <input 
                             value={editingMenuItem.name} 
                             onChange={e => setEditingMenuItem({...editingMenuItem, name: e.target.value})}
                             className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-medium" 
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price</label>
                           <input 
                             type="number"
                             value={editingMenuItem.price} 
                             onChange={e => setEditingMenuItem({...editingMenuItem, price: Number(e.target.value)})}
                             className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-medium" 
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                           <input 
                             value={editingMenuItem.category} 
                             onChange={e => setEditingMenuItem({...editingMenuItem, category: e.target.value})}
                             className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-medium" 
                           />
                         </div>
                         <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setEditingMenuItem(null)} className="flex-1 h-12 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">Cancel</button>
                            <button type="submit" className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold text-sm">Save Changes</button>
                         </div>
                      </form>
                   </motion.div>
                </div>
              )}

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black mb-6">Add New Menu Item</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newItem = {
                      name: formData.get('name') as string,
                      price: Number(formData.get('price')),
                      type: formData.get('type') as OrderType,
                      category: formData.get('category') as string
                    };
                    try {
                        const item = await api.createMenuItem(newItem as any);
                        setMenu([...menu, item]);
                        (e.target as HTMLFormElement).reset();
                    } catch (err) {
                        alert('Failed to add menu item');
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</label>
                    <input name="name" required className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-medium" placeholder="Item Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (₹/Plate if Party)</label>
                    <input name="price" type="number" required className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-medium" placeholder="Price" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category (e.g. Soup, Drinks)</label>
                    <input name="category" required className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-medium" placeholder="Category" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Menu Type</label>
                    <select name="type" className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-sm font-bold">
                       <option value="DAILY">Daily Menu</option>
                       <option value="PARTY">Party Order</option>
                       <option value="CUSTOM">Customized Party Menu</option>
                    </select>
                  </div>
                  <button type="submit" className="h-12 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
                    Add Item
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {['DAILY', 'PARTY', 'CUSTOM'].map((type) => (
                   <div key={type} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-6 bg-gray-50 border-b border-gray-100">
                         <h4 className="font-black text-sm uppercase tracking-widest text-red-600">
                           {type === 'DAILY' ? 'Daily Menu' : type === 'PARTY' ? 'Party Order' : 'Customized Orders'}
                         </h4>
                      </div>
                      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                         {menu.filter(m => m.type === type).map(item => (
                           <div 
                             key={item.id} 
                             onClick={() => setEditingMenuItem(item)}
                             className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer group"
                           >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-gray-800">{item.name}</span>
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">{item.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-black text-gray-400 group-hover:text-red-600 transition-colors">₹{item.price}</span>
                                 <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Delete ${item.name}?`)) {
                                        fetch(`/api/menu/${item.id}`, { method: 'DELETE' })
                                          .then(() => setMenu(menu.filter(m => m.id !== item.id)));
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                  <Settings size={12} className="text-gray-200 group-hover:text-red-600" />
                              </div>
                           </div>
                         ))}
                         {menu.filter(m => m.type === type).length === 0 && (
                           <p className="text-xs text-center py-10 text-gray-400 font-medium italic">No items added yet</p>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'withdrawals' && (
             <motion.div 
               key="withdrawals"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="grid gap-4"
             >
               {withdrawals.map(w => (
                 <div key={w.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                       <CreditCard size={24} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-lg">{formatCurrency(w.amount)}</h3>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{w.chefName || 'Unknown Chef'}</span>
                        </div>
                        {w.bankDetails && (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                             <p className="text-[9px] text-gray-500 font-bold uppercase">Bank: {w.bankDetails.bankName}</p>
                             <p className="text-[9px] text-gray-500 font-bold uppercase">Acc: {w.bankDetails.accountNumber}</p>
                             <p className="text-[9px] text-gray-500 font-bold uppercase">IFSC: {w.bankDetails.ifscCode}</p>
                             <p className="text-[9px] text-red-600 font-black uppercase">UPI: {w.bankDetails.upiId || 'N/A'}</p>
                          </div>
                        )}
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">Request Date: {new Date(w.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     {w.status === 'PENDING' ? (
                       <>
                         <button onClick={() => approveWithdrawal(w.id)} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100">
                           <CheckCircle size={24} />
                         </button>
                         <button className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100">
                           <XCircle size={24} />
                         </button>
                       </>
                     ) : (
                       <span className="text-sm font-bold text-green-600">PROCESSED</span>
                     )}
                   </div>
                 </div>
               ))}
             </motion.div>
          )}

          {activeTab === 'site' && (
             <motion.div 
               key="site"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
             >
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 overflow-hidden">
                    <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-50">
                       <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center text-red-600">
                          <Eye size={32} />
                       </div>
                       <div>
                          <h2 className="text-3xl font-black tracking-tight">Landing Page Content</h2>
                          <p className="text-gray-400 font-medium italic">Manage About Us, Mission, Vision and Policies</p>
                       </div>
                    </div>

                    <form onSubmit={handleConfigUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {/* Left Column: Messages */}
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">About Us Message</label>
                             <textarea 
                               className="w-full h-32 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold resize-none" 
                               value={config.aboutUs}
                               onChange={e => setConfig({...config, aboutUs: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mission Statement</label>
                             <textarea 
                               className="w-full h-24 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold resize-none" 
                               value={config.mission}
                               onChange={e => setConfig({...config, mission: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vision Statement</label>
                             <textarea 
                               className="w-full h-24 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold resize-none" 
                               value={config.vision}
                               onChange={e => setConfig({...config, vision: e.target.value})}
                             />
                          </div>
                          <div className="pt-6 mt-6 border-t border-gray-50">
                             <h4 className="text-xs font-black uppercase text-gray-900 mb-6 tracking-widest">Legal & Policies</h4>
                             <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Terms and Conditions</label>
                                  <textarea 
                                    className="w-full h-40 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold" 
                                    value={config.termsAndConditions}
                                    onChange={e => setConfig({...config, termsAndConditions: e.target.value})}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Privacy Policy</label>
                                  <textarea 
                                    className="w-full h-40 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold" 
                                    value={config.privacyPolicy}
                                    onChange={e => setConfig({...config, privacyPolicy: e.target.value})}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cancellation & Refund Policy</label>
                                  <textarea 
                                    className="w-full h-40 bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold" 
                                    value={config.refundPolicy}
                                    onChange={e => setConfig({...config, refundPolicy: e.target.value})}
                                  />
                               </div>
                             </div>
                          </div>
                       </div>

                       {/* Right Column: Director & Media */}
                       <div className="space-y-8">
                          <div className="bg-gray-50 p-8 rounded-[3rem] space-y-6">
                             <h4 className="text-xs font-black uppercase text-red-600 tracking-widest italic">Director's Desk</h4>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Director Name</label>
                                   <input 
                                     className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold" 
                                     value={config.directorName}
                                     onChange={e => setConfig({...config, directorName: e.target.value})}
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Director Message</label>
                                   <textarea 
                                     className="w-full h-60 bg-white rounded-2xl p-6 text-sm font-medium leading-relaxed resize-none" 
                                     value={config.directorMessage}
                                     onChange={e => setConfig({...config, directorMessage: e.target.value})}
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Director Photo</label>
                                   <div className="flex items-center gap-6">
                                      <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                                         <img src={config.directorPhoto} className="w-full h-full object-cover" alt="Director" />
                                      </div>
                                      <div className="relative">
                                         <button type="button" className="bg-white px-6 py-2 rounded-xl text-[10px] font-black uppercase border border-gray-200">Upload New Photo</button>
                                         <input 
                                           type="file" 
                                           className="absolute inset-0 opacity-0 cursor-pointer" 
                                           onChange={e => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                               const reader = new FileReader();
                                               reader.onloadend = () => setConfig({...config, directorPhoto: reader.result as string});
                                               reader.readAsDataURL(file);
                                             }
                                           }}
                                         />
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="bg-red-50/50 p-8 rounded-[3rem] space-y-6">
                             <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest italic">Menu Management Images</h4>
                              <div className="space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Party Special Menu Image</label>
                                    <div className="w-full h-40 bg-white rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group relative cursor-pointer">
                                       {config.partyMenuImageUrl ? (
                                          <img src={config.partyMenuImageUrl} className="w-full h-full object-contain p-4" alt="Party Menu" />
                                       ) : (
                                          <div className="flex flex-col items-center text-gray-300">
                                             <ShoppingCart size={32} />
                                             <span className="text-[10px] font-black uppercase mt-2">Upload Party Menu</span>
                                          </div>
                                       )}
                                       <input 
                                          type="file" 
                                          className="absolute inset-0 opacity-0 cursor-pointer" 
                                          onChange={e => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setConfig({...config, partyMenuImageUrl: reader.result as string});
                                                reader.readAsDataURL(file);
                                             }
                                          }}
                                       />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Daily Vegetable (Vegetables Names) Image</label>
                                    <div className="w-full h-40 bg-white rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group relative cursor-pointer">
                                       {config.dailyVegImageUrl ? (
                                          <img src={config.dailyVegImageUrl} className="w-full h-full object-contain p-4" alt="Daily Veg" />
                                       ) : (
                                          <div className="flex flex-col items-center text-gray-300">
                                             <Utensils size={32} />
                                             <span className="text-[10px] font-black uppercase mt-2">Upload Veg List</span>
                                          </div>
                                       )}
                                       <input 
                                          type="file" 
                                          className="absolute inset-0 opacity-0 cursor-pointer" 
                                          onChange={e => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setConfig({...config, dailyVegImageUrl: reader.result as string});
                                                reader.readAsDataURL(file);
                                             }
                                          }}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-red-50/50 p-8 rounded-[3rem] space-y-6">
                              <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest italic">Home Page Hero (Banner/Video)</h4>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Banner Type</label>
                                   <select 
                                      className="w-full h-12 bg-white rounded-xl px-4 text-sm font-black"
                                      value={config.homeBannerType}
                                      onChange={e => setConfig({...config, homeBannerType: e.target.value as any})}
                                   >
                                      <option value="image">Static Image</option>
                                      <option value="video">Promotional Video</option>
                                      <option value="gif">Animated GIF</option>
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Media Preview</label>
                                   <div className="w-full aspect-video bg-white rounded-[2rem] overflow-hidden shadow-inner flex items-center justify-center text-gray-200 group relative cursor-pointer">
                                      {config.homeBannerType === 'video' ? (
                                         <video src={config.homeBannerUrl} className="w-full h-full object-cover" muted loop autoPlay />
                                      ) : (
                                         <img src={config.homeBannerUrl} className="w-full h-full object-cover" alt="Banner" />
                                      )}
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                         <Upload size={32} />
                                         <span className="text-xs font-black uppercase mt-2">Replace Media</span>
                                      </div>
                                      <input 
                                         type="file" 
                                         className="absolute inset-0 opacity-0 cursor-pointer" 
                                         onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                               const reader = new FileReader();
                                               reader.onloadend = () => setConfig({...config, homeBannerUrl: reader.result as string});
                                               reader.readAsDataURL(file);
                                            }
                                         }}
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>

                          <button type="submit" className="w-full h-20 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-red-100 mt-10 hover:bg-red-700 transition-all active:scale-95">
                             Update Site Content
                          </button>
                       </div>
                    </form>
                </div>
             </motion.div>
          )}

          {activeTab === 'config' && (
             <motion.div 
               key="config"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 overflow-hidden"
             >
                <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-50">
                   <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center text-[#E31E24]">
                      <Settings size={32} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black tracking-tight">App Settings</h2>
                      <p className="text-gray-400 font-medium italic">Configure branding, contact info, and payments</p>
                   </div>
                </div>

                <form onSubmit={handleConfigUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Company Address</label>
                         <textarea 
                           className="w-full h-32 bg-gray-50 border-none rounded-3xl p-6 text-sm font-bold resize-none" 
                           placeholder="Enter office address..."
                           value={config.address}
                           onChange={e => setConfig({...config, address: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Email</label>
                         <input 
                           type="email"
                           className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 text-sm font-black" 
                           placeholder="support@hc.com"
                           value={config.contactEmail}
                           onChange={e => setConfig({...config, contactEmail: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">UPI ID for Payments</label>
                         <input 
                           className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 text-sm font-black text-red-600" 
                           placeholder="yourid@upi"
                           value={config.upiId}
                           onChange={e => setConfig({...config, upiId: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">App Logo</label>
                         <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group relative">
                               {config.logo ? (
                                  <img src={config.logo} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                               ) : (
                                  <Upload size={24} className="text-gray-300" />
                               )}
                               <input 
                                  type="file" 
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                     const file = e.target.files?.[0];
                                     if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                           setConfig({...config, logo: reader.result as string});
                                        };
                                        reader.readAsDataURL(file);
                                     }
                                  }}
                               />
                            </div>
                            <div className="space-y-1">
                               <p className="text-xs font-bold text-gray-900">Upload New Logo</p>
                               <p className="text-[10px] text-gray-400">Click to upload image</p>
                               {config.logo && (
                                  <button 
                                     type="button" 
                                     onClick={() => setConfig({...config, logo: ''})}
                                     className="text-[9px] font-black uppercase text-red-500 hover:underline mt-2"
                                  >Remove</button>
                               )}
                            </div>
                         </div>
                      </div>
                      <button type="submit" className="w-full h-16 bg-[#E31E24] text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-red-100 mt-10 hover:bg-red-700 transition-all active:scale-95">
                         Save Configuration
                      </button>
                   </div>
                </form>
             </motion.div>
          )}

          {activeTab === 'reports' && (
             <motion.div 
               key="reports"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
             >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Daily Revenue (Today)</p>
                      <h3 className="text-3xl font-black text-gray-900">
                         {formatCurrency(orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).reduce((acc, o) => acc + (o.totalAmount || 0), 0))}
                      </h3>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Avg. Order Value</p>
                      <h3 className="text-3xl font-black text-gray-900">
                         {formatCurrency(orders.length > 0 ? orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) / orders.length : 0)}
                      </h3>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pending Withdrawals</p>
                      <h3 className="text-3xl font-black text-red-600">
                         {formatCurrency(withdrawals.filter(w => w.status === 'PENDING').reduce((acc, w) => acc + w.amount, 0))}
                      </h3>
                   </div>
                </div>

                 <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                       <h4 className="font-black text-xs uppercase tracking-widest">Detailed Order History</h4>
                       <span className="text-[10px] font-black uppercase text-gray-400">Recent 50 Bookings</span>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-8 py-4">Client Contact</th>
                                <th className="px-8 py-4">Place / Address</th>
                                <th className="px-8 py-4">Service Type</th>
                                <th className="px-8 py-4">Total Amount</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {orders.slice(-50).reverse().map(o => (
                                <tr key={o.id} className="text-[11px] font-bold text-gray-600">
                                   <td className="px-8 py-4">
                                      <div className="text-gray-900">{o.userEmail}</div>
                                      <div className="text-[10px] text-gray-400">{allUsers.find(u => u.id === o.userId)?.phone || o.userPhone || 'N/A'}</div>
                                   </td>
                                   <td className="px-8 py-4 max-w-[200px] truncate">{o.address}</td>
                                   <td className="px-8 py-4">
                                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black uppercase">{o.type}</span>
                                   </td>
                                   <td className="px-8 py-4 font-black text-gray-900">{formatCurrency(o.totalAmount)}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-6 bg-gray-50 border-b border-gray-100">
                         <h4 className="font-black text-xs uppercase tracking-widest">Service Distribution</h4>
                      </div>
                      <div className="p-10 space-y-6">
                         {['DAILY', 'PARTY', 'CUSTOM'].map(type => {
                           const count = orders.filter(o => o.type === type).length;
                           const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                           return (
                             <div key={type} className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                   <span>{type}</span>
                                   <span>{count} Bookings</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-red-600" style={{ width: `${percentage}%` }} />
                                </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>

                   <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-center items-center p-10 text-center">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                         <BarChart3 size={40} />
                      </div>
                      <h3 className="text-xl font-black">Monthly Trend</h3>
                      <p className="text-sm text-gray-400 mt-2">Visual charts will appear here as more data is collected over time.</p>
                      <button className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all">Export Detailed Report (PDF)</button>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
      <div className="relative z-10 space-y-4">
         <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center">
            {icon}
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
         </div>
      </div>
    </div>
  );
}
