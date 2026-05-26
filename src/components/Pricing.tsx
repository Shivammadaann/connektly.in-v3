export function Pricing() {
  return (
    <section className="py-32 bg-slate-50 border-t border-slate-100" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-4 block">Flexible Plans</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Built for businesses of all sizes.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Growth</h3>
              <p className="text-slate-500 text-sm mb-8">Perfect for testing and growing conversational workflows.</p>
              <div className="mb-8">
                 <span className="text-4xl font-display font-bold text-slate-900">₹999</span>
                 <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> 1,000 free conversations / mo
                 </li>
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Standard API endpoints
                 </li>
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Community support
                 </li>
              </ul>
              <button className="w-full bg-brand-50 text-brand-600 hover:bg-brand-100 font-semibold py-3 rounded-xl transition-colors">Start Free</button>
           </div>

           <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">Most Popular</div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">Starter</h3>
              <p className="text-slate-400 text-sm mb-8">For businesses that need reliable communication at scale.</p>
              <div className="mb-2">
                 <span className="text-4xl font-display font-bold text-white">₹1,999</span>
                 <span className="text-slate-400 font-medium">/mo</span>
              </div>
              <p className="text-brand-400 text-xs font-medium mb-8">+ Meta conversational pricing</p>
              <ul className="space-y-4 mb-10 flex-1">
                 <li className="flex items-center gap-3 text-slate-300 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> Unlimited conversations
                 </li>
                 <li className="flex items-center gap-3 text-slate-300 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> High throughput routing
                 </li>
                 <li className="flex items-center gap-3 text-slate-300 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> Template approval dashboard
                 </li>
                 <li className="flex items-center gap-3 text-slate-300 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> Priority support
                 </li>
              </ul>
              <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors">Start 14-Day Trial</button>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-slate-500 text-sm mb-8">Custom solutions for large scale operations.</p>
              <div className="mb-8">
                 <span className="text-4xl font-display font-bold text-slate-900">₹3,499</span>
                 <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Volume discount pricing
                 </li>
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Dedicated account manager
                 </li>
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> 99.99% SLA guarantee
                 </li>
                 <li className="flex items-center gap-3 text-slate-600 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Custom integrations
                 </li>
              </ul>
              <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-semibold py-3 rounded-xl transition-colors">Contact Sales</button>
           </div>
        </div>
      </div>
    </section>
  );
}
