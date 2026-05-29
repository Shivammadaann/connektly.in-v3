const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const {
  FEEDBACK_RATINGS,
  cleanString,
  prepareArticlePayload,
  prepareCollectionPayload,
  prepareGroupPayload
} = require("./help-utils");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (/^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error("Only jpg, png, webp, and gif images are allowed."));
  }
});

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many feedback submissions. Please try again later." }
});

function handleStoreError(error, res, fallbackMessage) {
  if (error && (error.message === "DUPLICATE_SLUG" || error.code === "23505")) {
    res.status(409).json({ success: false, message: "Slug already exists." });
    return;
  }
  if (error && error.message === "COLLECTION_HAS_CONTENT") {
    res.status(409).json({ success: false, message: "Move or delete groups and articles before deleting this collection." });
    return;
  }
  if (error && error.message === "GROUP_HAS_CONTENT") {
    res.status(409).json({ success: false, message: "Move or delete articles before deleting this group." });
    return;
  }
  console.error(fallbackMessage, error);
  res.status(500).json({ success: false, message: fallbackMessage });
}

function validateCollection(payload) {
  return payload.title && payload.slug;
}

function validateGroup(payload) {
  return payload.collectionId && payload.title && payload.slug;
}

function validateArticle(payload) {
  return payload.title && payload.slug;
}

async function uploadToSupabaseStorage(file) {
  const supabaseUrl = cleanString(process.env.SUPABASE_URL);
  const serviceRoleKey = cleanString(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanString(process.env.SUPABASE_STORAGE_BUCKET) || "help-centre-assets";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured.");
  }

  const safeName = file.originalname.replace(/[^a-z0-9.\-_]/gi, "-").toLowerCase();
  const objectPath = `${Date.now()}-${safeName}`;
  const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${objectPath}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": file.mimetype,
      "x-upsert": "false"
    },
    body: file.buffer
  });

  if (!response.ok) {
    throw new Error(`Supabase upload failed: ${response.status} ${await response.text()}`);
  }

  return {
    fileName: file.originalname,
    fileUrl: `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`,
    mimeType: file.mimetype,
    fileSize: file.size,
    storagePath: objectPath
  };
}

async function deleteFromSupabaseStorage(fileUrl) {
  const supabaseUrl = cleanString(process.env.SUPABASE_URL);
  const serviceRoleKey = cleanString(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanString(process.env.SUPABASE_STORAGE_BUCKET) || "help-centre-assets";

  if (!supabaseUrl || !serviceRoleKey || !fileUrl) {
    return;
  }

  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = fileUrl.indexOf(marker);
  if (index === -1) {
    return;
  }

  const objectPath = decodeURIComponent(fileUrl.slice(index + marker.length));
  if (!objectPath || objectPath.includes("..")) {
    return;
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${encodeURI(objectPath)}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`
    }
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Supabase delete failed: ${response.status} ${await response.text()}`);
  }
}

