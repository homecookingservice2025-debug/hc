import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  User, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  Bell, 
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { UserRole, User as UserType, AppConfig } from './types';
import AdminPanel from './panels/AdminPanel';
import ManagerPanel from './panels/ManagerPanel';
import UserPanel from './panels/UserPanel';
import ChefPanel from './panels/ChefPanel';
import Login from './components/Login';
import socket from './services/socket';
import { cn } from './lib/utils';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import LandingPage from './components/LandingPage';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [config, setConfig] = useState<AppConfig | null>({
    address: 'Lucknow, Uttar Pradesh',
    contactEmail: 'hchomecookingservices@gmail.com',
    contactPhone: '+91 85438 98295',
    upiId: 'hc@upi',
    aboutUs: 'We are HC Home Cooking, Lucknow\'s premier professional chef service.',
    mission: 'Providing healthy, hygienic, and affordable home-style Indian meals.',
    vision: 'To be the most trusted professional chef service in Lucknow.',
    directorName: 'Mr. Amreesh Kumar Gupta',
    homeBannerUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc9?auto=format&fit=crop&q=80&w=1000',
    homeBannerType: 'image'
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const refreshConfig = () => {
    fetch('/api/config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setConfig(data);
      })
      .catch(err => console.warn("Failed to fetch config, using default", err));
  };

  useEffect(() => {
    refreshConfig();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch full user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserType);
          } else {
            console.warn("User authenticated but no Firestore profile found.");
            // If it's a legacy user or just signed up, we might need to handle it
            // For now, we'll just set user to null if no profile exists
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth sync error:", error);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit('join', user.id);
      
      const handleNewOrder = (order: any) => {
        if (user.role === UserRole.CHEF && user.isOnline) {
          setNotifications(prev => [{ id: Date.now(), message: 'New order available!', data: order }, ...prev]);
          const audio = new Audio('/notification.mp3'); // Fallback to silent if missing
          audio.play().catch(() => {});
        }
      };

      socket.on('newOrderNotification', handleNewOrder);
      
      const handleStatusChange = (order: any) => {
        if (order.userId === user.id || order.chefId === user.id) {
           let message = `Order update: ${order.status.replace('_', ' ')}`;
           if (order.status === 'PAYMENT_PENDING' && user.role === UserRole.USER) {
              message = 'Cooking session ended. Please proceed to payment.';
           } else if (order.status === 'PAID' && user.role === UserRole.CHEF) {
              message = 'Payment received! Session completed.';
           }
           
           setNotifications(prev => [{ id: Date.now(), message, data: order }, ...prev]);
           const audio = new Audio('/notification.mp3');
           audio.play().catch(() => {});
        }
      };

      socket.on('orderStatusChanged', handleStatusChange);

      return () => {
        socket.off('newOrderNotification', handleNewOrder);
        socket.off('orderStatusChanged', handleStatusChange);
      };
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    if (showLogin) {
      return <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="h-16 bg-white border-b border-gray-100 flex items-center px-8 justify-between">
           <button onClick={() => setShowLogin(false)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">← Back to Home</button>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-100">
                 <ChefHat size={16} />
              </div>
              <span className="font-black text-xs tracking-tighter">HC HOME COOKING</span>
           </div>
           <div className="w-20" />
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <Login onLogin={(u) => { setUser(u); setShowLogin(false); }} config={config} />
        </div>
      </div>;
    }
    return <LandingPage config={config} onExplore={() => setShowLogin(true)} />;
  }

  const renderPanel = () => {
    switch (user.role) {
      case UserRole.ADMIN: return <AdminPanel user={user} config={config} onUpdateConfig={refreshConfig} />;
      case UserRole.MANAGER: return <ManagerPanel user={user} />;
      case UserRole.CHEF: return <ChefPanel user={user} config={config} />;
      case UserRole.USER: return <UserPanel user={user} config={config} />;
      default: return <div>Unauthorized</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFCFB] text-[#1D1D1D] font-sans selection:bg-red-50">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-[#EFECE9] flex flex-col h-full z-20 relative shadow-sm"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
            <ChefHat size={22} />
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col"
            >
              <span className="font-black text-base tracking-tighter leading-none">HC HOME</span>
              <span className="text-[9px] font-black text-red-600 tracking-widest uppercase leading-none mt-0.5">Cooking</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active isOpen={isSidebarOpen} />
          {user.role === UserRole.ADMIN && <NavItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />}
          {user.role === UserRole.USER && <NavItem icon={<MenuIcon size={20} />} label="My Orders" isOpen={isSidebarOpen} />}
        </nav>

        <div className="p-4 border-t border-[#EFECE9]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-bottom border-[#EFECE9] px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <MenuIcon size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
               Hi, {user.name}
               <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full font-bold uppercase tracking-wider border border-red-100">
                 {user.role}
               </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2.5 hover:bg-[#F5F2F0] rounded-full transition-all relative">
                <Bell size={20} className="text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 border-2 border-white rounded-full"></span>
                )}
              </button>
              
              <AnimatePresence>
                {notifications.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
                      <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-gray-400 hover:text-red-600">Clear all</button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 bg-red-50 rounded-xl text-xs font-medium border border-red-100 text-gray-700">
                          {n.message}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-10 w-10 bg-[#EFECE9] rounded-full flex items-center justify-center text-gray-500 overflow-hidden ring-2 ring-red-50 ring-offset-2 ring-offset-white">
              {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <User size={20} />}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           {renderPanel()}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, isOpen = true }: { icon: React.ReactNode, label: string, active?: boolean, isOpen?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-4 p-3 rounded-xl transition-all font-semibold text-xs",
      active ? "bg-red-50 text-red-600 shadow-sm shadow-red-100" : "text-gray-400 hover:bg-[#F5F2F0] hover:text-gray-700"
    )}>
      <div className={cn(
        "p-1.5 rounded-lg",
        active ? "bg-red-100" : "bg-transparent"
      )}>
        {icon}
      </div>
      {isOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="uppercase tracking-widest">{label}</motion.span>}
    </button>
  );
}

