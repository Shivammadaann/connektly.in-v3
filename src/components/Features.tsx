import { motion } from 'motion/react';
import { Zap, Lock, Users, MessagesSquare, SplitSquareHorizontal } from 'lucide-react';

export function Features() {
  return (
    <section className="py-32 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-4 block">Key Integrations</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Built to replace scattered tools.</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-32">
           <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <MessagesSquare className="text-brand-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-3">Broadcast at scale</h3>
              <p className="text-slate-600 leading-relaxed mb-8">Send campaigns to thousands in a single click with reusable segments and template approvals.</p>
              <div className="text-4xl font-display font-bold text-slate-300 mt-8">80%</div>
           </div>
           <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 relative overflow-hidden">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <Zap className="text-brand-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-3">Automation that closes loops</h3>
              <p className="text-slate-600 leading-relaxed mb-8">Trigger reminders, qualification flows, and support escalations from one rule builder.</p>
              <div className="text-4xl font-display font-bold text-slate-300 mt-8">24/7</div>
           </div>
           <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <Lock className="text-brand-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-3">Privacy-ready from day one</h3>
              <p className="text-slate-600 leading-relaxed mb-8">Consent logging, billing transparency, audit history, and export controls all stay visible.</p>
              <div className="text-4xl font-display font-bold text-slate-300 mt-8">GDPR</div>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1 relative h-[500px] bg-slate-900 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col h-full justify-center gap-6">
                 <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex gap-4 max-w-sm">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">AM</div>
                    <div>
                      <div className="text-white font-medium text-sm">Aarav Mehta</div>
                      <div className="text-slate-400 text-xs mt-1">Can I get pricing for a 12 agent support team?</div>
                    </div>
                 </div>
                 <div className="bg-brand-600 p-4 rounded-2xl flex gap-4 max-w-sm self-end">
                    <div>
                      <div className="text-white text-sm">Suggested reply ready with current plan details and next steps.</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0 delay-100">AI</div>
                 </div>
                 <div className="mt-8 flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white">CRM Context: $4.8k Deal</div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white">Response: 2m 14s</div>
                 </div>
              </div>
           </div>
           <div className="order-1 lg:order-2">
             <span className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-4 block">Omnichannel Inbox</span>
             <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight mb-6">Chats, calls and emails in one thread.</h2>
             <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Connektly brings WhatsApp Business, Messenger, Instagram, and email into one shared inbox. It also integrates with your CRM, giving your team complete customer context in every conversation.
             </p>
             <ul className="space-y-6">
               <li className="flex gap-4 text-slate-700">
                 <div className="bg-brand-50 p-2 rounded-lg h-fit">
                   <Users className="w-6 h-6 text-brand-600 shrink-0" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 mb-1">Unified Customer Timeline</h4>
                   <p className="text-sm text-slate-600">One continuous thread for sales, support, and success teams to follow.</p>
                 </div>
               </li>
               <li className="flex gap-4 text-slate-700">
                 <div className="bg-brand-50 p-2 rounded-lg h-fit">
                   <SplitSquareHorizontal className="w-6 h-6 text-brand-600 shrink-0" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 mb-1">Seamless Handoffs</h4>
                   <p className="text-sm text-slate-600">Less tab switching, faster replies, and perfect context retention across agents.</p>
                 </div>
               </li>
             </ul>
           </div>
        </div>
      </div>
    </section>
  );
}
