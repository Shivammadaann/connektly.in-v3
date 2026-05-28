require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;
const LEAD_RECEIVER_EMAIL = process.env.LEAD_RECEIVER_EMAIL || "admin@connektly.in";
const SUCCESS_MESSAGE =
  "Thank you. Your details have been submitted successfully. Our team will contact you shortly.";
const REQUIRED_MESSAGE = "Please fill all required fields.";

app.set("trust proxy", 1);

const defaultOrigins = [
  "https://connektly.in",
  "https://www.connektly.in",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: "80kb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    }
  })
);

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many submissions. Please try again later." }
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." }
});

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

const allowedStatuses = new Set(["new", "contacted", "qualified", "converted", "rejected"]);

const formTypeLabels = {
  homepage_lead: "Homepage Lead",
  landing_page_lead: "Landing Page Lead",
  contact_us: "Contact Form Submission",
  book_demo: "Demo Request",
  partner_application: "Partner Application",
  pricing_enquiry: "Pricing Enquiry",
  footer_lead: "Footer Lead",
  popup_lead: "Popup Lead",
  generic_lead: "Website Lead"
};

const emailSubjects = {
  homepage_lead: "New Homepage Lead - Connektly",
  landing_page_lead: "New Landing Page Lead - Connektly",
  contact_us: "New Contact Form Submission - Connektly",
  book_demo: "New Demo Request - Connektly",
  partner_application: "New Partner Application - Connektly",
  pricing_enquiry: "New Pricing Enquiry - Connektly",
  footer_lead: "New Footer Lead - Connektly",
  popup_lead: "New Popup Lead - Connektly",
  generic_lead: "New Website Lead - Connektly"
};

const leadFields = [
  "id",
  "formType",
  "sourcePage",
  "pageUrl",
  "name",
  "email",
  "phone",
  "companyName",
  "website",
  "message",
  "selectedPlan",
  "businessType",
  "partnerType",
  "customerVolume",
  "clientNetwork",
  "preferredDemoTime",
  "consent",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
  "gclid",
  "fbclid",
  "msclkid",
  "firstPageUrl",
  "landingPage",
  "referrer",
  "capturedAt",
  "userAgent",
  "submittedAt",
  "ipAddress",
  "status",
  "createdAt",
  "updatedAt"
];

const columnByField = {
  id: "id",
  formType: "form_type",
  sourcePage: "source_page",
  pageUrl: "page_url",
  name: "name",
  email: "email",
  phone: "phone",
  companyName: "company_name",
  website: "website",
  message: "message",
  selectedPlan: "selected_plan",
  businessType: "business_type",
  partnerType: "partner_type",
  customerVolume: "customer_volume",
  clientNetwork: "client_network",
  preferredDemoTime: "preferred_demo_time",
  consent: "consent",
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
  gclid: "gclid",
  fbclid: "fbclid",
  msclkid: "msclkid",
  firstPageUrl: "first_page_url",
  landingPage: "landing_page",
  referrer: "referrer",
  capturedAt: "captured_at",
  userAgent: "user_agent",
  submittedAt: "submitted_at",
  ipAddress: "ip_address",
  status: "status",
  createdAt: "created_at",
  updatedAt: "updated_at"
};

