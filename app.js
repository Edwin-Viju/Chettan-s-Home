/* ==========================================================================
   CHETTAN'S MEMORY HOUSE — MAIN APPLICATION LOGIC (VERCEL READY)
   High-Memory Binary Storage Engine (IndexedDB) + Video & Audio Notes
   ========================================================================== */

// HIGH-MEMORY BINARY STORAGE ENGINE (IndexedDB)
// Bypasses the 5MB localStorage limit to allow uploading high-memory 4K photos,
// full-length HD/4K video clips, and uncompressed WAV/FLAC audio files safely to disk.
const HighMemoryDB = {
  dbName: "ChettanMemoryHouseDB_v3",
  version: 1,
  db: null,
  objectUrlCache: new Map(),

  async open() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("media_blobs")) {
          db.createObjectStore("media_blobs", { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => {
        console.error("IndexedDB error:", e);
        reject(e);
      };
    });
  },

  async saveMediaBlob(id, fileOrBlob, metadata = {}) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("media_blobs", "readwrite");
      const store = tx.objectStore("media_blobs");
      const record = {
        id,
        blob: fileOrBlob,
        name: metadata.name || fileOrBlob.name || "media",
        type: metadata.type || fileOrBlob.type || "application/octet-stream",
        size: fileOrBlob.size || 0,
        thumbnail: metadata.thumbnail || null,
        createdAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  },

  async getMediaBlob(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("media_blobs", "readonly");
      const store = tx.objectStore("media_blobs");
      const req = store.get(id);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e);
    });
  },

  async deleteMediaBlob(id) {
    const db = await this.open();
    if (this.objectUrlCache.has(id)) {
      URL.revokeObjectURL(this.objectUrlCache.get(id));
      this.objectUrlCache.delete(id);
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("media_blobs", "readwrite");
      const store = tx.objectStore("media_blobs");
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e);
    });
  },

  async getMediaUrl(mediaItem) {
    if (!mediaItem) return "";
    if (typeof mediaItem === "string") return mediaItem;
    if (mediaItem.blobId) {
      if (this.objectUrlCache.has(mediaItem.blobId)) {
        return this.objectUrlCache.get(mediaItem.blobId);
      }
      try {
        const record = await this.getMediaBlob(mediaItem.blobId);
        if (record && record.blob) {
          const url = URL.createObjectURL(record.blob);
          this.objectUrlCache.set(mediaItem.blobId, url);
          return url;
        }
      } catch (err) {
        console.warn("Failed loading blob from DB:", err);
      }
    }
    return mediaItem.url || mediaItem.thumbnail || "";
  },

  generateVideoThumbnail(videoBlobOrFile) {
    return new Promise((resolve) => {
      const tempUrl = URL.createObjectURL(videoBlobOrFile);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = tempUrl;
      video.muted = true;
      video.playsInline = true;

      let resolved = false;
      const finish = (result) => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(tempUrl);
          resolve(result);
        }
      };

      setTimeout(() => {
        finish("https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80");
      }, 3500);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const maxW = 480;
          const scale = video.videoWidth > 0 ? Math.min(1, maxW / video.videoWidth) : 1;
          canvas.width = (video.videoWidth || 480) * scale;
          canvas.height = (video.videoHeight || 270) * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          finish(dataUrl);
        } catch (e) {
          finish("https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80");
        }
      };

      video.onerror = () => {
        finish("https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80");
      };
    });
  },

  generateImageThumbnail(imageFile, maxWidth = 480) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(imageFile);
    });
  },

  formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
};

// INITIAL SEED MEMORIES (Supports Photos & Videos)
const INITIAL_MEMORIES = [
  {
    id: "mem-1",
    title: "Onam at Home",
    date: "2025-09-05",
    displayDate: "September 2025",
    locationName: "Our Home, Kerala",
    category: "🌼 Festivals",
    story: "Last Onam together before Chettan left for Sharjah! Everyone was getting ready for the pookkalam and somehow you were the one who woke up late again 😂. Mum made full Sadhya with your favourite palada payasam. Saving the biggest banana leaf for when you come home next!",
    coverImage: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1000&q=80"
    ],
    videos: [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    ],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1000&q=80", name: "Pookkalam at Home" },
      { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", poster: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1000&q=80", name: "Onam Celebration Clip" },
      { type: "image", url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1000&q=80", name: "Sadhya Preparations" },
      { type: "image", url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1000&q=80", name: "Backyard Flowers" }
    ],
    createdAt: "2025-09-05T10:00:00.000Z"
  },
  {
    id: "mem-2",
    title: "Cousins' Evening at the Riverbed",
    date: "2024-08-15",
    displayDate: "August 15, 2024",
    locationName: "Aluva Riverbed, Kerala",
    category: "👥 Cousins & Friends",
    story: "No one planned this evening photo. We went out for black tea and ended up sitting near the river for 3 hours talking about everything and nothing. Chettan kept cracking jokes about dad's driving. That's probably why this is one of my all-time favourite photos.",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80"
    ],
    videos: [],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80", name: "Riverbed Sunset" },
      { type: "image", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80", name: "Tea stall laughs" }
    ],
    createdAt: "2024-08-15T16:30:00.000Z"
  },
  {
    id: "mem-3",
    title: "Wayanad Tea Estate Trip",
    date: "2024-11-20",
    displayDate: "November 2024",
    locationName: "Wayanad Hills, Kerala",
    category: "✈️ Trips",
    story: "Remember when dad forgot the car keys at the small roadside tea shop after drinking hot kattan chaya? Chettan had to walk 2 km back uphill to fetch them! The misty views at the top made the whole struggle worth it though.",
    coverImage: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
    ],
    videos: [],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80", name: "Misty Tea Estates" },
      { type: "image", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80", name: "Mountain View" }
    ],
    createdAt: "2024-11-20T12:00:00.000Z"
  },
  {
    id: "mem-4",
    title: "Rainy Morning Coffee on the Verandah",
    date: "2025-06-10",
    displayDate: "June 2025",
    locationName: "Verandah at Home",
    category: "🏠 Home",
    story: "Heavy monsoon rain hitting the tiled roof of our home. We sat on the verandah bench drinking hot cardamom tea. These quiet ordinary mornings are what we miss the most right now. Saving a cup for you when you visit from Sharjah, Chetta!",
    coverImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
    ],
    videos: [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    ],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80", name: "Rainy Verandah" },
      { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", poster: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80", name: "Monsoon Rain Video" }
    ],
    createdAt: "2025-06-10T08:15:00.000Z"
  },
  {
    id: "mem-5",
    title: "Chettan's Sharjah Sendoff Dinner",
    date: "2025-10-02",
    displayDate: "October 2025",
    locationName: "Kochi International Airport",
    category: "⭐ Special Moments",
    story: "The night before your flight to Sharjah. The whole family came along to the airport. Everyone was trying so hard to act funny and cheerful so no one would start crying. You looked so handsome and brave. We are all so proud of you, Chetta ❤️",
    coverImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80"
    ],
    videos: [],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80", name: "Sendoff dinner" },
      { type: "image", url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80", name: "Kochi Departure Gate" }
    ],
    createdAt: "2025-10-02T21:00:00.000Z"
  },
  {
    id: "mem-6",
    title: "Random Sunday Football Match",
    date: "2024-02-18",
    displayDate: "February 2024",
    locationName: "St. Joseph's School Ground",
    category: "😂 Funny Memories",
    story: "That muddy Sunday match in the rain! Chettan slipped twice trying to shoot, but somehow scored the equalizer in the final minute. We celebrated like we won the World Cup and went straight to get hot beef fry and porotta after!",
    coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80"
    ],
    videos: [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
    ],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80", name: "Muddy match ground" },
      { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4", poster: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80", name: "Winning Goal Video" }
    ],
    createdAt: "2024-02-18T17:00:00.000Z"
  }
];

