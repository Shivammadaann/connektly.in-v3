(function () {
  "use strict";

  const API_BASE_URL = "https://backend.connektly.in";

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
  }

  function articleUrl(slug) {
    return `/help/article.html?slug=${encodeURIComponent(slug)}`;
  }

  function collectionUrl(slug) {
    return `/help/collection.html?slug=${encodeURIComponent(slug)}`;
  }

  function iconText(collection) {
    return String(collection.icon || collection.title || "H").replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "HC";
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Unable to load Help Centre content.");
    }
    return data;
  }

  function bindSearch() {
    const input = qs("[data-help-search]");
    const panel = qs("[data-search-results]");
    if (!input || !panel) return;

    let timer = 0;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const query = input.value.trim();
      if (query.length < 2) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      timer = window.setTimeout(async () => {
        panel.classList.add("is-open");
        panel.innerHTML = '<div class="search-result"><span>Searching...</span></div>';
        try {
          const data = await api(`/api/help/search?q=${encodeURIComponent(query)}`);
          const results = data.results || [];
          panel.innerHTML = results.length
            ? results
                .map((article) => `
                  <a class="search-result" href="${articleUrl(article.slug)}">
                    <strong>${escapeHtml(article.title)}</strong>
                    <span>${escapeHtml(article.summary || "Open this article for the full guide.")}</span>
                    <small>${escapeHtml([article.collectionTitle, article.groupTitle].filter(Boolean).join(" / "))}</small>
                  </a>
                `)
                .join("")
            : '<div class="search-result"><span>No matching help articles found.</span></div>';
        } catch (error) {
          panel.innerHTML = `<div class="search-result"><span>${escapeHtml(error.message)}</span></div>`;
        }
      }, 240);
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".help-search")) {
        panel.classList.remove("is-open");
      }
    });
  }

  async function initHome() {
    const grid = qs("[data-collections-grid]");
    if (!grid) return;
    bindSearch();
    try {
      const data = await api("/api/help/collections");
      const collections = data.collections || [];
      if (!collections.length) {
        grid.innerHTML = '<div class="state">No help articles have been published yet.</div>';
        return;
      }
      grid.innerHTML = collections
        .map((collection) => `
          <a class="collection-card" href="${collectionUrl(collection.slug)}">
            <span class="collection-icon">${escapeHtml(iconText(collection))}</span>
            <span>
              <h3>${escapeHtml(collection.title)}</h3>
              <p>${escapeHtml(collection.description)}</p>
              <small>${Number(collection.articleCount || 0)} articles</small>
            </span>
            <span class="chevron">-&gt;</span>
          </a>
        `)
        .join("");
    } catch (error) {
      grid.innerHTML = `<div class="state">${escapeHtml(error.message)}</div>`;
    }
  }

  function getSlug() {
    return new URLSearchParams(window.location.search).get("slug") || "";
  }

  async function initCollection() {
    const root = qs("[data-collection-page]");
    if (!root) return;
    bindSearch();
    const slug = getSlug();
    if (!slug) {
      root.innerHTML = '<div class="state">Collection not found.</div>';
      return;
    }
    try {
      const data = await api(`/api/help/collections/${encodeURIComponent(slug)}`);
      const collection = data.collection;
      const groups = data.groups || [];
      const articles = data.articles || [];
      document.title = `${collection.title} - Connektly Help Centre`;
      qs("[data-breadcrumb-current]").textContent = collection.title;
      qs("[data-collection-icon]").textContent = iconText(collection);
      qs("[data-collection-title]").textContent = collection.title;
      qs("[data-collection-description]").textContent = collection.description || "";
      qs("[data-collection-count]").textContent = `${articles.length} articles`;

      const grouped = new Map();
      groups.forEach((group) => grouped.set(group.id, { group, articles: [] }));
      const ungrouped = [];
      articles.forEach((article) => {
        if (article.groupId && grouped.has(article.groupId)) {
          grouped.get(article.groupId).articles.push(article);
        } else {
          ungrouped.push(article);
        }
      });

      const sections = [...grouped.values()].filter((entry) => entry.articles.length);
      if (ungrouped.length) {
        sections.push({ group: { title: "Articles", description: "" }, articles: ungrouped });
      }

      qs("[data-groups]").innerHTML = sections.length
        ? sections
            .map(({ group, articles: groupArticles }) => `
              <section class="group-card">
                <h2>${escapeHtml(group.title)}</h2>
                ${group.description ? `<p>${escapeHtml(group.description)}</p>` : ""}
                <div class="article-list">
                  ${groupArticles
                    .map((article) => `
                      <a class="article-list-item" href="${articleUrl(article.slug)}">
                        <span>
                          <h3>${escapeHtml(article.title)}</h3>
                          <p>${escapeHtml(article.summary)}</p>
                        </span>
                        <span class="chevron">-&gt;</span>
                      </a>
                    `)
                    .join("")}
                </div>
              </section>
            `)
            .join("")
        : '<div class="state">No help articles have been published yet.</div>';
    } catch (error) {
      root.innerHTML = `<div class="state">${escapeHtml(error.message)}</div>`;
    }
  }

  function setMetaDescription(value) {
    let meta = qs('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = value || "Connektly Help Centre article.";
  }

  function bindToc(toc) {
    const panel = qs("[data-toc]");
    if (!panel) return;
    if (!toc || !toc.length) {
      panel.hidden = true;
      return;
    }
    panel.innerHTML = `
      <h2>On this page</h2>
      ${toc.map((item) => `<a href="#${escapeHtml(item.id)}" data-level="${item.level}">${escapeHtml(item.title)}</a>`).join("")}
    `;
    panel.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      event.preventDefault();
      const target = qs(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function initArticle() {
    const root = qs("[data-article-page]");
    if (!root) return;
    bindSearch();
    const slug = getSlug();
    if (!slug) {
      root.innerHTML = '<div class="state">Article not found.</div>';
      return;
    }
    try {
      const data = await api(`/api/help/articles/${encodeURIComponent(slug)}`);
      const article = data.article;
      const collection = data.collection;
      const group = data.group;
      const related = data.relatedArticles || [];
      document.title = `${article.seoTitle || article.title} - Connektly Help Centre`;
      setMetaDescription(article.seoDescription || article.summary);
      qs("[data-article-breadcrumb]").innerHTML = `
        <a href="/help/">All Collections</a>
        ${collection ? `<span>/</span><a href="${collectionUrl(collection.slug)}">${escapeHtml(collection.title)}</a>` : ""}
        <span>/</span><span>${escapeHtml(article.title)}</span>
      `;
      qs("[data-article-title]").textContent = article.title;
      qs("[data-article-summary]").textContent = article.summary || "";
      qs("[data-article-meta]").textContent = [
        article.authorName ? `By ${article.authorName}` : "",
        article.updatedAt ? `Updated ${formatDate(article.updatedAt)}` : "",
        article.readingTime ? `${article.readingTime} min read` : ""
      ].filter(Boolean).join(" · ");
      qs("[data-article-content]").innerHTML = article.contentHtml || "<p>This article is being prepared.</p>";
      bindToc(article.toc);
      qs("[data-related]").innerHTML = related.length
        ? `
          <h2>Related articles</h2>
          <div class="related-grid">
            ${related
              .map((item) => `
                <a class="related-card" href="${articleUrl(item.slug)}">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.summary)}</p>
                </a>
              `)
              .join("")}
          </div>
        `
        : "";
      bindFeedback(slug);
    } catch (error) {
      root.innerHTML = `<div class="state">${escapeHtml(error.message)}</div>`;
    }
  }

  function bindFeedback(slug) {
    qsa("[data-feedback]").forEach((button) => {
      button.addEventListener("click", async () => {
        const status = qs("[data-feedback-status]");
        button.disabled = true;
        if (status) status.textContent = "Sending feedback...";
        try {
          await api(`/api/help/articles/${encodeURIComponent(slug)}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rating: button.dataset.feedback,
              pageUrl: window.location.href,
              referrer: document.referrer,
              userAgent: navigator.userAgent
            })
          });
          if (status) status.textContent = "Thanks for your feedback.";
        } catch (error) {
          if (status) status.textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    void initHome();
    void initCollection();
    void initArticle();
  });
})();