function cleanString(value) {
  if (Array.isArray(value)) {
    return value.map(cleanString).filter(Boolean).join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().slice(0, 5000);
}

function firstValue(body, names) {
  for (const name of names) {
    const value = cleanString(body[name]);
    if (value) {
      return value;
    }
  }

  return "";
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = cleanString(value).toLowerCase();
  return ["true", "1", "yes", "on", "agree", "agreed"].includes(normalized);
}

function normalizeLead(body, req) {
  const formType = firstValue(body, ["formType", "form_type", "type"]) || "generic_lead";
  const submittedAt = firstValue(body, ["submittedAt"]) || new Date().toISOString();

  return {
    formType,
    sourcePage: firstValue(body, ["sourcePage", "source_page"]),
    pageUrl: firstValue(body, ["pageUrl", "page_url"]),
    name: firstValue(body, ["name", "fullName", "full_name", "contact-name"]),
    email: firstValue(body, ["email", "contact-email"]),
    phone: firstValue(body, ["phone", "whatsapp_number", "whatsappNumber", "contact-phone"]),
    companyName: firstValue(body, ["companyName", "company_name", "businessName", "business_name", "company"]),
    website: firstValue(body, ["website", "businessWebsite"]),
    message: firstValue(body, ["message", "contact-message", "client_network"]),
    selectedPlan: firstValue(body, ["selectedPlan", "selected_plan", "plan"]),
    businessType: firstValue(body, ["businessType", "business_type", "topic", "contact-topic"]),
    partnerType: firstValue(body, ["partnerType", "partner_type"]),
    customerVolume: firstValue(body, [
      "customerVolume",
      "customer_volume",
      "potential_customer_volume",
      "monthly_whatsapp_enquiries"
    ]),
    clientNetwork: firstValue(body, ["clientNetwork", "client_network"]),
    preferredDemoTime: firstValue(body, ["preferredDemoTime", "preferred_demo_time"]),
    consent: normalizeBoolean(body.consent),
    utmSource: firstValue(body, ["utmSource", "utm_source"]),
    utmMedium: firstValue(body, ["utmMedium", "utm_medium"]),
    utmCampaign: firstValue(body, ["utmCampaign", "utm_campaign"]),
    utmTerm: firstValue(body, ["utmTerm", "utm_term"]),
    utmContent: firstValue(body, ["utmContent", "utm_content"]),
    gclid: firstValue(body, ["gclid"]),
    fbclid: firstValue(body, ["fbclid"]),
    msclkid: firstValue(body, ["msclkid"]),
    firstPageUrl: firstValue(body, ["firstPageUrl", "first_page_url"]),
    landingPage: firstValue(body, ["landingPage", "landing_page"]),
    referrer: firstValue(body, ["referrer", "first_referrer"]),
    capturedAt: firstValue(body, ["capturedAt", "captured_at"]),
    userAgent: firstValue(body, ["userAgent", "user_agent"]) || cleanString(req.get("user-agent")),
    submittedAt,
    ipAddress: cleanString(req.ip),
    status: "new"
  };
}

function hasHoneypot(body) {
  return ["company_website_hidden", "website_url_hidden", "hp_field"].some((name) => cleanString(body[name]));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[+()\-\s.\d]+$/.test(phone);
}

function hasContact(lead) {
  return Boolean(lead.email || lead.phone);
}

function validateLead(lead) {
  const errors = [];

  if (!lead.formType) {
    errors.push("formType is required.");
  } else if (!allowedFormTypes.has(lead.formType)) {
    errors.push("Unknown formType.");
  }

  if (lead.email && !isValidEmail(lead.email)) {
    errors.push("Invalid email address.");
  }

  if (lead.phone && !isValidPhone(lead.phone)) {
    errors.push("Invalid phone number.");
  }

  switch (lead.formType) {
    case "homepage_lead":
    case "landing_page_lead":
    case "book_demo":
    case "popup_lead":
    case "generic_lead":
      if (!lead.name || !hasContact(lead)) errors.push("Name and one contact method are required.");
      break;
    case "contact_us":
      if (!lead.name || !lead.email || !lead.message) errors.push("Name, email, and message are required.");
      break;
    case "partner_application":
      if (!lead.name || !lead.email || !lead.phone || !lead.partnerType || !lead.consent) {
        errors.push("Partner name, email, phone, partner type, and consent are required.");
      }
      break;
    case "pricing_enquiry":
      if (!lead.name || !hasContact(lead)) errors.push("Name and one contact method are required.");
      break;
    case "footer_lead":
      if (!hasContact(lead)) errors.push("One contact method is required.");
      break;
    default:
      errors.push("Unknown formType.");
  }

  return errors;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function dateOrNow(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function rowToLead(row) {
  const lead = {};
  for (const field of leadFields) {
    lead[field] = row[columnByField[field]];
  }
  return lead;
}

function leadToRow(lead) {
  const row = {};
  for (const field of leadFields) {
    if (["id", "createdAt", "updatedAt"].includes(field)) {
      continue;
    }
    row[columnByField[field]] = lead[field] || null;
  }
  return row;
}

class MemoryLeadStore {
  constructor() {
    this.leads = [];
  }

  async init() {
    console.warn("Using in-memory lead storage. Configure DATABASE_URL or Supabase for production.");
  }

  async createLead(lead) {
    const now = new Date().toISOString();
    const saved = { ...lead, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.leads.unshift(saved);
    return saved;
  }

  async listLeads(filters = {}) {
    let results = [...this.leads];
    if (filters.formType) results = results.filter((lead) => lead.formType === filters.formType);
    if (filters.status) results = results.filter((lead) => lead.status === filters.status);
    if (filters.utmSource) results = results.filter((lead) => lead.utmSource === filters.utmSource);
    if (filters.utmCampaign) results = results.filter((lead) => lead.utmCampaign === filters.utmCampaign);
    if (filters.sourcePage) results = results.filter((lead) => lead.sourcePage === filters.sourcePage);
    if (filters.search) {
      const needle = filters.search.toLowerCase();
      results = results.filter((lead) =>
        [lead.name, lead.email, lead.phone, lead.companyName].some((value) =>
          String(value || "").toLowerCase().includes(needle)
        )
      );
    }
    return results.slice(0, Number(filters.limit) || 500);
  }

  async getLead(id) {
    return this.leads.find((lead) => lead.id === id) || null;
  }

  async updateStatus(id, status) {
    const lead = await this.getLead(id);
    if (!lead) return null;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    return lead;
  }
}

class PostgresLeadStore {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined
    });
  }

  async init() {
    await this.pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS website_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        form_type TEXT NOT NULL,
        source_page TEXT,
        page_url TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        company_name TEXT,
        website TEXT,
        message TEXT,
        selected_plan TEXT,
        business_type TEXT,
        partner_type TEXT,
        customer_volume TEXT,
        client_network TEXT,
        preferred_demo_time TEXT,
        consent BOOLEAN DEFAULT FALSE,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_term TEXT,
        utm_content TEXT,
        gclid TEXT,
        fbclid TEXT,
        msclkid TEXT,
        first_page_url TEXT,
        landing_page TEXT,
        referrer TEXT,
        captured_at TEXT,
        user_agent TEXT,
        submitted_at TIMESTAMPTZ,
        ip_address TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
      CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status);
      CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type);
    `);
  }

  async createLead(lead) {
    const row = leadToRow({ ...lead, submittedAt: dateOrNow(lead.submittedAt).toISOString() });
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const result = await this.pool.query(
      `INSERT INTO website_leads (${columns.join(", ")})
       VALUES (${placeholders.join(", ")})
       RETURNING *`,
      values
    );
    return rowToLead(result.rows[0]);
  }

  async listLeads(filters = {}) {
    const clauses = [];
    const values = [];
    const addFilter = (column, value, exact = true) => {
      if (!value) return;
      values.push(exact ? value : `%${value}%`);
      clauses.push(`${column} ${exact ? "=" : "ILIKE"} $${values.length}`);
    };

    addFilter("form_type", filters.formType);
    addFilter("status", filters.status);
    addFilter("utm_source", filters.utmSource);
    addFilter("utm_campaign", filters.utmCampaign);
    addFilter("source_page", filters.sourcePage);
    if (filters.search) {
      values.push(`%${filters.search}%`);
      clauses.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length} OR company_name ILIKE $${values.length})`);
    }

    values.push(Math.min(Number(filters.limit) || 500, 1000));
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.pool.query(
      `SELECT * FROM website_leads ${where} ORDER BY created_at DESC LIMIT $${values.length}`,
      values
    );
    return result.rows.map(rowToLead);
  }

  async getLead(id) {
    const result = await this.pool.query("SELECT * FROM website_leads WHERE id = $1", [id]);
    return result.rows[0] ? rowToLead(result.rows[0]) : null;
  }

  async updateStatus(id, status) {
    const result = await this.pool.query(
      "UPDATE website_leads SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, status]
    );
    return result.rows[0] ? rowToLead(result.rows[0]) : null;
  }
}

