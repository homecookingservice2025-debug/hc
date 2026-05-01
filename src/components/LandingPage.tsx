import React from 'react';
import { 
  ChefHat, 
  Target, 
  Eye, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Heart,
  Clock,
  Utensils,
  CheckCircle2,
  XCircle,
  IndianRupee
} from 'lucide-react';
import { AppConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div className="relative">
      <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 overflow-hidden">
        <ChefHat size={24} className="relative z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-6 h-6 bg-red-400/20 rounded-full blur-sm" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" />
    </div>
    <div className="flex flex-col">
      <span className="text-lg font-black tracking-tighter leading-none text-gray-900">HC HOME</span>
      <span className="text-[10px] font-black tracking-widest leading-none text-red-600 uppercase">Cooking</span>
    </div>
  </div>
);

export default function LandingPage({ config, onExplore }: { config: AppConfig | null, onExplore: () => void }) {
  if (!config) return null;

  return (
    <div className="bg-[#FFFBFA] selection:bg-red-100 min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Logo />
            <div className="hidden lg:flex items-center gap-8">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase text-red-600 tracking-widest">Service Area</span>
                  <span className="text-[11px] font-black text-gray-900">Lucknow, UP Only</span>
               </div>
               <div className="w-px h-8 bg-gray-100" />
               <a href="#about" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors">About</a>
               <a href="#services" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors">Services</a>
               <a href="#contact" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors">Contact</a>
               <button 
                  onClick={onExplore}
                  className="bg-red-600 text-white px-8 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-95"
               >
                  Login / Register
               </button>
            </div>
            
            {/* Mobile Menu Icon Placeholder */}
            <button className="lg:hidden p-2 text-gray-900" onClick={onExplore}>
               <ChefHat size={24} />
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
           >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full">
                <MapPin size={12} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exclusively in Lucknow, UP</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[1.1] text-gray-900">
                 Elite Indian <br/> Chefs in Your <br/> <span className="text-red-600">Kitchen.</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-lg">
                 We bring professional Indian culinary expertise to Lucknow homes. Fresh ingredients, authentic taste, and healthy meals prepared by elite chefs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <button 
                    onClick={onExplore}
                    className="bg-red-600 text-white px-10 h-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-2xl shadow-red-100"
                 >
                    Get Started <ArrowRight size={20} />
                 </button>
                 <div className="flex items-center gap-4 px-6 h-16 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="avatar" />
                          </div>
                       ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">1000+ Happy Lucknow Clients</span>
                 </div>
              </div>
           </motion.div>

           <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[4rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square"
           >
              {config.homeBannerType === 'video' ? (
                <video src={config.homeBannerUrl} autoPlay loop muted className="w-full h-full object-cover" />
              ) : (
                <img src={config.homeBannerUrl} alt="Hero" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                 <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                    <h3 className="text-white font-black text-xl mb-1 italic">"Asal Lucknowi Swad, Chef ke Haath"</h3>
                    <p className="text-gray-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <IndianRupee size={12} /> Only 3 per minute
                    </p>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Utensils size={12} /> Our Excellence
                 </div>
                 <h2 className="text-5xl font-black tracking-tight leading-none">Our Services</h2>
              </div>
              <p className="max-w-md text-gray-500 font-medium text-lg leading-relaxed">
                 Professional culinary solutions for every occasion, exclusively available for Lucknow residents.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "1. Daily Veg Meals",
                  features: ["Seasonal vegetables", "Balanced nutrition", "Cooked fresh every day"],
                  color: "bg-emerald-50",
                  textColor: "text-emerald-700"
                },
                {
                  title: "2. Party Special Menu – ₹555 Per Plate",
                  features: ["Starters + Main Course + Dessert", "Customizable as per event", "Hygienic and flavorful"],
                  color: "bg-red-50",
                  textColor: "text-red-700",
                  special: true
                },
                {
                  title: "3. Customized Orders",
                  features: ["Flexible menu selection", "Monsoon, summer & winter specials", "Healthy & delicious"],
                  color: "bg-amber-50",
                  textColor: "text-amber-700"
                }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("p-10 rounded-[3.5rem] border border-gray-100 flex flex-col h-full", service.color)}
                >
                   <h3 className={cn("text-2xl font-black mb-8 leading-tight", service.textColor)}>{service.title}</h3>
                   <ul className="space-y-4 flex-1">
                      {service.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-3 font-bold text-gray-700">
                           <CheckCircle2 size={18} className={service.textColor} />
                           {feat}
                        </li>
                      ))}
                   </ul>
                   {service.special && (
                      <div className="mt-10 p-6 bg-white rounded-3xl border border-red-100 shadow-sm">
                         <div className="flex items-center gap-2 mb-2">
                           <ShieldCheck size={16} className="text-red-600" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#E31E24]">Important Policy</span>
                         </div>
                         <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic">
                            For party menu bookings, 50% advance payment is required at the time of booking, and the full payment must be cleared one day before the event.
                         </p>
                      </div>
                   )}
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Reference Images Section */}
      {(config.partyMenuImageUrl || config.dailyVegImageUrl) && (
        <section className="py-24 px-8 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            {config.partyMenuImageUrl && (
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-red-600 italic">Party Special Menu Reference</h4>
                <div className="rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl aspect-[4/3]">
                  <img src={config.partyMenuImageUrl} className="w-full h-full object-cover" alt="Party Menu" />
                </div>
              </div>
            )}
            {config.dailyVegImageUrl && (
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600 italic">Daily Vegetable List</h4>
                <div className="rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl aspect-[4/3]">
                  <img src={config.dailyVegImageUrl} className="w-full h-full object-cover" alt="Daily Veg" />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl font-black tracking-tight">Why Choose Professionals?</h2>
              <p className="text-gray-500 font-medium tracking-tight">Experience matters when it comes to your family's health.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: <Clock />, title: "30-Min Arrival", desc: "Our chefs arrive within 30 minutes of booking confirmation." },
                { icon: <Heart />, title: "Personal Care", desc: "Meals tailored to your taste, health requirements, and preferences." },
                { icon: <ShieldCheck />, title: "Hygiene First", desc: "Strict hygiene protocols during cooking and cleaning sessions." },
                { icon: <CheckCircle2 />, title: "Verified Chefs", desc: "Background checked and professionally trained home cooks." },
                { icon: <Utensils />, title: "Home-Style", desc: "Authentic taste of home cooking with minimal oil and fresh spices." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-xl transition-all cursor-default"
                >
                   <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                      {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
                   </div>
                   <h4 className="text-lg font-black">{item.title}</h4>
                   <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 px-8">
        <div className="max-w-4xl mx-auto space-y-12">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-xl shadow-red-200">
                 <ChefHat size={40} />
              </div>
              <h2 className="text-5xl font-black tracking-tight">About HC Home Cooking</h2>
           </div>
           <p className="text-2xl font-bold text-gray-600 leading-relaxed italic border-l-8 border-red-600 pl-8">
              {config.aboutUs}
           </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="vision" className="py-24 bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
             <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 space-y-6"
            >
               <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Target size={32} />
               </div>
               <h3 className="text-3xl font-black">Our Mission</h3>
               <p className="text-xl text-gray-400 font-medium leading-relaxed italic">
                  {config.mission}
               </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 space-y-6"
            >
               <div className="w-16 h-16 bg-red-400 rounded-2xl flex items-center justify-center shadow-lg shadow-red-400/20">
                  <Eye size={32} />
               </div>
               <h3 className="text-3xl font-black">Our Vision</h3>
               <p className="text-xl text-gray-400 font-medium leading-relaxed italic">
                  {config.vision}
               </p>
            </motion.div>
        </div>
      </section>

      {/* Director's Message */}
      <section id="director" className="py-32 px-8 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 className="relative group lg:order-2"
              >
                 <div className="absolute -inset-4 bg-red-600/10 rounded-[5rem] blur-2xl group-hover:bg-red-600/20 transition-all" />
                 <img 
                    src={config.directorPhoto} 
                    alt="Director" 
                    className="relative w-full aspect-square object-cover rounded-[4rem] shadow-2xl z-10 grayscale hover:grayscale-0 transition-all duration-700" 
                 />
                 <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[3rem] shadow-xl z-20 border border-gray-100 hidden md:block">
                    <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-1">Director</p>
                    <h4 className="text-xl font-black text-gray-900">{config.directorName}</h4>
                 </div>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 className="space-y-10 lg:order-1"
              >
                 <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Word from Leadership</span>
                    <h2 className="text-5xl font-black tracking-tighter leading-tight">💬 Director’s Message</h2>
                 </div>
                 <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed">
                    {config.directorMessage?.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-gray-200">
                    <p className="text-xl font-black text-gray-900">— {config.directorName}</p>
                    <p className="text-sm font-bold text-gray-400">Director, HC Home Cooking.</p>
                 </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
           <div className="bg-gray-900 rounded-[4rem] p-12 md:p-20 text-white grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-5xl font-black tracking-tight">Contact Us</h2>
                    <p className="text-gray-400 font-medium">Have questions? We're here to help you start your healthy journey.</p>
                 </div>
                             <div className="space-y-8">
                    <div className="flex items-center gap-6 group cursor-default">
                       <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-red-600 transition-all">
                          <Phone size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone & WhatsApp</p>
                          <p className="text-xl font-bold">{config.contactPhone}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 group cursor-default">
                       <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-red-600 transition-all">
                          <Mail size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</p>
                          <p className="text-xl font-bold">{config.contactEmail}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 group cursor-default">
                       <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-red-600 transition-all">
                          <MapPin size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Headquarters (Lucknow Only)</p>
                          <p className="text-lg font-bold leading-tight">{config.address}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 space-y-8">
                 <h3 className="text-2xl font-black">Send us a Message</h3>
                 <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                       <input placeholder="Name" className="h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold focus:border-red-600 outline-none transition-all" />
                       <input placeholder="Phone" className="h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold focus:border-red-600 outline-none transition-all" />
                    </div>
                    <input placeholder="Subject" className="h-14 w-full bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold focus:border-red-600 outline-none transition-all" />
                    <textarea placeholder="Message" className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-bold focus:border-red-600 outline-none transition-all resize-none" />
                    <button className="w-full h-16 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 hover:bg-red-700 transition-all">
                       Send Message <MessageSquare size={18} />
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <Logo />
            <div className="flex gap-10">
               <PolicyModal title="Privacy Policy" content={config.privacyPolicy} />
               <PolicyModal title="Terms and Conditions" content={config.termsAndConditions} />
               <PolicyModal title="Refund Policy" content={config.refundPolicy} />
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">© 2026 HC Home Cooking | Lucknow, India</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Developed by <span className="text-red-600">Digital communique Private Limited</span></p>
            </div>
         </div>
      </footer>
    </div>
  );
}

function PolicyModal({ title, content }: { title: string, content?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900"
      >
        {title}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => setIsOpen(false)} 
             />
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
             >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h3 className="text-xl font-black">{title}</h3>
                   <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                      <XCircle size={24} />
                   </button>
                </div>
                <div className="p-8 overflow-y-auto text-sm text-gray-600 leading-loose font-medium whitespace-pre-wrap">
                   {content || `Our ${title} will be updated soon. Please check back later.`}
                </div>
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                   <button onClick={() => setIsOpen(false)} className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Close</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