// INITIAL SEED VIDEO NOTES
const INITIAL_VIDEO_NOTES = [
  {
    id: "vn-video-1",
    title: "Monsoon Rain on the Verandah Roof",
    sender: "🌧️ Verandah at Home",
    location: "Verandah at Home, Kerala",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    story: "Heavy showers drumming against our terracotta roof tiles. Remember sitting here with hot cardamom tea waiting for the rain to slow down? Missing you Chetta ❤️",
    createdAt: "2025-08-10T14:30:00.000Z"
  },
  {
    id: "vn-video-2",
    title: "Family Evening Greeting for Chettan",
    sender: "❤️ Amma & Achan",
    location: "Living Room at Home",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    story: "Mum says: Chetta, don't skip your evening snack after your Sharjah shift! We are all praying for you.",
    createdAt: "2025-08-20T18:00:00.000Z"
  },
  {
    id: "vn-video-3",
    title: "Backyard Coconut Palms in the Breeze",
    sender: "🌴 Home Backyard",
    location: "Behind the Kitchen, Kerala",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    story: "Golden hour breeze swaying through the coconut trees behind the kitchen. So quiet and peaceful here.",
    createdAt: "2025-09-01T17:45:00.000Z"
  }
];

// INITIAL SEED VOICE NOTES
const INITIAL_VOICE_NOTES = [
  {
    id: "vn-1",
    title: "Mum's Message after work",
    sender: "❤️ Amma (Mum)",
    icon: "👵",
    audioUrl: "https://actions.google.com/sounds/v1/human/applause_moderate.ogg"
  },
  {
    id: "vn-2",
    title: "Monsoon Rain on the Roof",
    sender: "🌧️ Verandah at Home",
    icon: "🌧️",
    audioUrl: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg"
  },
  {
    id: "vn-3",
    title: "Evening Tea Call from Brother",
    sender: "☕ Brother",
    icon: "👦",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg"
  }
];

const DEFAULT_CATEGORIES = [
  "All",
  "❤️ Family",
  "👥 Cousins & Friends",
  "🌼 Festivals",
  "✈️ Trips",
  "🏠 Home",
  "🎓 School & College",
  "☕ Everyday Moments",
  "😂 Funny Memories",
  "⭐ Special Moments"
];

const DEFAULT_SITE_TEXTS = {
  brandTitle: "Chettan's Memory House",
  heroTitle: "Chettan’s Memory House",
  heroSubtitle: "“A little piece of home, wherever you are.”",
  heroDescription: "Welcome back, Chetta ❤️! Explore the people, places, and everyday moments from home whenever you miss Kerala after work.",
  footerQuote: "“Even though you're far away, you can still walk through the memories of home.”",
  footerLove: "Made with love, from home in Kerala to Sharjah for my Chettan ❤️"
};

// STATE MANAGEMENT
let memories = [];
let voiceNotes = [];
let videoNotes = [];
let categories = [];
let siteTexts = {};
let activeCategory = "All";
let searchQuery = "";
let isAdminMode = false;
let uploadedFormMedia = []; // High-memory media: images & videos
let currentAudioItem = null;
let currentVideoItem = null;
let lastBoredMemoryId = null;
let activeDetailMediaIndex = 0;
let currentDetailMediaList = [];

// SLIDESHOW STATE
let slideshowIndex = 0;
let slideshowTimer = null;
let isSlideshowPlaying = false;

// INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await HighMemoryDB.open();
  } catch (err) {
    console.warn("HighMemoryDB IndexedDB initialization fallback:", err);
  }

  initStorage();
  checkAuthStatus();
  applySiteTexts();
  startDualClock();
  renderCategoryPills();
  renderCategorySelectOptions();
  renderVoiceNotes();
  renderVideoNotes();
  renderMemories();
  checkOnThisDay();
  updateStorageStats();

  if (window.lucide) lucide.createIcons();
});

// FEATURE: SITE TEXT CUSTOMIZATION IN ADMIN MODE
function applySiteTexts() {
  const bTitle = document.getElementById("site-brand-title");
  const hTitle = document.getElementById("site-hero-title");
  const hSub = document.getElementById("site-hero-subtitle");
  const hDesc = document.getElementById("site-hero-description");
  const fQuote = document.getElementById("site-footer-quote");
  const fLove = document.getElementById("site-footer-love");

  if (bTitle) bTitle.textContent = siteTexts.brandTitle || DEFAULT_SITE_TEXTS.brandTitle;
  if (hTitle) hTitle.textContent = siteTexts.heroTitle || DEFAULT_SITE_TEXTS.heroTitle;
  if (hSub) hSub.textContent = siteTexts.heroSubtitle || DEFAULT_SITE_TEXTS.heroSubtitle;
  if (hDesc) hDesc.textContent = siteTexts.heroDescription || DEFAULT_SITE_TEXTS.heroDescription;
  if (fQuote) fQuote.textContent = siteTexts.footerQuote || DEFAULT_SITE_TEXTS.footerQuote;
  if (fLove) fLove.textContent = siteTexts.footerLove || DEFAULT_SITE_TEXTS.footerLove;
}

function openEditSiteTextModal() {
  document.getElementById("edit-brand-title").value = siteTexts.brandTitle || DEFAULT_SITE_TEXTS.brandTitle;
  document.getElementById("edit-hero-title").value = siteTexts.heroTitle || DEFAULT_SITE_TEXTS.heroTitle;
  document.getElementById("edit-hero-subtitle").value = siteTexts.heroSubtitle || DEFAULT_SITE_TEXTS.heroSubtitle;
  document.getElementById("edit-hero-description").value = siteTexts.heroDescription || DEFAULT_SITE_TEXTS.heroDescription;
  document.getElementById("edit-footer-quote").value = siteTexts.footerQuote || DEFAULT_SITE_TEXTS.footerQuote;
  document.getElementById("edit-footer-love").value = siteTexts.footerLove || DEFAULT_SITE_TEXTS.footerLove;

  document.getElementById("edit-site-text-modal").classList.add("active");
}

