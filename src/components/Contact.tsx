import { type FormEvent, useState } from "react";

const API_BASE_URL = "https://backend.connektly.in";
const ATTRIBUTION_KEY = "connektly_attribution";

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || "{}");
  } catch (error) {
    stored = {};
  }
  const mapping: Record<string, string> = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    utm_term: "utmTerm",
    utm_content: "utmContent",
    gclid: "gclid",
    fbclid: "fbclid",
    msclkid: "msclkid"
  };
  let hasTracking = false;
  const next = { ...stored };

  Object.entries(mapping).forEach(([queryName, fieldName]) => {
    const value = params.get(queryName);
    if (value) {
      next[fieldName] = value;
      hasTracking = true;
    }
  });

  if (!next.firstPageUrl || hasTracking) next.firstPageUrl = window.location.href;
  if (!next.landingPage || hasTracking) next.landingPage = window.location.pathname || "/";
  if (!next.referrer || hasTracking) next.referrer = document.referrer || next.referrer || "";
  if (!next.capturedAt || hasTracking) next.capturedAt = new Date().toISOString();
  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  return next;
}

export function Contact() {
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());
    const attribution = getAttribution();

    setIsSubmitting(true);
    setIsError(false);
    setStatus("Submitting your details...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          ...attribution,
          formType: "homepage_lead",
          sourcePage: document.title || window.location.pathname,
          pageUrl: window.location.href,
          referrer: attribution.referrer || document.referrer || "",
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString()
        })
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Please fill all required fields.");
      }

      form.reset();
      setStatus(result.message);
    } catch (error) {
      setIsError(true);
      setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">First Name</label>
                    <input name="name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="Jane" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Last Name</label>
                    <input name="last_name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                  <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="jane@company.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Message</label>
                  <textarea name="message" rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-900" placeholder="How can we help?" required />
                </div>
                <input type="text" name="company_website_hidden" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">{isSubmitting ? "Submitting..." : "Send Message"}</button>
                <p className={`text-sm font-semibold ${isError ? "text-red-600" : "text-brand-600"}`} role="status" aria-live="polite">{status}</p>
              </form>
            </div>
         </div>
      </div>
    </section>
  );
}
