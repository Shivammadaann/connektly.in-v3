import { motion } from 'motion/react';
import { ShieldCheck, MessageCircle, BarChart3, Zap, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-50 pt-20 pb-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-8 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Official Tech Partner for WhatsApp Business</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.05] tracking-tight mb-6">
            Turn WhatsApp into your <span className="text-brand-600">revenue engine.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
            Broadcast campaigns, qualify leads, automate support, and manage every customer conversation from one modern workspace built for fast-growing teams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30">
              Book a Demo <ArrowRight className="w-5 h-5"/>
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-8 py-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm">
              Explore Features
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 relative">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative z-10">
               <div className="text-2xl font-display font-bold text-slate-900">80%</div>
               <div className="text-sm text-slate-500 font-medium leading-tight mt-1">Queries automated</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative z-10">
               <div className="text-2xl font-display font-bold text-slate-900">10x</div>
               <div className="text-sm text-slate-500 font-medium leading-tight mt-1">Faster handoffs</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative z-10">
               <div className="text-2xl font-display font-bold text-slate-900">24/7</div>
               <div className="text-sm text-slate-500 font-medium leading-tight mt-1">Journeys running</div>
             </div>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="relative lg:h-[600px] flex items-center justify-center mt-10 lg:mt-0"
        >
           {/* Dashboard Mockup */}
           <div className="w-full max-w-lg aspect-[4/5] bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="h-12 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-slate-700"/>
                   <div className="w-3 h-3 rounded-full bg-slate-700"/>
                   <div className="w-3 h-3 rounded-full bg-slate-700"/>
                 </div>
                 <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Connektly Command Center</span>
                 <div className="w-8"/>
              </div>
              <div className="flex flex-1 p-4 gap-4 bg-slate-950">
                <div className="w-14 sm:w-32 flex flex-col gap-2">
                  <div className="h-8 bg-brand-500/20 rounded-lg border border-brand-500/30 flex items-center px-3">
                     <MessageCircle className="w-4 h-4 text-brand-500 sm:mr-2" />
                     <span className="text-xs font-medium text-brand-100 hidden sm:block">Inbox</span>
                  </div>
                  <div className="h-8 hover:bg-slate-800 rounded-lg flex items-center px-3 transition-colors text-slate-500">
                     <Zap className="w-4 h-4 sm:mr-2" />
                     <span className="text-xs font-medium hidden sm:block">Automate</span>
                  </div>
                  <div className="h-8 hover:bg-slate-800 rounded-lg flex items-center px-3 transition-colors text-slate-500">
                     <BarChart3 className="w-4 h-4 sm:mr-2" />
                     <span className="text-xs font-medium hidden sm:block">Reports</span>
                  </div>
                </div>
                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">WA</div>
                       <div>
                         <div className="text-sm font-medium text-white">New order query</div>
                         <div className="text-xs text-slate-400">Routed to sales</div>
                       </div>
                     </div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">IG</div>
                       <div>
                         <div className="text-sm font-medium text-white">Campaign reply</div>
                         <div className="text-xs text-slate-400">Tagged high intent</div>
                       </div>
                     </div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 opacity-60">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">AI</div>
                       <div>
                         <div className="text-sm font-medium text-white">Support follow-up</div>
                         <div className="text-xs text-slate-400">Drafting reply...</div>
                       </div>
                     </div>
                   </div>

                   <div className="mt-auto p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 border-dashed">
                      <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Live Audience</div>
                      <div className="text-3xl font-display font-medium text-white">3,482</div>
                   </div>
                </div>
              </div>
           </div>
           
           <motion.div 
             initial={{ y: 20, opacity: 0 }} 
             animate={{ y: 0, opacity: 1 }} 
             transition={{ delay: 1, duration: 0.6 }}
             className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4"
           >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl">🚀</div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Meta Partner Ready</div>
                <div className="text-xs text-slate-500 font-medium">Built for verified workflows</div>
              </div>
           </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