function closeEditSiteTextModal() {
  document.getElementById("edit-site-text-modal").classList.remove("active");
}

function saveSiteTexts(event) {
  event.preventDefault();
  siteTexts = {
    brandTitle: document.getElementById("edit-brand-title").value.trim(),
    heroTitle: document.getElementById("edit-hero-title").value.trim(),
    heroSubtitle: document.getElementById("edit-hero-subtitle").value.trim(),
    heroDescription: document.getElementById("edit-hero-description").value.trim(),
    footerQuote: document.getElementById("edit-footer-quote").value.trim(),
    footerLove: document.getElementById("edit-footer-love").value.trim()
  };

  localStorage.setItem("godwin_site_texts", JSON.stringify(siteTexts));
  applySiteTexts();
  closeEditSiteTextModal();
  alert("✨ Site texts updated successfully!");
}

// LIVE DUAL CLOCK ENGINE
function startDualClock() {
  function updateClocks() {
    const now = new Date();

    const keralaTimeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(now);

    const sharjahTimeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dubai",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(now);

    const kEl = document.getElementById("kerala-time");
    const sEl = document.getElementById("sharjah-time");

    if (kEl) kEl.textContent = keralaTimeStr;
    if (sEl) sEl.textContent = sharjahTimeStr;
  }

  updateClocks();
  setInterval(updateClocks, 1000);
}

// LOCAL STORAGE PERSISTENCE
function initStorage() {
  const storedM = localStorage.getItem("godwin_memories");
  if (!storedM) {
    memories = INITIAL_MEMORIES;
    localStorage.setItem("godwin_memories", JSON.stringify(memories));
  } else {
    try { memories = JSON.parse(storedM); } catch (e) { memories = INITIAL_MEMORIES; }
  }

  const storedVN = localStorage.getItem("godwin_voice_notes");
  if (!storedVN) {
    voiceNotes = INITIAL_VOICE_NOTES;
    localStorage.setItem("godwin_voice_notes", JSON.stringify(voiceNotes));
  } else {
    try { voiceNotes = JSON.parse(storedVN); } catch (e) { voiceNotes = INITIAL_VOICE_NOTES; }
  }

  const storedVideoNotes = localStorage.getItem("godwin_video_notes");
  if (!storedVideoNotes) {
    videoNotes = INITIAL_VIDEO_NOTES;
    localStorage.setItem("godwin_video_notes", JSON.stringify(videoNotes));
  } else {
    try { videoNotes = JSON.parse(storedVideoNotes); } catch (e) { videoNotes = INITIAL_VIDEO_NOTES; }
  }

  const storedCat = localStorage.getItem("godwin_categories");
  if (!storedCat) {
    categories = DEFAULT_CATEGORIES;
    localStorage.setItem("godwin_categories", JSON.stringify(categories));
  } else {
    try { categories = JSON.parse(storedCat); } catch (e) { categories = DEFAULT_CATEGORIES; }
  }

  const storedST = localStorage.getItem("godwin_site_texts");
  if (!storedST) {
    siteTexts = DEFAULT_SITE_TEXTS;
    localStorage.setItem("godwin_site_texts", JSON.stringify(siteTexts));
  } else {
    try { siteTexts = JSON.parse(storedST); } catch (e) { siteTexts = DEFAULT_SITE_TEXTS; }
  }
}

function saveMemoriesToStorage() {
  localStorage.setItem("godwin_memories", JSON.stringify(memories));
  updateStorageStats();
}

function saveCategoriesToStorage() {
  localStorage.setItem("godwin_categories", JSON.stringify(categories));
}

function saveVoiceNotesToStorage() {
  localStorage.setItem("godwin_voice_notes", JSON.stringify(voiceNotes));
  updateStorageStats();
}

function saveVideoNotesToStorage() {
  localStorage.setItem("godwin_video_notes", JSON.stringify(videoNotes));
  updateStorageStats();
}

async function updateStorageStats() {
  const tag = document.getElementById("storage-status-tag");
  if (!tag) return;
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usedMb = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
      tag.textContent = `💾 High-Memory Store: ${usedMb} MB used`;
    } catch (e) {
      tag.textContent = `💾 High-Memory Store Active`;
    }
  }
}

// AUTHENTICATION
function checkAuthStatus() {
  const isUnlocked = localStorage.getItem("godwin_unlocked");
  const authModal = document.getElementById("auth-modal");
  const appShell = document.getElementById("app-shell");

  if (isUnlocked === "true") {
    authModal.classList.remove("active");
    appShell.classList.remove("hidden");
  } else {
    authModal.classList.add("active");
    appShell.classList.add("hidden");
  }
}

function handleAuth(event) {
  event.preventDefault();
  const input = document.getElementById("auth-passcode").value.trim().toLowerCase();
  
  if (input === "godwin" || input === "chettan" || input === "home" || input === "1234") {
    localStorage.setItem("godwin_unlocked", "true");
    checkAuthStatus();
  } else {
    alert("Incorrect passcode! Try typing 'chettan' or 'godwin'");
  }
}

function toggleAdminMode() {
  isAdminMode = !isAdminMode;
  const adminIndicator = document.getElementById("admin-indicator");
  const adminBtn = document.getElementById("admin-toggle-btn");
  const editSiteBtn = document.getElementById("edit-site-text-btn");

  if (isAdminMode) {
    adminIndicator.classList.remove("hidden");
    if (editSiteBtn) editSiteBtn.classList.remove("hidden");
    adminBtn.style.backgroundColor = "var(--gold-primary)";
    alert("🔧 Admin mode unlocked! You can now edit site texts, memories, and delete video & audio notes.");
  } else {
    adminIndicator.classList.add("hidden");
    if (editSiteBtn) editSiteBtn.classList.add("hidden");
    adminBtn.style.backgroundColor = "transparent";
  }

  renderVoiceNotes();
  renderVideoNotes();
  renderMemories();
}

// CATEGORIES & CUSTOM CATEGORY CREATOR
function renderCategoryPills() {
  const container = document.getElementById("category-pills-container");
  container.innerHTML = categories.map(cat => `
    <button class="pill-btn ${cat === activeCategory ? 'active' : ''}" onclick="selectCategory('${cat}')">
      ${cat}
    </button>
  `).join("");
}

function renderCategorySelectOptions() {
  const select = document.getElementById("form-category");
  if (!select) return;
  select.innerHTML = categories.filter(c => c !== "All").map(c => `
    <option value="${c}">${c}</option>
  `).join("");
}

function selectCategory(cat) {
  activeCategory = cat;
  renderCategoryPills();
  renderMemories();
}

function openAddCategoryModal() {
  document.getElementById("add-category-modal").classList.add("active");
}