function createHelpRouter({ helpStore, requireAdmin }) {
  const router = express.Router();

  router.get("/api/help/collections", async (req, res) => {
    try {
      res.json({ success: true, collections: await helpStore.listPublicCollections() });
    } catch (error) {
      handleStoreError(error, res, "Unable to load help collections.");
    }
  });

  router.get("/api/help/collections/:slug", async (req, res) => {
    try {
      const collection = await helpStore.getPublicCollection(req.params.slug);
      if (!collection) {
        res.status(404).json({ success: false, message: "Collection not found." });
        return;
      }
      res.json({ success: true, ...collection });
    } catch (error) {
      handleStoreError(error, res, "Unable to load help collection.");
    }
  });

  router.get("/api/help/articles/:slug", async (req, res) => {
    try {
      const article = await helpStore.getPublicArticle(req.params.slug);
      if (!article) {
        res.status(404).json({ success: false, message: "Article not found." });
        return;
      }
      res.json({ success: true, ...article });
    } catch (error) {
      handleStoreError(error, res, "Unable to load help article.");
    }
  });

  router.get("/api/help/search", async (req, res) => {
    try {
      res.json({ success: true, results: await helpStore.searchPublicArticles(cleanString(req.query.q, 200)) });
    } catch (error) {
      handleStoreError(error, res, "Unable to search help articles.");
    }
  });

  router.post("/api/help/articles/:slug/feedback", feedbackLimiter, async (req, res) => {
    try {
      const rating = cleanString(req.body && req.body.rating);
      if (!FEEDBACK_RATINGS.has(rating)) {
        res.status(400).json({ success: false, message: "Invalid feedback rating." });
        return;
      }
      const feedback = await helpStore.createFeedback(req.params.slug, {
        rating,
        message: cleanString(req.body && req.body.message, 1000),
        pageUrl: cleanString(req.body && req.body.pageUrl, 1000),
        referrer: cleanString(req.body && req.body.referrer, 1000),
        userAgent: cleanString(req.body && req.body.userAgent, 1000) || cleanString(req.get("user-agent"), 1000),
        ipAddress: cleanString(req.ip, 120)
      });
      if (!feedback) {
        res.status(404).json({ success: false, message: "Article not found." });
        return;
      }
      res.status(201).json({ success: true, message: "Thanks for your feedback." });
    } catch (error) {
      handleStoreError(error, res, "Unable to save article feedback.");
    }
  });

  router.use("/api/admin/help", requireAdmin);

  router.get("/api/admin/help/stats", async (req, res) => {
    try {
      res.json({ success: true, stats: await helpStore.stats() });
    } catch (error) {
      handleStoreError(error, res, "Unable to load help stats.");
    }
  });

  router.get("/api/admin/help/collections", async (req, res) => {
    try {
      res.json({ success: true, collections: await helpStore.listCollections() });
    } catch (error) {
      handleStoreError(error, res, "Unable to load collections.");
    }
  });

  router.post("/api/admin/help/collections", async (req, res) => {
    try {
      const payload = prepareCollectionPayload(req.body);
      if (!validateCollection(payload)) {
        res.status(400).json({ success: false, message: "Title and slug are required." });
        return;
      }
      res.status(201).json({ success: true, collection: await helpStore.createCollection(payload) });
    } catch (error) {
      handleStoreError(error, res, "Unable to create collection.");
    }
  });

  router.get("/api/admin/help/collections/:id", async (req, res) => {
    try {
      const collection = await helpStore.getCollection(req.params.id);
      if (!collection) return res.status(404).json({ success: false, message: "Collection not found." });
      res.json({ success: true, collection });
    } catch (error) {
      handleStoreError(error, res, "Unable to load collection.");
    }
  });

  router.patch("/api/admin/help/collections/:id", async (req, res) => {
    try {
      const payload = prepareCollectionPayload(req.body);
      if (!validateCollection(payload)) return res.status(400).json({ success: false, message: "Title and slug are required." });
      const collection = await helpStore.updateCollection(req.params.id, payload);
      if (!collection) return res.status(404).json({ success: false, message: "Collection not found." });
      res.json({ success: true, collection });
    } catch (error) {
      handleStoreError(error, res, "Unable to update collection.");
    }
  });

  router.delete("/api/admin/help/collections/:id", async (req, res) => {
    try {
      await helpStore.deleteCollection(req.params.id);
      res.json({ success: true });
    } catch (error) {
      handleStoreError(error, res, "Unable to delete collection.");
    }
  });

  router.get("/api/admin/help/groups", async (req, res) => {
    try {
      res.json({ success: true, groups: await helpStore.listGroups(cleanString(req.query.collectionId)) });
    } catch (error) {
      handleStoreError(error, res, "Unable to load groups.");
    }
  });

  router.post("/api/admin/help/groups", async (req, res) => {
    try {
      const payload = prepareGroupPayload(req.body);
      if (!validateGroup(payload)) return res.status(400).json({ success: false, message: "Collection, title, and slug are required." });
      res.status(201).json({ success: true, group: await helpStore.createGroup(payload) });
    } catch (error) {
      handleStoreError(error, res, "Unable to create group.");
    }
  });

  router.get("/api/admin/help/groups/:id", async (req, res) => {
    try {
      const group = await helpStore.getGroup(req.params.id);
      if (!group) return res.status(404).json({ success: false, message: "Group not found." });
      res.json({ success: true, group });
    } catch (error) {
      handleStoreError(error, res, "Unable to load group.");
    }
  });

  router.patch("/api/admin/help/groups/:id", async (req, res) => {
    try {
      const payload = prepareGroupPayload(req.body);
      if (!validateGroup(payload)) return res.status(400).json({ success: false, message: "Collection, title, and slug are required." });
      const group = await helpStore.updateGroup(req.params.id, payload);
      if (!group) return res.status(404).json({ success: false, message: "Group not found." });
      res.json({ success: true, group });
    } catch (error) {
      handleStoreError(error, res, "Unable to update group.");
    }
  });

  router.delete("/api/admin/help/groups/:id", async (req, res) => {
    try {
      await helpStore.deleteGroup(req.params.id);
      res.json({ success: true });
    } catch (error) {
      handleStoreError(error, res, "Unable to delete group.");
    }
  });

  router.get("/api/admin/help/articles", async (req, res) => {
    try {
      res.json({
        success: true,
        articles: await helpStore.listArticles({
          search: cleanString(req.query.search),
          collectionId: cleanString(req.query.collectionId),
          groupId: cleanString(req.query.groupId),
          status: cleanString(req.query.status)
        })
      });
    } catch (error) {
      handleStoreError(error, res, "Unable to load articles.");
    }
  });

  router.post("/api/admin/help/articles", async (req, res) => {
    try {
      const payload = prepareArticlePayload(req.body);
      if (!validateArticle(payload)) return res.status(400).json({ success: false, message: "Title and slug are required." });
      res.status(201).json({ success: true, article: await helpStore.createArticle(payload) });
    } catch (error) {
      handleStoreError(error, res, "Unable to create article.");
    }
  });

  router.get("/api/admin/help/articles/:id", async (req, res) => {
    try {
      const article = await helpStore.getArticle(req.params.id);
      if (!article) return res.status(404).json({ success: false, message: "Article not found." });
      res.json({ success: true, article });
    } catch (error) {
      handleStoreError(error, res, "Unable to load article.");
    }
  });

  router.patch("/api/admin/help/articles/:id", async (req, res) => {
    try {
      const payload = prepareArticlePayload(req.body);
      if (!validateArticle(payload)) return res.status(400).json({ success: false, message: "Title and slug are required." });
      const article = await helpStore.updateArticle(req.params.id, payload);
      if (!article) return res.status(404).json({ success: false, message: "Article not found." });
      res.json({ success: true, article });
    } catch (error) {
      handleStoreError(error, res, "Unable to update article.");
    }
  });

  router.delete("/api/admin/help/articles/:id", async (req, res) => {
    try {
      await helpStore.deleteArticle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      handleStoreError(error, res, "Unable to delete article.");
    }
  });

  router.post("/api/admin/help/articles/:id/publish", async (req, res) => {
    try {
      const article = await helpStore.publishArticle(req.params.id);
      if (!article) return res.status(404).json({ success: false, message: "Article not found." });
      res.json({ success: true, article });
    } catch (error) {
      handleStoreError(error, res, "Unable to publish article.");
    }
  });

  router.post("/api/admin/help/articles/:id/unpublish", async (req, res) => {
    try {
      const article = await helpStore.unpublishArticle(req.params.id);
      if (!article) return res.status(404).json({ success: false, message: "Article not found." });
      res.json({ success: true, article });
    } catch (error) {
      handleStoreError(error, res, "Unable to unpublish article.");
    }
  });

  router.post("/api/admin/help/articles/:id/duplicate", async (req, res) => {
    try {
      const article = await helpStore.duplicateArticle(req.params.id);
      if (!article) return res.status(404).json({ success: false, message: "Article not found." });
      res.status(201).json({ success: true, article });
    } catch (error) {
      handleStoreError(error, res, "Unable to duplicate article.");
    }
  });

  router.post("/api/admin/help/media/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "Image file is required." });
      const uploaded = await uploadToSupabaseStorage(req.file);
      const media = await helpStore.createMedia(uploaded);
      res.status(201).json({ success: true, media });
    } catch (error) {
      handleStoreError(error, res, error.message || "Unable to upload media.");
    }
  });

  router.get("/api/admin/help/media", async (req, res) => {
    try {
      res.json({ success: true, media: await helpStore.listMedia() });
    } catch (error) {
      handleStoreError(error, res, "Unable to load media.");
    }
  });

  router.delete("/api/admin/help/media/:id", async (req, res) => {
    try {
      const media = helpStore.getMedia ? await helpStore.getMedia(req.params.id) : null;
      if (media && media.fileUrl) {
        try {
          await deleteFromSupabaseStorage(media.fileUrl);
        } catch (error) {
          console.error("Supabase media delete failed", error);
        }
      }
      await helpStore.deleteMedia(req.params.id);
      res.json({ success: true });
    } catch (error) {
      handleStoreError(error, res, "Unable to delete media.");
    }
  });

  router.get("/api/admin/help/feedback", async (req, res) => {
    try {
      res.json({ success: true, feedback: await helpStore.listFeedback() });
    } catch (error) {
      handleStoreError(error, res, "Unable to load feedback.");
    }
  });

  return router;
}

module.exports = { createHelpRouter };
