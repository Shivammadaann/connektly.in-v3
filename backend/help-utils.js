const sanitizeHtml = require("sanitize-html");

const ARTICLE_STATUSES = new Set(["draft", "published", "archived"]);
const FEEDBACK_RATINGS = new Set(["helpful", "neutral", "not_helpful"]);

function cleanString(value, maxLength = 5000) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanString(entry, maxLength)).filter(Boolean).join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().slice(0, maxLength);
}

function cleanBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "on"].includes(cleanString(value).toLowerCase());
}

function slugify(value) {
  const slug = cleanString(value, 160)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug || "untitled";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(html) {
  return cleanString(
    sanitizeHtml(html || "", {
      allowedTags: [],
      allowedAttributes: {}
    }).replace(/\s+/g, " "),
    20000
  );
}

function sanitizeArticleHtml(html) {
  return sanitizeHtml(html || "", {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "hr",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "div"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
      div: ["class"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a(tagName, attribs) {
        const href = cleanString(attribs.href);
        const safeHref = /^javascript:/i.test(href) ? "" : href;
        return {
          tagName,
          attribs: {
            ...attribs,
            href: safeHref,
            rel: "noopener noreferrer"
          }
        };
      },
      img(tagName, attribs) {
        const src = cleanString(attribs.src);
        return {
          tagName,
          attribs: {
            src: /^javascript:/i.test(src) ? "" : src,
            alt: cleanString(attribs.alt, 240),
            loading: "lazy"
          }
        };
      }
    }
  });
}

function ensureHeadingAnchors(html) {
  const used = new Map();
  const toc = [];
  const contentHtml = String(html || "").replace(/<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    const title = stripHtml(inner);
    const existing = /\sid=(["'])(.*?)\1/i.exec(attrs || "");
    let id = existing && existing[2] ? slugify(existing[2]) : slugify(title);
    const count = used.get(id) || 0;
    used.set(id, count + 1);
    if (count > 0) {
      id = `${id}-${count + 1}`;
    }

    const cleanAttrs = String(attrs || "").replace(/\sid=(["']).*?\1/i, "");
    toc.push({ id, title, level: tag.toLowerCase() === "h2" ? 2 : 3 });
    return `<${tag}${cleanAttrs} id="${escapeHtml(id)}">${inner}</${tag}>`;
  });

  return { contentHtml, toc };
}

function prepareArticlePayload(body = {}) {
  const rawHtml = cleanString(body.contentHtml || body.content_html, 100000);
  const sanitized = sanitizeArticleHtml(rawHtml);
  const { contentHtml, toc } = ensureHeadingAnchors(sanitized);
  const contentText = stripHtml(contentHtml);
  const words = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;
  const status = cleanString(body.status) || "draft";

  return {
    collectionId: cleanString(body.collectionId || body.collection_id) || null,
    groupId: cleanString(body.groupId || body.group_id) || null,
    title: cleanString(body.title, 240),
    slug: slugify(body.slug || body.title),
    summary: cleanString(body.summary, 1000),
    contentHtml,
    contentText,
    toc,
    tags: normalizeTags(body.tags),
    featuredImageUrl: cleanString(body.featuredImageUrl || body.featured_image_url, 1000),
    seoTitle: cleanString(body.seoTitle || body.seo_title, 240),
    seoDescription: cleanString(body.seoDescription || body.seo_description, 500),
    status: ARTICLE_STATUSES.has(status) ? status : "draft",
    sortOrder: Number(body.sortOrder || body.sort_order || 0) || 0,
    readingTime: Math.max(Math.ceil(words / 200), 1),
    authorName: cleanString(body.authorName || body.author_name, 160)
  };
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanString(entry, 80)).filter(Boolean);
  }

  return cleanString(value)
    .split(",")
    .map((entry) => cleanString(entry, 80))
    .filter(Boolean);
}

function prepareCollectionPayload(body = {}) {
  return {
    title: cleanString(body.title, 160),
    slug: slugify(body.slug || body.title),
    description: cleanString(body.description, 1000),
    icon: cleanString(body.icon, 80),
    sortOrder: Number(body.sortOrder || body.sort_order || 0) || 0,
    isPublished: body.isPublished === undefined && body.is_published === undefined ? true : cleanBoolean(body.isPublished ?? body.is_published)
  };
}

function prepareGroupPayload(body = {}) {
  return {
    collectionId: cleanString(body.collectionId || body.collection_id),
    title: cleanString(body.title, 160),
    slug: slugify(body.slug || body.title),
    description: cleanString(body.description, 1000),
    sortOrder: Number(body.sortOrder || body.sort_order || 0) || 0,
    isPublished: body.isPublished === undefined && body.is_published === undefined ? true : cleanBoolean(body.isPublished ?? body.is_published)
  };
}

module.exports = {
  ARTICLE_STATUSES,
  FEEDBACK_RATINGS,
  cleanBoolean,
  cleanString,
  ensureHeadingAnchors,
  escapeHtml,
  prepareArticlePayload,
  prepareCollectionPayload,
  prepareGroupPayload,
  sanitizeArticleHtml,
  slugify,
  stripHtml
};