function closeAddCategoryModal() {
  document.getElementById("add-category-modal").classList.remove("active");
}

function saveCustomCategory(event) {
  event.preventDefault();
  const val = document.getElementById("new-cat-name").value.trim();
  if (val && !categories.includes(val)) {
    categories.push(val);
    saveCategoriesToStorage();
    renderCategoryPills();
    renderCategorySelectOptions();
    closeAddCategoryModal();
    document.getElementById("new-cat-name").value = "";
    alert(`Category "${val}" added successfully!`);
  }
}

// VOICE NOTES RENDER & DELETE FEATURE (High-Memory Binary Audio Enabled)
async function renderVoiceNotes() {
  const container = document.getElementById("voice-notes-grid");
  if (!container) return;

  if (voiceNotes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:20px; color:var(--text-muted);">
        No voice notes added yet. Tap <strong>＋ Add Voice Note</strong> to upload one!
      </div>
    `;
    return;
  }

  const cardsHtml = await Promise.all(voiceNotes.map(async (vn) => {
    const audioSrc = vn.blobId ? await HighMemoryDB.getMediaUrl(vn) : (vn.audioUrl || "");
    return `
      <div class="voice-card">
        <div class="voice-card-header flex-between">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="voice-icon-circle">${vn.icon || '🎙️'}</div>
            <div>
              <h4 class="voice-card-title">${vn.title}</h4>
              <span class="voice-card-sender">${vn.sender}</span>
            </div>
          </div>
          ${isAdminMode ? `
            <button class="delete-voice-btn" onclick="deleteVoiceNote('${vn.id}')" title="Delete Voice Note">
              🗑️
            </button>
          ` : ''}
        </div>
        <audio controls src="${audioSrc}"></audio>
      </div>
    `;
  }));

  container.innerHTML = cardsHtml.join("");
}

async function deleteVoiceNote(id) {
  if (confirm("Are you sure you want to delete this voice message?")) {
    const note = voiceNotes.find(v => v.id === id);
    if (note && note.blobId) {
      await HighMemoryDB.deleteMediaBlob(note.blobId);
    }
    voiceNotes = voiceNotes.filter(v => v.id !== id);
    saveVoiceNotesToStorage();
    renderVoiceNotes();
  }
}

function openAddVoiceNoteModal() {
  currentAudioItem = null;
  const badge = document.getElementById("voice-file-badge");
  if (badge) {
    badge.classList.add("hidden");
    badge.textContent = "";
  }
  document.getElementById("add-voice-modal").classList.add("active");
}

function closeAddVoiceNoteModal() {
  document.getElementById("add-voice-modal").classList.remove("active");
}

async function handleAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const spinner = document.getElementById("voice-upload-processing");
  const badge = document.getElementById("voice-file-badge");
  if (spinner) spinner.classList.remove("hidden");

  try {
    const blobId = "audio-" + Date.now();
    const sizeStr = HighMemoryDB.formatBytes(file.size);
    await HighMemoryDB.saveMediaBlob(blobId, file, { name: file.name, type: file.type });

    currentAudioItem = {
      blobId,
      name: file.name,
      size: file.size,
      sizeStr,
      type: "audio"
    };

    if (badge) {
      badge.textContent = `🎵 ${file.name} (${sizeStr}) Ready`;
      badge.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Failed saving audio blob:", err);
    alert("Could not process audio file. Please try another file.");
  } finally {
    if (spinner) spinner.classList.add("hidden");
  }
}

function applyVoicePreset(val) {
  const badge = document.getElementById("voice-file-badge");
  if (badge) badge.classList.add("hidden");

  if (val === "mum") {
    currentAudioItem = {
      audioUrl: "https://actions.google.com/sounds/v1/human/applause_moderate.ogg",
      name: "Mum's Voice"
    };
    document.getElementById("voice-title").value = "Mum's Voice: Eat well after work!";
  } else if (val === "rain") {
    currentAudioItem = {
      audioUrl: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
      name: "Monsoon Rain"
    };
    document.getElementById("voice-title").value = "Monsoon Rain on the Roof";
  } else if (val === "brother") {
    currentAudioItem = {
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      name: "Brother's Call"
    };
    document.getElementById("voice-title").value = "Brother's Kattan Tea Message";
  }
}

async function saveVoiceNote(e) {
  e.preventDefault();
  const title = document.getElementById("voice-title").value.trim();
  if (!title || !currentAudioItem) {
    alert("Please upload an audio file or select a demo sound!");
    return;
  }

  const newVn = {
    id: "vn-" + Date.now(),
    title,
    sender: "❤️ Family Message",
    icon: "🎙️",
    blobId: currentAudioItem.blobId || null,
    audioUrl: currentAudioItem.audioUrl || null
  };

  voiceNotes.unshift(newVn);
  saveVoiceNotesToStorage();
  await renderVoiceNotes();
  closeAddVoiceNoteModal();
  currentAudioItem = null;
  alert("Voice note added successfully!");
}

// VIDEO NOTES ENGINE (High-Memory Binary Video Enabled)
async function renderVideoNotes() {
  const container = document.getElementById("video-notes-grid");
  if (!container) return;

  if (videoNotes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:28px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-strong);">
        <p style="font-size:1rem; margin-bottom:6px;">No video notes added yet.</p>
        <span style="font-size:0.85rem;">Tap <strong>＋ Add Video Note</strong> to upload family videos, rainy verandah clips, or video greetings!</span>
      </div>
    `;
    return;
  }

  const cardsHtml = await Promise.all(videoNotes.map(async (vn) => {
    const videoSrc = vn.blobId ? await HighMemoryDB.getMediaUrl(vn) : (vn.videoUrl || "");
    const posterSrc = vn.poster || "";

    return `
      <div class="video-card">
        <div class="video-card-player-container">
          <video controls playsinline preload="metadata" poster="${posterSrc}" src="${videoSrc}"></video>
        </div>
        <div class="video-card-body">
          <div class="video-card-header">
            <div>
              <h4 class="video-card-title">${vn.title}</h4>
              <div class="video-card-meta">
                <span class="video-card-sender-tag">${vn.sender || '❤️ Family'}</span>
                <span>•</span>
                <span>📍 ${vn.location || 'Home, Kerala'}</span>
              </div>
            </div>
            ${isAdminMode ? `
              <button class="delete-video-btn" onclick="deleteVideoNote('${vn.id}')" title="Delete Video Note">
                🗑️
              </button>
            ` : ''}
          </div>
          ${vn.story ? `<p class="video-card-story">${vn.story}</p>` : ''}
        </div>
      </div>
    `;
  }));

  container.innerHTML = cardsHtml.join("");
}

