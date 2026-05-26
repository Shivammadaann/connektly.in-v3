export function Contact() {
  return (
    <section className="py-32 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-6">
         <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row gap-16 items-center shadow-2xl overflow-hidden relative">
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500/30 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex-1 relative z-10 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-6">Ready to scale your messaging?</h2>
              <p className="text-lg text-slate-300 leading-relaxed max-w-md mx-auto lg:mx-0 mb-10">Have questions about pricing, features, or integrations? Our team is ready to help you orchestrate your customer messaging seamlessly.</p>
              
              <div className="hidden lg:flex gap-8">
                 <div>
                   <div className="text-brand-400 font-semibold text-sm mb-1 uppercase tracking-wider">Phone</div>
                   <div className="text-white font-medium">+1 239 496 5301</div>
                 </div>
                 <div>
                   <div className="text-brand-400 font-semibold text-sm mb-1 uppercase tracking-wider">Email</div>
                   <div className="text-white font-medium">support@connektly.in</div>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-[480px] bg-white rounded-3xl p-8 relative z-10 shadow-xl">
              <h3 className="text-2xl font-bold font-display text-slate-900 mb-6">Send us a message</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.assign('/thank-you/'); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">First Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Last Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Message</label>
                  <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="How can we help?" />
                </div>
                <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">Send Message</button>
              </form>
            </div>
         </div>
      </div>
    </section>
  );
}
