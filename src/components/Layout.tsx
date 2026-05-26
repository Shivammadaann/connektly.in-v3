import React from 'react';
import { MessageSquareShare, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-xl">
            <MessageSquareShare className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">Connektly</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-brand-600 transition-colors">Contact</a>
        </nav>
        <div className="flex gap-4">
          <button className="hidden md:block font-medium text-slate-900 px-4 py-2 text-sm hover:opacity-70 transition-opacity">Login</button>
          <button className="bg-slate-900 text-white font-medium px-5 py-2 rounded-full text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">Book Demo</button>
        </div>
      </header>
      <main className="pt-[72px] flex-1">
        {children}
      </main>
      <footer className="bg-slate-950 py-16 px-6 text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-brand-600 p-2 rounded-xl">
                <MessageSquareShare className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">Connektly</span>
            </div>
            <p className="text-sm">Modern CRM for ambitious teams powered by official WhatsApp APIs.</p>
            <div className="flex gap-4 mt-6">
                <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Omnichannel Inbox</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Automations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Campaigns</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