function openAddVideoNoteModal() {
  currentVideoItem = null;
  const previewWrapper = document.getElementById("video-preview-wrapper");
  const previewPlayer = document.getElementById("video-preview-player");
  const badge = document.getElementById("video-file-badge");

  if (previewPlayer) {
    previewPlayer.pause();
    previewPlayer.src = "";
  }
  if (previewWrapper) previewWrapper.classList.add("hidden");
  if (badge) {
    badge.classList.add("hidden");
    badge.textContent = "";
  }

  const titleInput = document.getElementById("video-title");
  if (titleInput) titleInput.value = "";
  const storyInput = document.getElementById("video-story");
  if (storyInput) storyInput.value = "";

  document.getElementById("add-video-modal").classList.add("active");
}

function closeAddVideoNoteModal() {
  const previewPlayer = document.getElementById("video-preview-player");
  if (previewPlayer) {
    previewPlayer.pause();
    previewPlayer.src = "";
  }
  document.getElementById("add-video-modal").classList.remove("active");
}

async function handleVideoNoteUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const spinner = document.getElementById("video-upload-processing");
  const badge = document.getElementById("video-file-badge");
  const previewWrapper = document.getElementById("video-preview-wrapper");
  const previewPlayer = document.getElementById("video-preview-player");

  if (spinner) spinner.classList.remove("hidden");

  try {
    const blobId = "video-" + Date.now();
    const sizeStr = HighMemoryDB.formatBytes(file.size);

    // Generate lightweight thumbnail
    const thumbnail = await HighMemoryDB.generateVideoThumbnail(file);

    // Save binary blob directly to disk store
    await HighMemoryDB.saveMediaBlob(blobId, file, {
      name: file.name,
      type: file.type,
      thumbnail
    });

    currentVideoItem = {
      blobId,
      name: file.name,
      size: file.size,
      sizeStr,
      thumbnail,
      type: "video"
    };

    if (badge) {
      badge.textContent = `📹 ${file.name} (${sizeStr}) Ready`;
      badge.classList.remove("hidden");
    }

    if (previewPlayer && previewWrapper) {
      previewPlayer.src = URL.createObjectURL(file);
      previewWrapper.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Error processing video file:", err);
    alert("Could not process video file. Please check file format.");
  } finally {
    if (spinner) spinner.classList.add("hidden");
  }
}

function applyVideoPreset(val) {
  const previewWrapper = document.getElementById("video-preview-wrapper");
  const previewPlayer = document.getElementById("video-preview-player");
  const badge = document.getElementById("video-file-badge");
  if (badge) badge.classList.add("hidden");

  let videoUrl = "";
  let poster = "";
  let title = "";

  if (val === "rain") {
    videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    poster = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80";
    title = "Monsoon Rain on the Verandah Roof";
    document.getElementById("video-sender").value = "🌧️ Home Verandah";
    document.getElementById("video-location").value = "Our Home, Kerala";
    document.getElementById("video-story").value = "Heavy showers drumming on terracotta roof tiles. Missing you Chetta!";
  } else if (val === "family") {
    videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    poster = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80";
    title = "Family Evening Greeting for Chettan";
    document.getElementById("video-sender").value = "❤️ Amma & Achan";
    document.getElementById("video-location").value = "Living Room at Home";
    document.getElementById("video-story").value = "Eat well after your shift Chetta! Sending blessings and hugs from Kerala.";
  } else if (val === "sunset") {
    videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    poster = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
    title = "Golden Sunset Breeze through Backyard Palms";
    document.getElementById("video-sender").value = "🌴 Backyard Trees";
    document.getElementById("video-location").value = "Behind the Kitchen, Kerala";
    document.getElementById("video-story").value = "Peaceful evening breeze through the coconut palms.";
  }

  if (videoUrl) {
    currentVideoItem = {
      videoUrl,
      poster,
      name: title,
      type: "video"
    };
    document.getElementById("video-title").value = title;
    if (previewPlayer && previewWrapper) {
      previewPlayer.src = videoUrl;
      previewPlayer.poster = poster;
      previewWrapper.classList.remove("hidden");
    }
  }
}

async function saveVideoNote(e) {
  e.preventDefault();
  const title = document.getElementById("video-title").value.trim();
  const sender = document.getElementById("video-sender").value.trim() || "❤️ Family";
  const location = document.getElementById("video-location").value.trim() || "Home, Kerala";
  const story = document.getElementById("video-story").value.trim();

  if (!title || !currentVideoItem) {
    alert("Please upload a video file or select a Kerala video preset!");
    return;
  }

  const newVn = {
    id: "vn-video-" + Date.now(),
    title,
    sender,
    location,
    story,
    blobId: currentVideoItem.blobId || null,
    videoUrl: currentVideoItem.videoUrl || null,
    poster: currentVideoItem.thumbnail || currentVideoItem.poster || "",
    createdAt: new Date().toISOString()
  };

  videoNotes.unshift(newVn);
  saveVideoNotesToStorage();
  await renderVideoNotes();
  closeAddVideoNoteModal();
  currentVideoItem = null;
  alert("🎥 Video note saved successfully for Chettan!");
}

async function deleteVideoNote(id) {
  if (confirm("Are you sure you want to delete this video note?")) {
    const vn = videoNotes.find(v => v.id === id);
    if (vn && vn.blobId) {
      await HighMemoryDB.deleteMediaBlob(vn.blobId);
    }
    videoNotes = videoNotes.filter(v => v.id !== id);
    saveVideoNotesToStorage();
    renderVideoNotes();
  }
}

// SEARCH
function handleSearch() {
  searchQuery = document.getElementById("search-input").value.toLowerCase();
  const clearBtn = document.getElementById("clear-search");
  if (searchQuery.length > 0) clearBtn.classList.remove("hidden");
  else clearBtn.classList.add("hidden");
  renderMemories();
}

function clearSearch() {
  document.getElementById("search-input").value = "";
  handleSearch();
}

function resetFilters() {
  activeCategory = "All";
  searchQuery = "";
  document.getElementById("search-input").value = "";
  document.getElementById("clear-search").classList.add("hidden");
  renderCategoryPills();
  renderMemories();
}

function getFilteredMemories() {
  return memories.filter(mem => {
    const matchesCategory = activeCategory === "All" || mem.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      mem.title.toLowerCase().includes(searchQuery) ||
      mem.story.toLowerCase().includes(searchQuery) ||
      (mem.locationName && mem.locationName.toLowerCase().includes(searchQuery)) ||
      mem.category.toLowerCase().includes(searchQuery);

    return matchesCategory && matchesSearch;
  });
}