class SupabaseLeadStore {
  constructor(url, serviceRoleKey) {
    this.baseUrl = `${url.replace(/\/$/, "")}/rest/v1/website_leads`;
    this.headers = {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json"
    };
  }

  async init() {
    console.info("Using Supabase REST storage for leads.");
  }

  async request(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...this.headers, ...(options.headers || {}) } });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase request failed: ${response.status} ${text}`);
    }
    return response.status === 204 ? null : response.json();
  }

  async createLead(lead) {
    const [row] = await this.request(this.baseUrl, {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify(leadToRow({ ...lead, submittedAt: dateOrNow(lead.submittedAt).toISOString() }))
    });
    return rowToLead(row);
  }

  async listLeads(filters = {}) {
    const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(Math.min(Number(filters.limit) || 500, 1000)) });
    if (filters.formType) params.set("form_type", `eq.${filters.formType}`);
    if (filters.status) params.set("status", `eq.${filters.status}`);
    if (filters.utmSource) params.set("utm_source", `eq.${filters.utmSource}`);
    if (filters.utmCampaign) params.set("utm_campaign", `eq.${filters.utmCampaign}`);
    if (filters.sourcePage) params.set("source_page", `eq.${filters.sourcePage}`);
    if (filters.search) {
      const value = filters.search.replace(/[%*,]/g, "");
      params.set("or", `(name.ilike.*${value}*,email.ilike.*${value}*,phone.ilike.*${value}*,company_name.ilike.*${value}*)`);
    }
    const rows = await this.request(`${this.baseUrl}?${params.toString()}`);
    return rows.map(rowToLead);
  }

  async getLead(id) {
    const rows = await this.request(`${this.baseUrl}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows[0] ? rowToLead(rows[0]) : null;
  }

  async updateStatus(id, status) {
    const rows = await this.request(`${this.baseUrl}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() })
    });
    return rows[0] ? rowToLead(rows[0]) : null;
  }
}

function createLeadStore() {
  if (process.env.DATABASE_URL) {
    return new PostgresLeadStore(process.env.DATABASE_URL);
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new SupabaseLeadStore(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  return new MemoryLeadStore();
}

const leadStore = createLeadStore();

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP is not fully configured. Lead emails will be skipped.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const mailer = createTransporter();

function buildLeadEmailHtml(lead) {
  const rows = [
    ["Lead Type", formTypeLabels[lead.formType] || lead.formType],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone / WhatsApp Number", lead.phone],
    ["Company / Business Name", lead.companyName],
    ["Website", lead.website],
    ["Selected Plan", lead.selectedPlan],
    ["Business Type", lead.businessType],
    ["Partner Type", lead.partnerType],
    ["Potential Customer Volume", lead.customerVolume],
    ["Client Network Details", lead.clientNetwork],
    ["Preferred Demo Time", lead.preferredDemoTime],
    ["Message", lead.message],
    ["Source Page", lead.sourcePage],
    ["Page URL", lead.pageUrl],
    ["First Page URL", lead.firstPageUrl],
    ["Landing Page", lead.landingPage],
    ["Referrer", lead.referrer],
    ["UTM Source", lead.utmSource],
    ["UTM Medium", lead.utmMedium],
    ["UTM Campaign", lead.utmCampaign],
    ["UTM Term", lead.utmTerm],
    ["UTM Content", lead.utmContent],
    ["Google Click ID", lead.gclid],
    ["Facebook Click ID", lead.fbclid],
    ["Microsoft Click ID", lead.msclkid],
    ["Attribution Captured At", lead.capturedAt],
    ["User Agent", lead.userAgent],
    ["Submission Date and Time", lead.createdAt || lead.submittedAt]
  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 16px;">${escapeHtml(emailSubjects[lead.formType] || "New Website Lead - Connektly")}</h2>
      <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="width: 220px; padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 700;">${escapeHtml(label)}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    </div>
  `;
}

async function sendLeadEmail(lead) {
  if (!mailer) {
    return;
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: LEAD_RECEIVER_EMAIL,
    subject: emailSubjects[lead.formType] || emailSubjects.generic_lead,
    html: buildLeadEmailHtml(lead)
  });
}

