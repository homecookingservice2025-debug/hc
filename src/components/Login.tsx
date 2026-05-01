import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  ShieldCheck, 
  User as UserIcon, 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle,
  Clock,
  ClipboardList,
  QrCode,
  Headphones,
  Star,
  Upload,
  Search
} from 'lucide-react';
import { UserRole, User, AppConfig } from '../types';
import { cn } from '../lib/utils';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (user: User) => void;
  config: AppConfig | null;
}

export default function Login({ onLogin, config }: LoginProps) {
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [googleLocation, setGoogleLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (role !== UserRole.USER) {
      setIsRegistering(false);
    }
  }, [role]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    fetch(isRegistering ? '/api/users' : '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isRegistering ? { name, surname: '', email, password, role, isVerified: true, phone: '', whatsapp, googleLocation } : { email, password, role })
    }).then(async res => {
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || (isRegistering ? 'Registration failed' : 'Login failed'));
      }
    }).catch(() => {
      setError('Connection error');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleGoogleLogin = async () => {
    if (role !== UserRole.USER) {
      setError('Google login is currently active for customers only. Other roles must use registered IDs.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        onLogin(userDoc.data() as User);
      } else {
        // Create new user record
        const newUser: User = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName?.split(' ')[0] || 'User',
          surname: user.displayName?.split(' ').slice(1).join(' ') || '',
          role: UserRole.USER,
          photo: user.photoURL || undefined,
          phone: user.phoneNumber || '',
          isVerified: true,
          addresses: []
        };
        await setDoc(doc(db, 'users', user.uid), newUser);
        onLogin(newUser);
      }
    } catch (err: any) {
      console.error(err);
      setError('Google authentication failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: UserRole.ADMIN, label: 'Admin', icon: <LogIn size={18} /> },
    { id: UserRole.MANAGER, label: 'Manager', icon: <ClipboardList size={18} /> },
    { id: UserRole.USER, label: 'User', icon: <UserIcon size={18} /> },
    { id: UserRole.CHEF, label: 'Chef', icon: <ChefHat size={18} /> },
  ];

  const features = [
    { icon: <ChefHat size={18} />, title: "Book Verified Chefs", desc: "Expert home chefs at your service" },
    { icon: <ClipboardList size={18} />, title: "Party & Daily Orders", desc: "For everyday meals or special events" },
    { icon: <Clock size={18} />, title: "Live Cooking & Tracking", desc: "Real-time updates on your service" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-[1200px] w-full bg-white rounded-[3rem] shadow-[0_48px_120px_-20px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left Side: Brand Visuals */}
        <div className="hidden md:flex md:w-[42%] lg:w-[40%] bg-gray-900 relative flex-col justify-between overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1581339399810-0937a06a64b6?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
            alt="Indian Chef Cooking"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-transparent" />
          
          <div className="relative z-10 p-12 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E31E24] rounded-2xl flex items-center justify-center shadow-2xl">
                <ChefHat className="text-white" size={24} />
              </div>
              <div className="text-white">
                <h2 className="font-black text-xl tracking-tighter uppercase leading-none italic">HC</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Home Cooking</p>
              </div>
            </div>

            <div className="max-w-xs">
              <h1 className="text-white text-5xl font-black leading-[1.1] mb-6 tracking-tight">
                Authentic <br/> Home Taste, <br/> <span className="text-[#E31E24]">Made Real.</span>
              </h1>
              <div className="space-y-6">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex flex-shrink-0 items-center justify-center text-white group-hover:bg-[#E31E24] transition-colors border border-white/10">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">{f.title}</h4>
                      <p className="text-white/40 text-[11px] leading-relaxed mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-8 border-t border-white/10">
              <div className="w-8 h-8 rounded-full border-2 border-[#E31E24] flex items-center justify-center">
                <div className="w-3 h-3 bg-[#E31E24] rounded-full animate-pulse" />
              </div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Trusted by 5000+ Families</p>
            </div>
          </div>
        </div>

        {/* Right Side: Logic & Inputs */}
        <div className="flex-1 p-8 md:p-16 flex flex-col lg:p-20">
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
                {isRegistering ? 'Join Us' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400 font-medium">
                {isRegistering ? 'Create your professional account' : 'Please enter your details to continue'}
              </p>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-shake">
                  {error}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-10">
              {roles.map((r) => (
                 <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all group relative",
                    role === r.id 
                      ? "border-red-600 bg-red-50/50 shadow-[0_12px_24px_-8px_rgba(220,38,38,0.2)]" 
                      : "border-gray-50 bg-[#F9F8F7] hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "transition-colors",
                    role === r.id ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"
                  )}>
                    {r.icon}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tighter",
                    role === r.id ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"
                  )}>{r.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                {isRegistering && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E31E24] transition-colors">
                          <UserIcon size={18} />
                        </div>
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-14 pl-14 pr-6 bg-[#F9F8F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E31E24]/20 focus:ring-4 focus:ring-[#E31E24]/5 font-bold text-sm transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E31E24] transition-colors">
                            <CheckCircle size={18} />
                          </div>
                          <input 
                            type="tel" 
                            placeholder="+91..."
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-[#F9F8F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E31E24]/20 focus:ring-4 focus:ring-[#E31E24]/5 font-bold text-sm transition-all shadow-inner"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E31E24] transition-colors">
                            <Clock size={18} />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Google Maps URL"
                            value={googleLocation}
                            onChange={(e) => setGoogleLocation(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-[#F9F8F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E31E24]/20 focus:ring-4 focus:ring-[#E31E24]/5 font-bold text-sm transition-all shadow-inner"
                            required={role === UserRole.USER}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E31E24] transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Username or ID"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-14 pr-6 bg-[#F9F8F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E31E24]/20 focus:ring-4 focus:ring-[#E31E24]/5 font-bold text-sm transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
                    {!isRegistering && <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] hover:underline">Forgot?</button>}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E31E24] transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-14 pr-14 bg-[#F9F8F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E31E24]/20 focus:ring-4 focus:ring-[#E31E24]/5 font-bold text-sm transition-all shadow-inner"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 group cursor-pointer w-fit">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer z-10" defaultChecked />
                  <div className="w-5 h-5 border-2 border-gray-100 rounded-lg transition-all peer-checked:bg-[#E31E24] peer-checked:border-[#E31E24]">
                    <CheckCircle className="text-white opacity-0 peer-checked:opacity-100 w-full h-full p-0.5 transition-opacity" />
                  </div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 group-hover:text-gray-600 transition-colors">
                  {isRegistering ? 'Accept terms & conditions' : 'Stay logged in'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-gray-900 border-none rounded-2xl shadow-xl shadow-gray-200 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 group"
              >
                {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Continue'}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="my-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-300">Social login enabled</div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>

            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              {role === UserRole.USER ? (
                <>
                  {isRegistering ? 'Already have an account?' : 'Not a member yet?'} 
                  <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[#E31E24] hover:underline ml-1"
                  >
                    {isRegistering ? 'Login Now' : 'Create Account'}
                  </button>
                </>
              ) : (
                <span>Registration is restricted to customers only</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Footer Badges */}
      <div className="max-w-[1200px] w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        <div className="flex items-center gap-4 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">OTP Verified</p>
            <p className="text-[9px] font-bold text-gray-400">100% Secure Access</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <QrCode size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Digital Payments</p>
            <p className="text-[9px] font-bold text-gray-400">Instant & Safe</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Star size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Rated Chefs</p>
            <p className="text-[9px] font-bold text-gray-400">Verified Reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Headphones size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Human Support</p>
            <p className="text-[9px] font-bold text-gray-400">Ready to Assist</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
        © 2026 <span className="text-[#E31E24] font-black underline underline-offset-4">DIGITAL COMMUNIQUE PRIVATE LIMITED</span> • Secure Banking Node
      </p>
    </div>
  );
}