// RENDER MEMORIES GRID (Supports Photos & Videos)
function renderMemories() {
  const container = document.getElementById("memories-grid");
  const emptyState = document.getElementById("empty-state");
  const countBadge = document.getElementById("memory-count-badge");

  const filtered = getFilteredMemories();
  countBadge.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'memory' : 'memories'}`;

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");

    container.innerHTML = filtered.map(mem => {
      // Calculate photos and videos counts
      const mediaList = mem.media || [];
      const videoCount = (mem.videos ? mem.videos.length : 0) + mediaList.filter(m => m.type === "video").length;
      const photoCount = (mem.images ? mem.images.length : 0) + mediaList.filter(m => m.type === "image").length;
      const hasVideo = videoCount > 0;

      let countText = "";
      if (hasVideo && photoCount > 0) {
        countText = `<i data-lucide="camera"></i> ${photoCount} • <i data-lucide="video"></i> ${videoCount}`;
      } else if (hasVideo) {
        countText = `<i data-lucide="video"></i> ${videoCount} ${videoCount === 1 ? 'Video' : 'Videos'}`;
      } else if (photoCount > 1) {
        countText = `<i data-lucide="image"></i> ${photoCount}`;
      }

      // Pick cover thumbnail
      let coverSrc = mem.coverImage || "";
      if (!coverSrc && mediaList.length > 0) {
        coverSrc = mediaList[0].thumbnail || mediaList[0].poster || mediaList[0].url || "";
      }
      if (!coverSrc && mem.images && mem.images.length > 0) {
        coverSrc = mem.images[0];
      }

      return `
        <div class="memory-card" onclick="openMemoryDetail('${mem.id}')">
          ${isAdminMode ? `
            <div class="admin-card-actions" onclick="event.stopPropagation()">
              <button class="admin-card-btn edit" onclick="editMemory('${mem.id}')" title="Edit">✏️</button>
              <button class="admin-card-btn delete" onclick="deleteMemory('${mem.id}')" title="Delete">🗑️</button>
            </div>
          ` : ''}

          <div class="card-img-wrapper">
            <img src="${coverSrc}" class="card-img" alt="${mem.title}" loading="lazy">
            <span class="card-category-tag">${mem.category}</span>
            ${countText ? `
              <span class="card-media-count">
                ${countText}
              </span>
            ` : ''}
            ${hasVideo ? `
              <div class="card-video-play-hint" title="Contains Video">
                ▶
              </div>
            ` : ''}
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span>📍 ${mem.locationName || 'Kerala'}</span>
              <span>•</span>
              <span>📅 ${mem.displayDate || mem.date || 'Sometime back'}</span>
            </div>

            <h3 class="card-title serif-title">${mem.title}</h3>
            <p class="card-snippet">${mem.story}</p>

            <div class="card-footer">
              <span>${hasVideo ? 'Watch Video & Photos' : 'Read Story & Photos'}</span>
              <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();
  }
}

// "ON THIS DAY" FEATURE
function checkOnThisDay() {
  const container = document.getElementById("on-this-day-container");
  const section = document.getElementById("on-this-day-section");

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDate = today.getDate();

  const matches = memories.filter(mem => {
    if (!mem.date) return false;
    const parts = mem.date.split("-");
    if (parts.length < 3) return false;
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return m === currentMonth && d === currentDate;
  });

  if (matches.length === 0) {
    section.classList.add("hidden");
  } else {
    section.classList.remove("hidden");
    container.innerHTML = matches.map(mem => {
      const year = mem.date.split("-")[0];
      const yearsAgo = today.getFullYear() - parseInt(year, 10);
      const yearText = yearsAgo > 0 ? `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago today...` : 'On this day...';

      return `
        <div class="memory-card" onclick="openMemoryDetail('${mem.id}')" style="background: #FFF; border: 1px solid var(--gold-primary);">
          <div class="card-img-wrapper" style="height: 150px;">
            <img src="${mem.coverImage || (mem.images && mem.images[0]) || ''}" class="card-img" alt="${mem.title}">
            <span class="card-category-tag" style="background: var(--gold-warm); color:#102A1C;">✨ ${yearText}</span>
          </div>
          <div class="card-body">
            <h4 class="card-title serif-title">${mem.title}</h4>
            <div class="card-meta">📍 ${mem.locationName || 'Kerala'}</div>
          </div>
        </div>
      `;
    }).join("");
  }
}

// SLIDESHOW MODE ENGINE (Supports Videos)
function openSlideshow() {
  if (memories.length === 0) return;
  slideshowIndex = 0;
  isSlideshowPlaying = true;
  document.getElementById("slideshow-modal").classList.add("active");
  renderSlide();
  startSlideshowTimer();
}

function closeSlideshow() {
  stopSlideshowTimer();
  document.getElementById("slideshow-modal").classList.remove("active");
}

async function renderSlide() {
  const mem = memories[slideshowIndex];
  if (!mem) return;

  document.getElementById("slideshow-counter").textContent = `${slideshowIndex + 1} of ${memories.length}`;
  document.getElementById("slideshow-category").textContent = mem.category;
  document.getElementById("slideshow-title").textContent = mem.title;
  document.getElementById("slideshow-meta").textContent = `📍 ${mem.locationName || 'Kerala'} • 📅 ${mem.displayDate || 'Sometime back'}`;
  document.getElementById("slideshow-story").textContent = `“${mem.story}”`;

  const mediaWrapper = document.querySelector(".slideshow-media-wrapper");
  const mediaList = mem.media || [];
  const firstVideo = mediaList.find(m => m.type === "video") || (mem.videos && mem.videos[0] ? { type: "video", url: mem.videos[0] } : null);

  if (firstVideo) {
    const videoUrl = firstVideo.blobId ? await HighMemoryDB.getMediaUrl(firstVideo) : firstVideo.url;
    mediaWrapper.innerHTML = `
      <video class="slideshow-img" controls playsinline autoplay src="${videoUrl}" poster="${firstVideo.poster || firstVideo.thumbnail || ''}" style="max-height:55vh; border-radius:var(--radius-md);"></video>
    `;
  } else {
    const imgSrc = mem.coverImage || (mem.images && mem.images[0]) || "";
    mediaWrapper.innerHTML = `
      <img id="slideshow-img" src="${imgSrc}" class="slideshow-img" alt="${mem.title}">
    `;
  }

  const progressFill = document.getElementById("slideshow-progress-fill");
  progressFill.style.transition = "none";
  progressFill.style.width = "0%";

  setTimeout(() => {
    if (isSlideshowPlaying) {
      progressFill.style.transition = "width 6s linear";
      progressFill.style.width = "100%";
    }
  }, 50);
}

function startSlideshowTimer() {
  stopSlideshowTimer();
  if (isSlideshowPlaying) {
    slideshowTimer = setInterval(() => {
      nextSlide();
    }, 6000);
  }
}

function stopSlideshowTimer() {
  if (slideshowTimer) clearInterval(slideshowTimer);
}