function requireAdmin(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  try {
    req.admin = jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized." });
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/leads", leadLimiter, async (req, res) => {
  try {
    if (hasHoneypot(req.body || {})) {
      res.json({ success: true, message: SUCCESS_MESSAGE });
      return;
    }

    const lead = normalizeLead(req.body || {}, req);
    const errors = validateLead(lead);
    if (errors.length) {
      res.status(400).json({ success: false, message: REQUIRED_MESSAGE });
      return;
    }

    const savedLead = await leadStore.createLead(lead);

    try {
      await sendLeadEmail(savedLead);
    } catch (error) {
      console.error("Lead email failed", error);
    }

    res.status(201).json({ success: true, message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error("Lead submission failed", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

app.post("/api/admin/login", adminLoginLimiter, (req, res) => {
  const email = cleanString(req.body && req.body.email).toLowerCase();
  const password = cleanString(req.body && req.body.password);
  const adminEmail = cleanString(process.env.ADMIN_EMAIL).toLowerCase();
  const adminPassword = cleanString(process.env.ADMIN_PASSWORD);
  const secret = cleanString(process.env.ADMIN_JWT_SECRET);

  if (!adminEmail || !adminPassword || !secret) {
    res.status(500).json({ success: false, message: "Admin authentication is not configured." });
    return;
  }

  if (email !== adminEmail || password !== adminPassword) {
    res.status(401).json({ success: false, message: "Invalid email or password." });
    return;
  }

  const token = jwt.sign({ email: adminEmail, role: "admin" }, secret, { expiresIn: "8h" });
  res.json({ success: true, token });
});

app.get("/api/admin/leads", requireAdmin, async (req, res) => {
  try {
    const leads = await leadStore.listLeads({
      search: cleanString(req.query.search),
      formType: cleanString(req.query.formType),
      status: cleanString(req.query.status),
      utmSource: cleanString(req.query.utmSource),
      utmCampaign: cleanString(req.query.utmCampaign),
      sourcePage: cleanString(req.query.sourcePage),
      limit: cleanString(req.query.limit)
    });
    res.json({ success: true, leads });
  } catch (error) {
    console.error("Admin lead list failed", error);
    res.status(500).json({ success: false, message: "Unable to load leads." });
  }
});

app.get("/api/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const lead = await leadStore.getLead(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }
    res.json({ success: true, lead });
  } catch (error) {
    console.error("Admin lead detail failed", error);
    res.status(500).json({ success: false, message: "Unable to load lead." });
  }
});

app.patch("/api/admin/leads/:id/status", requireAdmin, async (req, res) => {
  try {
    const status = cleanString(req.body && req.body.status);
    if (!allowedStatuses.has(status)) {
      res.status(400).json({ success: false, message: "Invalid status." });
      return;
    }

    const lead = await leadStore.updateStatus(req.params.id, status);
    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }

    res.json({ success: true, lead });
  } catch (error) {
    console.error("Admin status update failed", error);
    res.status(500).json({ success: false, message: "Unable to update lead status." });
  }
});

app.use((error, req, res, next) => {
  if (error && error.message === "Not allowed by CORS") {
    res.status(403).json({ success: false, message: "Origin not allowed." });
    return;
  }

  console.error("Unhandled API error", error);
  res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
});

leadStore
  .init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connektly lead API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize lead storage", error);
    process.exit(1);
  });
