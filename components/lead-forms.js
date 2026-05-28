(function () {
  "use strict";

  const API_BASE_URL = "https://backend.connektly.in";
  const LEAD_ENDPOINT = `${API_BASE_URL}/api/leads`;
  const ATTRIBUTION_KEY = "connektly_attribution";
  const SUCCESS_MESSAGE =
    "Thank you. Your details have been submitted successfully. Our team will contact you shortly.";

  const trackingParams = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    utm_term: "utmTerm",
    utm_content: "utmContent",
    gclid: "gclid",
    fbclid: "fbclid",
    msclkid: "msclkid"
  };

  const allowedFormTypes = new Set([
    "homepage_lead",
    "landing_page_lead",
    "contact_us",
    "book_demo",
    "partner_application",
    "pricing_enquiry",
    "footer_lead",
    "popup_lead",
    "generic_lead"
  ]);

  function storageGet() {
    try {
      return JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function storageSet(value) {
    try {
      window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
    } catch (error) {
      // Storage can be unavailable in strict privacy contexts. Submissions still work.
    }
  }

  function captureAttribution() {
    const params = new URLSearchParams(window.location.search);
    const stored = storageGet();
    const next = { ...stored };
    let hasNewTracking = false;

    Object.entries(trackingParams).forEach(([queryName, fieldName]) => {
      const value = (params.get(queryName) || "").trim();
      if (value) {
        next[fieldName] = value;
        hasNewTracking = true;
      }
    });

    if (!next.firstPageUrl || hasNewTracking) {
      next.firstPageUrl = window.location.href;
    }

    if (!next.landingPage || hasNewTracking) {
      next.landingPage = window.location.pathname || "/";
    }

    if ((!next.referrer && document.referrer) || hasNewTracking) {
      next.referrer = document.referrer || next.referrer || "";
    }

    if (!next.capturedAt || hasNewTracking) {
      next.capturedAt = new Date().toISOString();
    }

    storageSet(next);
    return next;
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function firstValue(source, names) {
    for (const name of names) {
      const value = clean(source[name]);
      if (value) {
        return value;
      }
    }

    return "";
  }

  function setAlias(payload, target, names) {
    const value = firstValue(payload, names);
    if (value && !payload[target]) {
      payload[target] = value;
    }
  }

  function normalizePayload(payload) {
    setAlias(payload, "name", ["name", "full_name", "fullName", "contact-name"]);
    setAlias(payload, "email", ["email", "contact-email"]);
    setAlias(payload, "phone", ["phone", "whatsapp_number", "whatsappNumber", "contact-phone"]);
    setAlias(payload, "companyName", ["companyName", "company_name", "business_name", "businessName", "company"]);
    setAlias(payload, "businessType", ["businessType", "business_type", "topic", "contact-topic"]);
    setAlias(payload, "partnerType", ["partnerType", "partner_type"]);
    setAlias(payload, "customerVolume", [
      "customerVolume",
      "customer_volume",
      "potential_customer_volume",
      "monthly_whatsapp_enquiries"
    ]);
    setAlias(payload, "clientNetwork", ["clientNetwork", "client_network"]);
    setAlias(payload, "selectedPlan", ["selectedPlan", "selected_plan", "plan"]);
    setAlias(payload, "preferredDemoTime", ["preferredDemoTime", "preferred_demo_time"]);
    setAlias(payload, "message", ["message", "contact-message"]);
  }

  function readFormPayload(form) {
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {
      if (value instanceof File) {
        payload[key] = value.name;
        return;
      }

      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        payload[key] = `${payload[key]}, ${value}`;
        return;
      }

      payload[key] = value;
    });

    form.querySelectorAll('input[type="checkbox"][name]').forEach((input) => {
      payload[input.name] = input.checked ? "true" : "false";
    });

    normalizePayload(payload);
    return payload;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 && /^[+()\-\s.\d]+$/.test(phone);
  }

  function hasContact(payload) {
    return Boolean(clean(payload.email) || clean(payload.phone));
  }

  function hasConsent(payload) {
    return ["true", "1", "yes", "on", "agree", "agreed"].includes(clean(payload.consent).toLowerCase());
  }

  function validatePayload(payload) {
    const formType = payload.formType;

    if (!formType || !allowedFormTypes.has(formType)) {
      return "Please fill all required fields.";
    }

    if (payload.email && !isValidEmail(payload.email)) {
      return "Please enter a valid email address.";
    }

    if (payload.phone && !isValidPhone(payload.phone)) {
      return "Please enter a valid phone number.";
    }

    switch (formType) {
      case "homepage_lead":
      case "landing_page_lead":
      case "book_demo":
      case "popup_lead":
      case "generic_lead":
        if (!clean(payload.name) || !hasContact(payload)) return "Please enter your name and email or phone.";
        break;
      case "contact_us":
        if (!clean(payload.name) || !clean(payload.email) || !clean(payload.message)) {
          return "Please enter your name, email, and message.";
        }
        break;
      case "partner_application":
        if (!clean(payload.name) || !clean(payload.email) || !clean(payload.phone) || !clean(payload.partnerType) || !hasConsent(payload)) {
          return "Please complete all required partner details.";
        }
        break;
      case "pricing_enquiry":
        if (!clean(payload.name) || !hasContact(payload)) return "Please enter your name and email or phone.";
        break;
      case "footer_lead":
        if (!hasContact(payload)) return "Please enter your email or phone.";
        break;
      default:
        return "Please fill all required fields.";
    }

    return "";
  }

  function ensureHoneypot(form) {
    if (form.querySelector('[name="company_website_hidden"]')) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px";
    wrapper.style.width = "1px";
    wrapper.style.height = "1px";
    wrapper.style.overflow = "hidden";
    wrapper.innerHTML = '<label>Company website<input type="text" name="company_website_hidden" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(wrapper);
  }

  function getStatusNode(form) {
    const existing =
      form.querySelector("[data-lead-status]") ||
      form.querySelector(".contact-form__status") ||
      form.querySelector(".form-status");

    if (existing) {
      existing.setAttribute("role", "status");
      existing.setAttribute("aria-live", "polite");
      return existing;
    }

    const node = document.createElement("p");
    node.dataset.leadStatus = "true";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.style.marginTop = "0.85rem";
    node.style.fontSize = "0.95rem";
    node.style.color = "#2563eb";
    form.appendChild(node);
    return node;
  }

  function setStatus(node, message, isError) {
    if (!node) {
      return;
    }

    node.textContent = message;
    node.classList.toggle("is-error", Boolean(isError));
    node.style.color = isError ? "#dc2626" : "#2563eb";
  }

  async function submitLeadForm(form) {
    const payload = readFormPayload(form);
    const formType = form.dataset.formType || payload.formType || "generic_lead";
    const attribution = captureAttribution();
    const statusNode = getStatusNode(form);
    const submitButton = form.querySelector('[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : "";

    payload.formType = formType;
    payload.sourcePage = document.title || window.location.pathname || "/";
    payload.pageUrl = window.location.href;
    payload.userAgent = navigator.userAgent;
    payload.submittedAt = new Date().toISOString();
    payload.referrer = attribution.referrer || document.referrer || "";

    Object.assign(payload, attribution);

    const validationMessage = validatePayload(payload);
    if (validationMessage) {
      setStatus(statusNode, validationMessage, true);
      if (typeof form.reportValidity === "function") {
        form.reportValidity();
      }
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }
      setStatus(statusNode, "Submitting your details...", false);

      const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Please fill all required fields.");
      }

      form.reset();
      setStatus(statusNode, result.message || SUCCESS_MESSAGE, false);
    } catch (error) {
      setStatus(statusNode, error.message || "Something went wrong. Please try again.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  }

  function bindLeadForms() {
    captureAttribution();

    document.querySelectorAll("form[data-lead-form]").forEach((form) => {
      if (form.dataset.leadFormBound === "true") {
        return;
      }

      form.dataset.leadFormBound = "true";
      ensureHoneypot(form);

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        void submitLeadForm(form);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindLeadForms);
  } else {
    bindLeadForms();
  }
})();