function togglePlayPauseSlideshow() {
  isSlideshowPlaying = !isSlideshowPlaying;
  const icon = document.getElementById("slideshow-play-icon");

  if (isSlideshowPlaying) {
    if (icon) icon.setAttribute("data-lucide", "pause");
    startSlideshowTimer();
  } else {
    if (icon) icon.setAttribute("data-lucide", "play");
    stopSlideshowTimer();
    const progressFill = document.getElementById("slideshow-progress-fill");
    progressFill.style.transition = "none";
  }
  if (window.lucide) lucide.createIcons();
}

function nextSlide() {
  slideshowIndex = (slideshowIndex + 1) % memories.length;
  renderSlide();
}

function prevSlide() {
  slideshowIndex = (slideshowIndex - 1 + memories.length) % memories.length;
  renderSlide();
}

// 🎲 "I'M BORED" SURPRISE GENERATOR (Supports Videos)
async function triggerImBored() {
  if (memories.length === 0) return;

  let candidates = memories.filter(m => m.id !== lastBoredMemoryId);
  if (candidates.length === 0) candidates = memories;

  const randomMem = candidates[Math.floor(Math.random() * candidates.length)];
  lastBoredMemoryId = randomMem.id;

  const modal = document.getElementById("bored-modal");
  const content = document.getElementById("bored-modal-content");

  const mediaList = randomMem.media || [];
  const firstVideo = mediaList.find(m => m.type === "video") || (randomMem.videos && randomMem.videos[0] ? { type: "video", url: randomMem.videos[0] } : null);

  let mediaHtml = "";
  if (firstVideo) {
    const videoUrl = firstVideo.blobId ? await HighMemoryDB.getMediaUrl(firstVideo) : firstVideo.url;
    mediaHtml = `
      <video class="bored-img" controls playsinline src="${videoUrl}" poster="${firstVideo.poster || firstVideo.thumbnail || ''}" style="max-height:280px; width:100%;"></video>
    `;
  } else {
    mediaHtml = `
      <img src="${randomMem.coverImage || (randomMem.images && randomMem.images[0]) || ''}" class="bored-img" alt="${randomMem.title}">
    `;
  }

  content.innerHTML = `
    <div class="bored-card">
      ${mediaHtml}
      <div class="bored-body">
        <div class="card-meta" style="margin-bottom:6px;">
          <span>📍 ${randomMem.locationName || 'Home, Kerala'}</span>
          <span>•</span>
          <span>📅 ${randomMem.displayDate || 'Sometime back'}</span>
        </div>
        <h3 class="serif-title" style="font-size:1.3rem; margin-bottom:10px;">${randomMem.title}</h3>
        <p class="detail-story-box" style="font-size:0.95rem; padding:12px; margin-bottom:12px;">“${randomMem.story}”</p>
        <button class="btn btn-primary btn-full" onclick="closeImBoredModal(); openMemoryDetail('${randomMem.id}');">
          Open Full Memory & Media ❤️
        </button>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

function closeImBoredModal() {
  document.getElementById("bored-modal").classList.remove("active");
}

// MEMORY DETAIL MODAL (Interactive Photos & Video Player)
async function openMemoryDetail(id) {
  const mem = memories.find(m => m.id === id);
  if (!mem) return;

  const modal = document.getElementById("memory-detail-modal");
  const content = document.getElementById("memory-detail-content");

  // Normalize media list: supports media[], images[], videos[]
  currentDetailMediaList = [];
  if (mem.media && mem.media.length > 0) {
    currentDetailMediaList = [...mem.media];
  } else {
    if (mem.videos && mem.videos.length > 0) {
      mem.videos.forEach(v => currentDetailMediaList.push({ type: "video", url: v, name: "Video Clip" }));
    }
    if (mem.images && mem.images.length > 0) {
      mem.images.forEach(img => currentDetailMediaList.push({ type: "image", url: img, name: "Photo" }));
    } else if (mem.coverImage) {
      currentDetailMediaList.push({ type: "image", url: mem.coverImage, name: "Photo" });
    }
  }

  activeDetailMediaIndex = 0;

  content.innerHTML = `
    <div id="detail-hero-media-wrapper" class="detail-hero-media">
      <!-- Dynamically rendered via renderDetailActiveMedia -->
    </div>

    ${currentDetailMediaList.length > 1 ? `
      <div class="detail-gallery-thumbs" id="detail-gallery-thumbs">
        ${currentDetailMediaList.map((item, idx) => `
          <button class="gallery-thumb-btn ${item.type === 'video' ? 'video-thumb' : ''} ${idx === 0 ? 'active' : ''}" onclick="switchDetailMedia(${idx})" title="${item.name || (item.type === 'video' ? 'Video' : 'Photo')}">
            <img src="${item.thumbnail || item.poster || item.url}" alt="Thumb ${idx + 1}">
            ${item.type === 'video' ? '<span class="thumb-video-icon">▶</span>' : ''}
          </button>
        `).join("")}
      </div>
    ` : ''}

    <div class="detail-body">
      <div class="card-meta" style="margin-bottom:10px;">
        <span class="card-category-tag" style="position:static;">${mem.category}</span>
        <span>📍 ${mem.locationName || 'Kerala'}</span>
        <span>📅 ${mem.displayDate || 'Sometime back'}</span>
      </div>

      <h1 class="detail-title serif-title">${mem.title}</h1>
      <div class="detail-story-box">${mem.story}</div>

      <div style="text-align: center; margin-top:16px;">
        <button class="btn btn-secondary" onclick="closeMemoryDetailModal()">← Back to Memories</button>
      </div>
    </div>
  `;

  await renderDetailActiveMedia();
  modal.classList.add("active");
}

async function renderDetailActiveMedia() {
  const container = document.getElementById("detail-hero-media-wrapper");
  if (!container || currentDetailMediaList.length === 0) return;

  const item = currentDetailMediaList[activeDetailMediaIndex];
  const url = await HighMemoryDB.getMediaUrl(item);

  if (item.type === "video") {
    container.innerHTML = `
      <video class="detail-hero-video" controls playsinline autoplay poster="${item.thumbnail || item.poster || ''}" src="${url}"></video>
    `;
  } else {
    container.innerHTML = `
      <img id="detail-active-photo" src="${url}" class="detail-hero-img" alt="Memory Photo">
    `;
  }

  // Update active thumbnail border
  const thumbs = document.querySelectorAll("#detail-gallery-thumbs .gallery-thumb-btn");
  thumbs.forEach((t, i) => {
    if (i === activeDetailMediaIndex) t.classList.add("active");
    else t.classList.remove("active");
  });
}

function switchDetailMedia(index) {
  activeDetailMediaIndex = index;
  renderDetailActiveMedia();
}

function closeMemoryDetailModal() {
  const video = document.querySelector("#detail-hero-media-wrapper video");
  if (video) video.pause();
  document.getElementById("memory-detail-modal").classList.remove("active");
}

// ADD / EDIT MEMORY (High-Memory Photos & Videos)
function openAddMemoryModal(editId = null) {
  uploadedFormMedia = [];
  const previewsContainer = document.getElementById("media-previews-container");
  if (previewsContainer) previewsContainer.innerHTML = "";

  const modal = document.getElementById("add-memory-modal");
  const form = document.getElementById("memory-form");
  const titleEl = document.getElementById("form-modal-title");

  form.reset();
  document.getElementById("form-memory-id").value = "";

  if (editId) {
    const mem = memories.find(m => m.id === editId);
    if (mem) {
      titleEl.textContent = "✏️ Edit Memory for Chettan";
      document.getElementById("form-memory-id").value = mem.id;
      document.getElementById("form-title").value = mem.title;
      document.getElementById("form-date").value = mem.date || "";
      document.getElementById("form-category").value = mem.category;
      document.getElementById("form-location").value = mem.locationName || "";
      document.getElementById("form-story").value = mem.story;

      if (mem.media && mem.media.length > 0) {
        uploadedFormMedia = [...mem.media];
      } else {
        if (mem.videos) {
          mem.videos.forEach(v => uploadedFormMedia.push({ type: "video", url: v, name: "Video" }));
        }
        if (mem.images) {
          mem.images.forEach(img => uploadedFormMedia.push({ type: "image", url: img, name: "Photo" }));
        }
      }
      renderMediaPreviews();
    }
  } else {
    titleEl.textContent = "＋ Add a Memory for Chettan";
  }

  modal.classList.add("active");
}

function closeAddMemoryModal() {
  document.getElementById("add-memory-modal").classList.remove("active");
}

// HIGH-MEMORY MULTI-FILE UPLOAD HANDLER (Photos & Videos of Any Size)
async function handleMediaUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const spinner = document.getElementById("media-upload-processing");
  const spinnerText = document.getElementById("media-processing-text");
  if (spinner) spinner.classList.remove("hidden");

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isVideo = file.type.startsWith("video/");
    const blobId = (isVideo ? "video-mem-" : "photo-mem-") + Date.now() + "-" + i;
    const sizeStr = HighMemoryDB.formatBytes(file.size);

    if (spinnerText) {
      spinnerText.textContent = `Processing file ${i + 1} of ${files.length} (${file.name} - ${sizeStr})...`;
    }

    try {
      let thumbnail = "";
      if (isVideo) {
        thumbnail = await HighMemoryDB.generateVideoThumbnail(file);
      } else {
        thumbnail = await HighMemoryDB.generateImageThumbnail(file);
      }

      await HighMemoryDB.saveMediaBlob(blobId, file, {
        name: file.name,
        type: file.type,
        thumbnail
      });

      uploadedFormMedia.push({
        id: blobId,
        blobId,
        type: isVideo ? "video" : "image",
        name: file.name,
        size: file.size,
        sizeStr,
        thumbnail,
        url: URL.createObjectURL(file)
      });
    } catch (err) {
      console.error("Error processing media file:", err);
    }
  }

  if (spinner) spinner.classList.add("hidden");
  renderMediaPreviews();
  updateStorageStats();
}

function renderMediaPreviews() {
  const container = document.getElementById("media-previews-container");
  if (!container) return;

  container.innerHTML = uploadedFormMedia.map((item, idx) => `
    <div class="media-preview-item" title="${item.name || ''}">
      <img src="${item.thumbnail || item.url}" alt="Preview ${idx + 1}">
      <span class="media-type-badge">
        ${item.type === 'video' ? '🎥' : '📸'} ${item.sizeStr || ''}
      </span>
      <button type="button" class="media-remove-btn" onclick="removeMediaFromUpload(${idx})" title="Remove">&times;</button>
    </div>
  `).join("");
}

async function removeMediaFromUpload(index) {
  const removed = uploadedFormMedia.splice(index, 1)[0];
  if (removed && removed.blobId) {
    try {
      await HighMemoryDB.deleteMediaBlob(removed.blobId);
    } catch (e) {}
  }
  renderMediaPreviews();
  updateStorageStats();
}

async function saveMemory(event) {
  event.preventDefault();

  const idInput = document.getElementById("form-memory-id").value;
  const title = document.getElementById("form-title").value.trim();
  const dateInput = document.getElementById("form-date").value;
  const category = document.getElementById("form-category").value;
  let locationName = document.getElementById("form-location").value.trim();
  const story = document.getElementById("form-story").value.trim();

  if (!locationName) locationName = "Home, Kerala";

  let displayDate = "Sometime back";
  if (dateInput) {
    const d = new Date(dateInput);
    displayDate = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  // Build media lists
  const media = uploadedFormMedia.length > 0 ? uploadedFormMedia : [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1000&q=80",
      thumbnail: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1000&q=80",
      name: "Default Photo"
    }
  ];

  const images = media.filter(m => m.type === "image").map(m => m.url || m.thumbnail);
  const videos = media.filter(m => m.type === "video").map(m => m.url || m.blobId);
  const coverImage = media[0].thumbnail || media[0].poster || media[0].url;

  if (idInput) {
    const index = memories.findIndex(m => m.id === idInput);
    if (index !== -1) {
      memories[index] = {
        ...memories[index],
        title,
        date: dateInput,
        displayDate,
        category,
        locationName,
        story: story || "A special moment from home.",
        coverImage,
        images: images.length > 0 ? images : [coverImage],
        videos,
        media,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    const newMem = {
      id: "mem-" + Date.now(),
      title,
      date: dateInput,
      displayDate,
      category,
      locationName,
      story: story || "A special moment from home.",
      coverImage,
      images: images.length > 0 ? images : [coverImage],
      videos,
      media,
      createdAt: new Date().toISOString()
    };
    memories.unshift(newMem);
  }

  saveMemoriesToStorage();
  renderMemories();
  checkOnThisDay();
  closeAddMemoryModal();
  updateStorageStats();
  alert("❤️ Memory saved successfully for Chettan!");
}

function editMemory(id) {
  openAddMemoryModal(id);
}

async function deleteMemory(id) {
  if (confirm("Are you sure you want to delete this memory?")) {
    const mem = memories.find(m => m.id === id);
    if (mem && mem.media) {
      for (const m of mem.media) {
        if (m.blobId) await HighMemoryDB.deleteMediaBlob(m.blobId);
      }
    }
    memories = memories.filter(m => m.id !== id);
    saveMemoriesToStorage();
    renderMemories();
    checkOnThisDay();
    updateStorageStats();
  }
}

// SCROLL UTILITY
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });

  const navItems = document.querySelectorAll(".bottom-nav-item");
  navItems.forEach(item => item.classList.remove("active"));
  
  if (sectionId === "hero-section") document.getElementById("nav-home").classList.add("active");
  else if (sectionId === "voice-notes-section") document.getElementById("nav-voice").classList.add("active");
  else if (sectionId === "video-notes-section") {
    const vNav = document.getElementById("nav-video");
    if (vNav) vNav.classList.add("active");
  }
}
