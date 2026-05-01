import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  Users, 
  ChefHat, 
  TrendingUp, 
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';
import { User, Order, WithdrawalRequest } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function ManagerPanel({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0 });

  useEffect(() => {
    fetch('/api/orders').then(res => res.json()).then(data => {
      setOrders(data);
      setStats({
        total: data.length,
        pending: data.filter((o: any) => o.status === 'PENDING').length,
        active: data.filter((o: any) => o.status === 'COOKING').length
      });
    });
    fetch('/api/withdrawals').then(res => res.json()).then(setWithdrawals);
  }, []);

  const approveWithdrawal = (id: string) => {
    fetch(`/api/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' })
    }).then(() => {
      setWithdrawals(prev => prev.map(w => w.id === id ? {...w, status: 'APPROVED'} : w));
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Total Orders" value={stats.total.toString()} icon={<ClipboardList className="text-blue-500" />} />
        <StatsCard label="Active Sessions" value={stats.active.toString()} icon={<Clock className="text-red-500" />} />
        <StatsCard label="Waitlist" value={stats.pending.toString()} icon={<Users className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Progress */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tight">Active Progress</h3>
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest underline underline-offset-4">View All Live</button>
           </div>
           <div className="space-y-6">
              {orders.filter(o => o.status === 'COOKING').length > 0 ? (
                orders.filter(o => o.status === 'COOKING').map(o => (
                  <div key={o.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-black">CH</div>
                           <span className="font-bold">Chef @ User {o.userId}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-600 animate-pulse">LIVE NOW</span>
                     </div>
                     <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: '65%' }} 
                          className="bg-red-600 h-full rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]" 
                        />
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 font-medium italic">No active cooking sessions</div>
              )}
           </div>
        </div>

        {/* Withdrawal Approvals */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-2xl font-black tracking-tight mb-8">Pending Settlements</h3>
           <div className="space-y-4">
              {withdrawals.filter(w => w.status === 'PENDING').map(w => (
                <div key={w.id} className="flex items-center justify-between p-5 bg-[#F9F8F7] rounded-3xl border border-gray-50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                         <ChefHat size={20} className="text-red-600" />
                      </div>
                      <div>
                         <p className="font-bold text-gray-900">{formatCurrency(w.amount)}</p>
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Withdrawal ID: {w.id.slice(-4)}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => approveWithdrawal(w.id)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                   >
                     Approve
                   </button>
                </div>
              ))}
              {withdrawals.filter(w => w.status === 'PENDING').length === 0 && (
                <div className="text-center py-10 text-gray-400 font-medium italic">All settlements clear</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
       <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
          {icon}
       </div>
       <div>
          <div className="text-3xl font-black tracking-tighter">{value}</div>
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{label}</div>
       </div>
    </div>
  );
}
