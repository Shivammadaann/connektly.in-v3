const crypto = require("crypto");
const { Pool } = require("pg");
const {
  cleanString,
  prepareArticlePayload,
  prepareCollectionPayload,
  prepareGroupPayload,
  slugify
} = require("./help-utils");

function nowIso() {
  return new Date().toISOString();
}

function rowToCollection(row = {}) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || "",
    icon: row.icon || "book-open",
    sortOrder: row.sort_order || 0,
    isPublished: Boolean(row.is_published),
    articleCount: Number(row.article_count || 0),
    groupCount: Number(row.group_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToGroup(row = {}) {
  return {
    id: row.id,
    collectionId: row.collection_id,
    title: row.title,
    slug: row.slug,
    description: row.description || "",
    sortOrder: row.sort_order || 0,
    isPublished: Boolean(row.is_published),
    articleCount: Number(row.article_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToArticle(row = {}) {
  return {
    id: row.id,
    collectionId: row.collection_id,
    groupId: row.group_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || "",
    contentHtml: row.content_html || "",
    contentText: row.content_text || "",
    toc: Array.isArray(row.toc) ? row.toc : row.toc || [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    featuredImageUrl: row.featured_image_url || "",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    status: row.status || "draft",
    sortOrder: row.sort_order || 0,
    readingTime: row.reading_time || 1,
    authorName: row.author_name || "",
    viewCount: row.view_count || 0,
    collectionTitle: row.collection_title || "",
    collectionSlug: row.collection_slug || "",
    groupTitle: row.group_title || "",
    groupSlug: row.group_slug || "",
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToMedia(row = {}) {
  return {
    id: row.id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    mimeType: row.mime_type || "",
    fileSize: row.file_size || 0,
    altText: row.alt_text || "",
    createdAt: row.created_at
  };
}

function rowToFeedback(row = {}) {
  return {
    id: row.id,
    articleId: row.article_id,
    articleTitle: row.article_title || "",
    articleSlug: row.article_slug || "",
    rating: row.rating,
    message: row.message || "",
    pageUrl: row.page_url || "",
    referrer: row.referrer || "",
    userAgent: row.user_agent || "",
    ipAddress: row.ip_address || "",
    createdAt: row.created_at
  };
}

function collectionToRow(payload) {
  return {
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    icon: payload.icon,
    sort_order: payload.sortOrder,
    is_published: payload.isPublished
  };
}

function groupToRow(payload) {
  return {
    collection_id: payload.collectionId,
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    sort_order: payload.sortOrder,
    is_published: payload.isPublished
  };
}

function articleToRow(payload) {
  return {
    collection_id: payload.collectionId,
    group_id: payload.groupId,
    title: payload.title,
    slug: payload.slug,
    summary: payload.summary,
    content_html: payload.contentHtml,
    content_text: payload.contentText,
    toc: JSON.stringify(payload.toc || []),
    tags: payload.tags,
    featured_image_url: payload.featuredImageUrl,
    seo_title: payload.seoTitle,
    seo_description: payload.seoDescription,
    status: payload.status,
    sort_order: payload.sortOrder,
    reading_time: payload.readingTime,
    author_name: payload.authorName,
    published_at: payload.status === "published" ? new Date().toISOString() : null
  };
}

const starterCollections = [
  ["Getting Started", "getting-started", "Start here for the basics of setting up and using Connektly.", "sparkles"],
  ["WhatsApp Setup", "whatsapp-setup", "Guides for WhatsApp Cloud API, templates, and number setup.", "message-circle"],
  ["Inbox & Conversations", "inbox-conversations", "Manage chats, assignments, and customer conversations.", "inbox"],
  ["Campaigns", "campaigns", "Create and manage customer messaging campaigns.", "send"],
  ["Automations", "automations", "Automate common workflows and repetitive follow-ups.", "workflow"],
  ["Billing & Plans", "billing-plans", "Understand subscriptions, billing, and plan changes.", "credit-card"],
  ["Integrations", "integrations", "Connect Connektly with the tools your team uses.", "plug"],
  ["Troubleshooting", "troubleshooting", "Resolve common setup and product issues.", "life-buoy"]
];

const starterArticles = [
  ["What is Connektly?", "getting-started", "A short overview of Connektly and where to begin.", "<h2>Overview</h2><p>Connektly helps teams organize customer messaging, conversations, and workflows in one workspace.</p><h2>Where to start</h2><ul><li>Set up your workspace.</li><li>Invite your team.</li><li>Connect the channels you plan to use.</li></ul>"],
  ["How to connect WhatsApp Cloud API", "whatsapp-setup", "General steps for preparing a WhatsApp Cloud API connection.", "<h2>Before you begin</h2><p>Prepare your business details, Meta access, and the phone number you want to connect.</p><h2>Connection checklist</h2><ol><li>Review your Meta Business settings.</li><li>Confirm number ownership.</li><li>Follow the setup flow in your workspace.</li></ol>"],
  ["How to manage conversations in the unified inbox", "inbox-conversations", "Learn the basics of viewing and organizing customer conversations.", "<h2>Open the inbox</h2><p>The inbox gives your team a shared view of active customer conversations.</p><h2>Keep work organized</h2><p>Use ownership, notes, and filters to keep replies clear.</p>"],
  ["How to create a WhatsApp campaign", "campaigns", "A simple campaign planning checklist.", "<h2>Plan your campaign</h2><p>Choose an audience, message goal, and approved template before sending.</p><h2>Review before launch</h2><p>Check timing, copy, and audience selection carefully.</p>"],
  ["How to use automations", "automations", "Understand how automations can support repeated workflows.", "<h2>Automation basics</h2><p>Automations help respond to repeated events and route work to the right team.</p><h2>Start small</h2><p>Begin with one common workflow, then expand after testing.</p>"],
  ["How to invite team members", "getting-started", "Invite teammates and prepare workspace access.", "<h2>Invite teammates</h2><p>Add team members from your workspace settings and assign roles that match their responsibilities.</p>"],
  ["How to manage contacts", "inbox-conversations", "Keep customer contact details organized.", "<h2>Contact records</h2><p>Use contact details to keep customer context available during conversations.</p>"],
  ["How billing and plans work", "billing-plans", "A generic overview of billing and subscription management.", "<h2>Billing overview</h2><p>Your plan controls access to workspace features. Usage-based charges may depend on connected channels and provider rules.</p>"]
];

class MemoryHelpStore {
  constructor() {
    this.collections = [];
    this.groups = [];
    this.articles = [];
    this.media = [];
    this.feedback = [];
  }

  async init() {
    if (!this.collections.length) {
      await this.seed();
    }
    console.warn("Using in-memory help storage. Configure DATABASE_URL or Supabase for production.");
  }

  async seed() {
    starterCollections.forEach((entry, index) => {
      this.collections.push({
        id: crypto.randomUUID(),
        title: entry[0],
        slug: entry[1],
        description: entry[2],
        icon: entry[3],
        sortOrder: index,
        isPublished: true,
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
    });

    starterArticles.forEach((entry, index) => {
      const collection = this.collections.find((item) => item.slug === entry[1]);
      const payload = prepareArticlePayload({
        collectionId: collection && collection.id,
        title: entry[0],
        slug: slugify(entry[0]),
        summary: entry[2],
        contentHtml: entry[3],
        status: "published",
        authorName: "Connektly Team",
        sortOrder: index
      });
      this.articles.push({ ...payload, id: crypto.randomUUID(), publishedAt: nowIso(), createdAt: nowIso(), updatedAt: nowIso() });
    });
  }

  withCounts(collection) {
    return {
      ...collection,
      articleCount: this.articles.filter((article) => article.collectionId === collection.id && article.status === "published").length,
      groupCount: this.groups.filter((group) => group.collectionId === collection.id).length
    };
  }

  attachNames(article) {
    const collection = this.collections.find((item) => item.id === article.collectionId);
    const group = this.groups.find((item) => item.id === article.groupId);
    return {
      ...article,
      collectionTitle: collection ? collection.title : "",
      collectionSlug: collection ? collection.slug : "",
      groupTitle: group ? group.title : "",
      groupSlug: group ? group.slug : ""
    };
  }

  async listPublicCollections() {
    return this.collections.filter((item) => item.isPublished).sort((a, b) => a.sortOrder - b.sortOrder).map((item) => this.withCounts(item));
  }

  async getPublicCollection(slug) {
    const collection = this.collections.find((item) => item.slug === slug && item.isPublished);
    if (!collection) return null;
    const groups = this.groups.filter((group) => group.collectionId === collection.id && group.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
    const articles = this.articles
      .filter((article) => article.collectionId === collection.id && article.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((article) => this.attachNames(article));
    return { collection: this.withCounts(collection), groups, articles };
  }

  async getPublicArticle(slug) {
    const article = this.articles.find((item) => item.slug === slug && item.status === "published");
    if (!article) return null;
    article.viewCount = (article.viewCount || 0) + 1;
    const relatedArticles = this.articles
      .filter((item) => item.id !== article.id && item.status === "published" && (item.collectionId === article.collectionId || item.groupId === article.groupId))
      .slice(0, 6)
      .map((item) => this.attachNames(item));
    const collection = this.collections.find((item) => item.id === article.collectionId) || null;
    const group = this.groups.find((item) => item.id === article.groupId) || null;
    return { article: this.attachNames(article), collection, group, relatedArticles };
  }

  async searchPublicArticles(query) {
    const needle = cleanString(query).toLowerCase();
    if (!needle) return [];
    return this.articles
      .filter((article) => article.status === "published")
      .map((article) => this.attachNames(article))
      .filter((article) =>
        [article.title, article.summary, article.contentText, article.tags.join(" "), article.collectionTitle, article.groupTitle]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
      .slice(0, 25);
  }

  async createFeedback(slug, payload) {
    const article = this.articles.find((item) => item.slug === slug && item.status === "published");
    if (!article) return null;
    const record = { id: crypto.randomUUID(), articleId: article.id, articleTitle: article.title, articleSlug: article.slug, ...payload, createdAt: nowIso() };
    this.feedback.unshift(record);
    return record;
  }

  async stats() {
    return {
      totalCollections: this.collections.length,
      totalGroups: this.groups.length,
      totalArticles: this.articles.length,
      publishedArticles: this.articles.filter((item) => item.status === "published").length,
      draftArticles: this.articles.filter((item) => item.status === "draft").length,
      totalFeedback: this.feedback.length,
      recentArticles: this.articles.slice(0, 5).map((article) => this.attachNames(article)),
      recentFeedback: this.feedback.slice(0, 5)
    };
  }

  async listCollections() {
    return this.collections.map((item) => this.withCounts(item)).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCollection(id) {
    const item = this.collections.find((collection) => collection.id === id);
    return item ? this.withCounts(item) : null;
  }

  async createCollection(data) {
    if (this.collections.some((item) => item.slug === data.slug)) throw new Error("DUPLICATE_SLUG");
    const record = { ...data, id: crypto.randomUUID(), createdAt: nowIso(), updatedAt: nowIso() };
    this.collections.push(record);
    return this.withCounts(record);
  }

  async updateCollection(id, data) {
    const current = this.collections.find((item) => item.id === id);
    if (!current) return null;
    if (this.collections.some((item) => item.id !== id && item.slug === data.slug)) throw new Error("DUPLICATE_SLUG");
    Object.assign(current, data, { updatedAt: nowIso() });
    return this.withCounts(current);
  }

  async deleteCollection(id) {
    if (this.groups.some((item) => item.collectionId === id) || this.articles.some((item) => item.collectionId === id)) {
      throw new Error("COLLECTION_HAS_CONTENT");
    }
    this.collections = this.collections.filter((item) => item.id !== id);
  }

  async listGroups(collectionId = "") {
    return this.groups.filter((item) => !collectionId || item.collectionId === collectionId).map((item) => ({
      ...item,
      articleCount: this.articles.filter((article) => article.groupId === item.id).length
    }));
  }

  async getGroup(id) {
    return this.groups.find((group) => group.id === id) || null;
  }

  async createGroup(data) {
    if (this.groups.some((item) => item.collectionId === data.collectionId && item.slug === data.slug)) throw new Error("DUPLICATE_SLUG");
    const record = { ...data, id: crypto.randomUUID(), createdAt: nowIso(), updatedAt: nowIso() };
    this.groups.push(record);
    return record;
  }

  async updateGroup(id, data) {
    const current = this.groups.find((item) => item.id === id);
    if (!current) return null;
    if (this.groups.some((item) => item.id !== id && item.collectionId === data.collectionId && item.slug === data.slug)) throw new Error("DUPLICATE_SLUG");
    Object.assign(current, data, { updatedAt: nowIso() });
    return current;
  }

  async deleteGroup(id) {
    if (this.articles.some((item) => item.groupId === id)) throw new Error("GROUP_HAS_CONTENT");
    this.groups = this.groups.filter((item) => item.id !== id);
  }

  async listArticles(filters = {}) {
    const search = cleanString(filters.search).toLowerCase();
    return this.articles
      .map((item) => this.attachNames(item))
      .filter((item) => !filters.status || item.status === filters.status)
      .filter((item) => !filters.collectionId || item.collectionId === filters.collectionId)
      .filter((item) => !filters.groupId || item.groupId === filters.groupId)
      .filter((item) => !search || [item.title, item.summary, item.contentText].join(" ").toLowerCase().includes(search));
  }

  async getArticle(id) {
    const article = this.articles.find((item) => item.id === id);
    return article ? this.attachNames(article) : null;
  }

  async createArticle(data) {
    if (this.articles.some((item) => item.slug === data.slug)) throw new Error("DUPLICATE_SLUG");
    const record = { ...data, id: crypto.randomUUID(), publishedAt: data.status === "published" ? nowIso() : null, createdAt: nowIso(), updatedAt: nowIso() };
    this.articles.unshift(record);
    return this.attachNames(record);
  }

  async updateArticle(id, data) {
    const current = this.articles.find((item) => item.id === id);
    if (!current) return null;
    if (this.articles.some((item) => item.id !== id && item.slug === data.slug)) throw new Error("DUPLICATE_SLUG");
    Object.assign(current, data, {
      publishedAt: data.status === "published" && !current.publishedAt ? nowIso() : current.publishedAt,
      updatedAt: nowIso()
    });
    return this.attachNames(current);
  }

  async publishArticle(id) {
    const article = await this.getArticle(id);
    return article ? this.updateArticle(id, prepareArticlePayload({ ...article, status: "published" })) : null;
  }

  async unpublishArticle(id) {
    const article = await this.getArticle(id);
    return article ? this.updateArticle(id, prepareArticlePayload({ ...article, status: "draft" })) : null;
  }

  async duplicateArticle(id) {
    const article = await this.getArticle(id);
    if (!article) return null;
    return this.createArticle(prepareArticlePayload({ ...article, title: `${article.title} Copy`, slug: `${article.slug}-copy`, status: "draft" }));
  }

  async deleteArticle(id) {
    this.articles = this.articles.filter((item) => item.id !== id);
  }

  async createMedia(data) {
    const record = { ...data, id: crypto.randomUUID(), createdAt: nowIso() };
    this.media.unshift(record);
    return record;
  }

  async listMedia() {
    return this.media;
  }

  async getMedia(id) {
    return this.media.find((item) => item.id === id) || null;
  }

  async deleteMedia(id) {
    this.media = this.media.filter((item) => item.id !== id);
  }

  async listFeedback() {
    return this.feedback;
  }
}

class PostgresHelpStore {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined
    });
  }

  async init() {
    await this.pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS help_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS help_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        collection_id UUID REFERENCES help_collections(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(collection_id, slug)
      );
      CREATE TABLE IF NOT EXISTS help_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        collection_id UUID REFERENCES help_collections(id) ON DELETE SET NULL,
        group_id UUID REFERENCES help_groups(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        summary TEXT,
        content_html TEXT,
        content_text TEXT,
        toc JSONB,
        tags TEXT[],
        featured_image_url TEXT,
        seo_title TEXT,
        seo_description TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        sort_order INTEGER DEFAULT 0,
        reading_time INTEGER,
        author_name TEXT,
        view_count INTEGER DEFAULT 0,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS help_article_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID REFERENCES help_articles(id) ON DELETE CASCADE,
        rating TEXT NOT NULL CHECK (rating IN ('helpful', 'neutral', 'not_helpful')),
        message TEXT,
        page_url TEXT,
        referrer TEXT,
        user_agent TEXT,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS help_media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        mime_type TEXT,
        file_size INTEGER,
        alt_text TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS help_collections_slug_idx ON help_collections (slug);
      CREATE INDEX IF NOT EXISTS help_groups_collection_id_idx ON help_groups (collection_id);
      CREATE INDEX IF NOT EXISTS help_articles_slug_idx ON help_articles (slug);
      CREATE INDEX IF NOT EXISTS help_articles_status_idx ON help_articles (status);
      CREATE INDEX IF NOT EXISTS help_articles_collection_id_idx ON help_articles (collection_id);
      CREATE INDEX IF NOT EXISTS help_articles_group_id_idx ON help_articles (group_id);
      CREATE INDEX IF NOT EXISTS help_article_feedback_article_id_idx ON help_article_feedback (article_id);
    `);
    await this.seedStarterContent();
  }

  async seedStarterContent() {
    const count = await this.pool.query("SELECT COUNT(*)::int AS count FROM help_collections");
    if (count.rows[0].count > 0) return;
    for (let i = 0; i < starterCollections.length; i += 1) {
      const entry = starterCollections[i];
      await this.pool.query(
        "INSERT INTO help_collections (title, slug, description, icon, sort_order, is_published) VALUES ($1,$2,$3,$4,$5,true)",
        [entry[0], entry[1], entry[2], entry[3], i]
      );
    }
    for (let i = 0; i < starterArticles.length; i += 1) {
      const entry = starterArticles[i];
      const collection = await this.pool.query("SELECT id FROM help_collections WHERE slug = $1", [entry[1]]);
      const payload = prepareArticlePayload({
        collectionId: collection.rows[0] && collection.rows[0].id,
        title: entry[0],
        slug: slugify(entry[0]),
        summary: entry[2],
        contentHtml: entry[3],
        status: "published",
        authorName: "Connektly Team",
        sortOrder: i
      });
      const row = articleToRow(payload);
      await this.insertRow("help_articles", row);
    }
  }

  async insertRow(table, row) {
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const result = await this.pool.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async updateRow(table, id, row) {
    const columns = Object.keys(row);
    const values = Object.values(row);
    values.push(id);
    const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
    assignments.push("updated_at = NOW()");
    const result = await this.pool.query(
      `UPDATE ${table} SET ${assignments.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async listPublicCollections() {
    const result = await this.pool.query(`
      SELECT c.*, COUNT(a.id)::int AS article_count
      FROM help_collections c
      LEFT JOIN help_articles a ON a.collection_id = c.id AND a.status = 'published'
      WHERE c.is_published = TRUE
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.title ASC
    `);
    return result.rows.map(rowToCollection);
  }

  async getPublicCollection(slug) {
    const collectionResult = await this.pool.query("SELECT * FROM help_collections WHERE slug = $1 AND is_published = TRUE", [slug]);
    if (!collectionResult.rows[0]) return null;
    const collection = rowToCollection(collectionResult.rows[0]);
    const groupsResult = await this.pool.query("SELECT * FROM help_groups WHERE collection_id = $1 AND is_published = TRUE ORDER BY sort_order ASC, title ASC", [collection.id]);
    const articlesResult = await this.pool.query(`
      SELECT a.*, c.title AS collection_title, c.slug AS collection_slug, g.title AS group_title, g.slug AS group_slug
      FROM help_articles a
      LEFT JOIN help_collections c ON c.id = a.collection_id
      LEFT JOIN help_groups g ON g.id = a.group_id
      WHERE a.collection_id = $1 AND a.status = 'published'
      ORDER BY COALESCE(g.sort_order, 0), a.sort_order ASC, a.title ASC
    `, [collection.id]);
    return { collection: { ...collection, articleCount: articlesResult.rows.length }, groups: groupsResult.rows.map(rowToGroup), articles: articlesResult.rows.map(rowToArticle) };
  }

  async getPublicArticle(slug) {
    const result = await this.pool.query(`
      SELECT a.*, c.title AS collection_title, c.slug AS collection_slug, g.title AS group_title, g.slug AS group_slug
      FROM help_articles a
      LEFT JOIN help_collections c ON c.id = a.collection_id
      LEFT JOIN help_groups g ON g.id = a.group_id
      WHERE a.slug = $1 AND a.status = 'published' AND (c.is_published IS TRUE OR c.id IS NULL)
    `, [slug]);
    const row = result.rows[0];
    if (!row) return null;
    await this.pool.query("UPDATE help_articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1", [row.id]);
    const related = await this.pool.query(`
      SELECT a.*, c.title AS collection_title, c.slug AS collection_slug, g.title AS group_title, g.slug AS group_slug
      FROM help_articles a
      LEFT JOIN help_collections c ON c.id = a.collection_id
      LEFT JOIN help_groups g ON g.id = a.group_id
      WHERE a.status = 'published' AND a.id <> $1 AND (a.collection_id = $2 OR a.group_id = $3 OR a.tags && $4::text[])
      ORDER BY a.updated_at DESC
      LIMIT 6
    `, [row.id, row.collection_id, row.group_id, row.tags || []]);
    return {
      article: rowToArticle(row),
      collection: row.collection_id ? { id: row.collection_id, title: row.collection_title, slug: row.collection_slug } : null,
      group: row.group_id ? { id: row.group_id, title: row.group_title, slug: row.group_slug } : null,
      relatedArticles: related.rows.map(rowToArticle)
    };
  }

  async searchPublicArticles(query) {
    const needle = `%${cleanString(query).replace(/[%_]/g, "")}%`;
    if (needle === "%%") return [];
    const result = await this.pool.query(`
      SELECT a.*, c.title AS collection_title, c.slug AS collection_slug, g.title AS group_title, g.slug AS group_slug
      FROM help_articles a
      LEFT JOIN help_collections c ON c.id = a.collection_id
      LEFT JOIN help_groups g ON g.id = a.group_id
      WHERE a.status = 'published'
        AND (
          a.title ILIKE $1 OR a.summary ILIKE $1 OR a.content_text ILIKE $1 OR
          array_to_string(a.tags, ' ') ILIKE $1 OR c.title ILIKE $1 OR g.title ILIKE $1
        )
      ORDER BY a.updated_at DESC
      LIMIT 25
    `, [needle]);
    return result.rows.map(rowToArticle);
  }

  async createFeedback(slug, payload) {
    const article = await this.pool.query("SELECT id FROM help_articles WHERE slug = $1 AND status = 'published'", [slug]);
    if (!article.rows[0]) return null;
    const row = await this.insertRow("help_article_feedback", {
      article_id: article.rows[0].id,
      rating: payload.rating,
      message: payload.message,
      page_url: payload.pageUrl,
      referrer: payload.referrer,
      user_agent: payload.userAgent,
      ip_address: payload.ipAddress
    });
    return rowToFeedback(row);
  }

  async stats() {
    const result = await this.pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM help_collections) AS total_collections,
        (SELECT COUNT(*)::int FROM help_groups) AS total_groups,
        (SELECT COUNT(*)::int FROM help_articles) AS total_articles,
        (SELECT COUNT(*)::int FROM help_articles WHERE status = 'published') AS published_articles,
        (SELECT COUNT(*)::int FROM help_articles WHERE status = 'draft') AS draft_articles,
        (SELECT COUNT(*)::int FROM help_article_feedback) AS total_feedback
    `);
    const recentArticles = await this.listArticles({ limit: 5 });
    const recentFeedback = await this.listFeedback(5);
    return { ...result.rows[0], recentArticles, recentFeedback };
  }

  async listCollections() {
    const result = await this.pool.query(`
      SELECT c.*, COUNT(DISTINCT a.id)::int AS article_count, COUNT(DISTINCT g.id)::int AS group_count
      FROM help_collections c
      LEFT JOIN help_articles a ON a.collection_id = c.id
      LEFT JOIN help_groups g ON g.collection_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.title ASC
    `);
    return result.rows.map(rowToCollection);
  }

  async getCollection(id) {
    const result = await this.pool.query("SELECT * FROM help_collections WHERE id = $1", [id]);
    return result.rows[0] ? rowToCollection(result.rows[0]) : null;
  }

  async createCollection(data) {
    return rowToCollection(await this.insertRow("help_collections", collectionToRow(data)));
  }

  async updateCollection(id, data) {
    const row = await this.updateRow("help_collections", id, collectionToRow(data));
    return row ? rowToCollection(row) : null;
  }

  async deleteCollection(id) {
    const count = await this.pool.query("SELECT (SELECT COUNT(*)::int FROM help_groups WHERE collection_id = $1) + (SELECT COUNT(*)::int FROM help_articles WHERE collection_id = $1) AS count", [id]);
    if (count.rows[0].count > 0) throw new Error("COLLECTION_HAS_CONTENT");
    await this.pool.query("DELETE FROM help_collections WHERE id = $1", [id]);
  }

  async listGroups(collectionId = "") {
    const values = [];
    let where = "";
    if (collectionId) {
      values.push(collectionId);
      where = "WHERE g.collection_id = $1";
    }
    const result = await this.pool.query(`
      SELECT g.*, COUNT(a.id)::int AS article_count
      FROM help_groups g
      LEFT JOIN help_articles a ON a.group_id = g.id
      ${where}
      GROUP BY g.id
      ORDER BY g.sort_order ASC, g.title ASC
    `, values);
    return result.rows.map(rowToGroup);
  }

  async getGroup(id) {
    const result = await this.pool.query("SELECT * FROM help_groups WHERE id = $1", [id]);
    return result.rows[0] ? rowToGroup(result.rows[0]) : null;
  }

  async createGroup(data) {
    return rowToGroup(await this.insertRow("help_groups", groupToRow(data)));
  }

  async updateGroup(id, data) {
    const row = await this.updateRow("help_groups", id, groupToRow(data));
    return row ? rowToGroup(row) : null;
  }

  async deleteGroup(id) {
    const count = await this.pool.query("SELECT COUNT(*)::int AS count FROM help_articles WHERE group_id = $1", [id]);
    if (count.rows[0].count > 0) throw new Error("GROUP_HAS_CONTENT");
    await this.pool.query("DELETE FROM help_groups WHERE id = $1", [id]);
  }

  async listArticles(filters = {}) {
    const clauses = [];
    const values = [];
    const add = (sql, value) => {
      if (!value) return;
      values.push(value);
      clauses.push(sql.replace("?", `$${values.length}`));
    };
    add("a.status = ?", filters.status);
    add("a.collection_id = ?", filters.collectionId);
    add("a.group_id = ?", filters.groupId);
    if (filters.search) {
      values.push(`%${cleanString(filters.search).replace(/[%_]/g, "")}%`);
      clauses.push(`(a.title ILIKE $${values.length} OR a.summary ILIKE $${values.length} OR a.content_text ILIKE $${values.length})`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.pool.query(`
      SELECT a.*, c.title AS collection_title, c.slug AS collection_slug, g.title AS group_title, g.slug AS group_slug
      FROM help_articles a
      LEFT JOIN help_collections c ON c.id = a.collection_id
      LEFT JOIN help_groups g ON g.id = a.group_id
      ${where}
      ORDER BY a.updated_at DESC
      LIMIT 500
    `, values);
    return result.rows.map(rowToArticle);
  }

  async getArticle(id) {
    const result = await this.pool.query(`
      SELECT a.*, c.title AS collection_title, c.slug AS collection_slug, g.title AS group_title, g.slug AS group_slug
      FROM help_articles a
      LEFT JOIN help_collections c ON c.id = a.collection_id
      LEFT JOIN help_groups g ON g.id = a.group_id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0] ? rowToArticle(result.rows[0]) : null;
  }

  async createArticle(data) {
    return rowToArticle(await this.insertRow("help_articles", articleToRow(data)));
  }

  async updateArticle(id, data) {
    const current = await this.getArticle(id);
    if (!current) return null;
    const rowData = articleToRow(data);
    if (data.status === "published" && current.publishedAt) {
      rowData.published_at = current.publishedAt;
    }
    const row = await this.updateRow("help_articles", id, rowData);
    return row ? this.getArticle(row.id) : null;
  }

  async publishArticle(id) {
    const current = await this.getArticle(id);
    return current ? this.updateArticle(id, prepareArticlePayload({ ...current, status: "published" })) : null;
  }

  async unpublishArticle(id) {
    const current = await this.getArticle(id);
    return current ? this.updateArticle(id, prepareArticlePayload({ ...current, status: "draft" })) : null;
  }

  async duplicateArticle(id) {
    const current = await this.getArticle(id);
    if (!current) return null;
    return this.createArticle(prepareArticlePayload({
      ...current,
      title: `${current.title} Copy`,
      slug: `${current.slug}-copy-${Date.now()}`,
      status: "draft"
    }));
  }

  async deleteArticle(id) {
    await this.pool.query("DELETE FROM help_articles WHERE id = $1", [id]);
  }

  async createMedia(data) {
    const row = await this.insertRow("help_media", {
      file_name: data.fileName,
      file_url: data.fileUrl,
      mime_type: data.mimeType,
      file_size: data.fileSize,
      alt_text: data.altText || ""
    });
    return rowToMedia(row);
  }

  async listMedia() {
    const result = await this.pool.query("SELECT * FROM help_media ORDER BY created_at DESC LIMIT 200");
    return result.rows.map(rowToMedia);
  }

  async getMedia(id) {
    const result = await this.pool.query("SELECT * FROM help_media WHERE id = $1", [id]);
    return result.rows[0] ? rowToMedia(result.rows[0]) : null;
  }

  async deleteMedia(id) {
    await this.pool.query("DELETE FROM help_media WHERE id = $1", [id]);
  }

  async listFeedback(limit = 200) {
    const result = await this.pool.query(`
      SELECT f.*, a.title AS article_title, a.slug AS article_slug
      FROM help_article_feedback f
      LEFT JOIN help_articles a ON a.id = f.article_id
      ORDER BY f.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows.map(rowToFeedback);
  }
}

function createHelpStore() {
  if (process.env.DATABASE_URL) {
    return new PostgresHelpStore(process.env.DATABASE_URL);
  }

  return new MemoryHelpStore();
}

module.exports = {
  createHelpStore,
  prepareArticlePayload,
  prepareCollectionPayload,
  prepareGroupPayload,
  rowToArticle,
  rowToCollection,
  rowToFeedback,
  rowToGroup,
  rowToMedia
};
