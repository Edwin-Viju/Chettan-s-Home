/* ==========================================================================
   CHETTAN'S MEMORY HOUSE — MAIN APPLICATION LOGIC (VERCEL READY)
   ========================================================================== */

// INITIAL SEED MEMORIES
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
    createdAt: "2024-02-18T17:00:00.000Z"
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
let categories = [];
let siteTexts = {};
let activeCategory = "All";
let searchQuery = "";
let isAdminMode = false;
let uploadedFormPhotos = [];
let currentAudioFile = null;
let lastBoredMemoryId = null;

// SLIDESHOW STATE
let slideshowIndex = 0;
let slideshowTimer = null;
let isSlideshowPlaying = false;

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  checkAuthStatus();
  applySiteTexts();
  startDualClock();
  renderCategoryPills();
  renderCategorySelectOptions();
  renderVoiceNotes();
  renderMemories();
  checkOnThisDay();

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
}

function saveCategoriesToStorage() {
  localStorage.setItem("godwin_categories", JSON.stringify(categories));
}

function saveVoiceNotesToStorage() {
  localStorage.setItem("godwin_voice_notes", JSON.stringify(voiceNotes));
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
    alert("🔧 Admin mode unlocked! You can now edit site texts, memories, and delete audio voice notes.");
  } else {
    adminIndicator.classList.add("hidden");
    if (editSiteBtn) editSiteBtn.classList.add("hidden");
    adminBtn.style.backgroundColor = "transparent";
  }

  renderVoiceNotes();
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

// VOICE NOTES RENDER & DELETE FEATURE
function renderVoiceNotes() {
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

  container.innerHTML = voiceNotes.map(vn => `
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
      <audio controls src="${vn.audioUrl}"></audio>
    </div>
  `).join("");
}

function deleteVoiceNote(id) {
  if (confirm("Are you sure you want to delete this voice message?")) {
    voiceNotes = voiceNotes.filter(v => v.id !== id);
    saveVoiceNotesToStorage();
    renderVoiceNotes();
  }
}

function openAddVoiceNoteModal() {
  document.getElementById("add-voice-modal").classList.add("active");
}

function closeAddVoiceNoteModal() {
  document.getElementById("add-voice-modal").classList.remove("active");
}

function handleAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    currentAudioFile = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function applyVoicePreset(val) {
  if (val === "mum") {
    currentAudioFile = "https://actions.google.com/sounds/v1/human/applause_moderate.ogg";
    document.getElementById("voice-title").value = "Mum's Voice: Eat well after work!";
  } else if (val === "rain") {
    currentAudioFile = "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg";
    document.getElementById("voice-title").value = "Monsoon Rain on the Roof";
  } else if (val === "brother") {
    currentAudioFile = "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg";
    document.getElementById("voice-title").value = "Brother's Kattan Tea Message";
  }
}

function saveVoiceNote(e) {
  e.preventDefault();
  const title = document.getElementById("voice-title").value.trim();
  if (!title || !currentAudioFile) {
    alert("Please upload an audio file or select a demo sound!");
    return;
  }

  const newVn = {
    id: "vn-" + Date.now(),
    title,
    sender: "❤️ Family Message",
    icon: "🎙️",
    audioUrl: currentAudioFile
  };

  voiceNotes.unshift(newVn);
  saveVoiceNotesToStorage();
  renderVoiceNotes();
  closeAddVoiceNoteModal();
  currentAudioFile = null;
  alert("Voice note added successfully!");
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

// RENDER MEMORIES GRID
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

    container.innerHTML = filtered.map(mem => `
      <div class="memory-card" onclick="openMemoryDetail('${mem.id}')">
        ${isAdminMode ? `
          <div class="admin-card-actions" onclick="event.stopPropagation()">
            <button class="admin-card-btn edit" onclick="editMemory('${mem.id}')" title="Edit">✏️</button>
            <button class="admin-card-btn delete" onclick="deleteMemory('${mem.id}')" title="Delete">🗑️</button>
          </div>
        ` : ''}

        <div class="card-img-wrapper">
          <img src="${mem.coverImage || mem.images[0]}" class="card-img" alt="${mem.title}" loading="lazy">
          <span class="card-category-tag">${mem.category}</span>
          ${mem.images && mem.images.length > 1 ? `
            <span class="card-photo-count">
              <i data-lucide="image"></i> ${mem.images.length}
            </span>
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
            <span>Read Story & Photos</span>
            <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
          </div>
        </div>
      </div>
    `).join("");

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
            <img src="${mem.coverImage || mem.images[0]}" class="card-img" alt="${mem.title}">
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

// SLIDESHOW MODE ENGINE
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

function renderSlide() {
  const mem = memories[slideshowIndex];
  if (!mem) return;

  document.getElementById("slideshow-counter").textContent = `${slideshowIndex + 1} of ${memories.length}`;
  document.getElementById("slideshow-img").src = mem.coverImage || mem.images[0];
  document.getElementById("slideshow-category").textContent = mem.category;
  document.getElementById("slideshow-title").textContent = mem.title;
  document.getElementById("slideshow-meta").textContent = `📍 ${mem.locationName || 'Kerala'} • 📅 ${mem.displayDate || 'Sometime back'}`;
  document.getElementById("slideshow-story").textContent = `“${mem.story}”`;

  const progressFill = document.getElementById("slideshow-progress-fill");
  progressFill.style.transition = "none";
  progressFill.style.width = "0%";

  setTimeout(() => {
    if (isSlideshowPlaying) {
      progressFill.style.transition = "width 5s linear";
      progressFill.style.width = "100%";
    }
  }, 50);
}

function startSlideshowTimer() {
  stopSlideshowTimer();
  if (isSlideshowPlaying) {
    slideshowTimer = setInterval(() => {
      nextSlide();
    }, 5000);
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

// 🎲 "I'M BORED" SURPRISE GENERATOR
function triggerImBored() {
  if (memories.length === 0) return;

  let candidates = memories.filter(m => m.id !== lastBoredMemoryId);
  if (candidates.length === 0) candidates = memories;

  const randomMem = candidates[Math.floor(Math.random() * candidates.length)];
  lastBoredMemoryId = randomMem.id;

  const modal = document.getElementById("bored-modal");
  const content = document.getElementById("bored-modal-content");

  content.innerHTML = `
    <div class="bored-card">
      <img src="${randomMem.coverImage || randomMem.images[0]}" class="bored-img" alt="${randomMem.title}">
      <div class="bored-body">
        <div class="card-meta" style="margin-bottom:6px;">
          <span>📍 ${randomMem.locationName || 'Home, Kerala'}</span>
          <span>•</span>
          <span>📅 ${randomMem.displayDate || 'Sometime back'}</span>
        </div>
        <h3 class="serif-title" style="font-size:1.3rem; margin-bottom:10px;">${randomMem.title}</h3>
        <p class="detail-story-box" style="font-size:0.95rem; padding:12px; margin-bottom:12px;">“${randomMem.story}”</p>
        <button class="btn btn-primary btn-full" onclick="closeImBoredModal(); openMemoryDetail('${randomMem.id}');">
          Open Full Memory & Photos ❤️
        </button>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

function closeImBoredModal() {
  document.getElementById("bored-modal").classList.remove("active");
}

// MEMORY DETAIL MODAL
function openMemoryDetail(id) {
  const mem = memories.find(m => m.id === id);
  if (!mem) return;

  const modal = document.getElementById("memory-detail-modal");
  const content = document.getElementById("memory-detail-content");
  const imagesList = mem.images && mem.images.length > 0 ? mem.images : [mem.coverImage];

  content.innerHTML = `
    <div class="detail-hero-media">
      <img id="detail-active-photo" src="${imagesList[0]}" class="detail-hero-img" alt="${mem.title}">
    </div>

    ${imagesList.length > 1 ? `
      <div class="detail-gallery-thumbs">
        ${imagesList.map((img, idx) => `
          <button class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchDetailPhoto('${img}', ${idx})">
            <img src="${img}" alt="Thumb ${idx + 1}">
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

  modal.classList.add("active");
}

function switchDetailPhoto(imgUrl, index) {
  const photoEl = document.getElementById("detail-active-photo");
  if (photoEl) photoEl.src = imgUrl;

  const thumbs = document.querySelectorAll(".gallery-thumb-btn");
  thumbs.forEach((t, i) => {
    if (i === index) t.classList.add("active");
    else t.classList.remove("active");
  });
}

function closeMemoryDetailModal() {
  document.getElementById("memory-detail-modal").classList.remove("active");
}

// ADD / EDIT MEMORY
function openAddMemoryModal(editId = null) {
  uploadedFormPhotos = [];
  document.getElementById("photo-previews-container").innerHTML = "";

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

      if (mem.images) {
        uploadedFormPhotos = [...mem.images];
        renderPhotoPreviews();
      }
    }
  } else {
    titleEl.textContent = "＋ Add a Memory for Chettan";
  }

  modal.classList.add("active");
}

function closeAddMemoryModal() {
  document.getElementById("add-memory-modal").classList.remove("active");
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedFormPhotos.push(e.target.result);
      renderPhotoPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoPreviews() {
  const container = document.getElementById("photo-previews-container");
  container.innerHTML = uploadedFormPhotos.map((img, idx) => `
    <div class="photo-preview-item">
      <img src="${img}" alt="Preview ${idx + 1}">
      <button type="button" class="remove-photo-btn" onclick="removePhotoFromUpload(${idx})">&times;</button>
    </div>
  `).join("");
}

function removePhotoFromUpload(index) {
  uploadedFormPhotos.splice(index, 1);
  renderPhotoPreviews();
}

function saveMemory(event) {
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

  const photos = uploadedFormPhotos.length > 0 ? uploadedFormPhotos : [
    "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1000&q=80"
  ];

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
        coverImage: photos[0],
        images: photos,
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
      coverImage: photos[0],
      images: photos,
      createdAt: new Date().toISOString()
    };
    memories.unshift(newMem);
  }

  saveMemoriesToStorage();
  renderMemories();
  checkOnThisDay();
  closeAddMemoryModal();
  alert("❤️ Memory saved successfully for Chettan!");
}

function editMemory(id) {
  openAddMemoryModal(id);
}

function deleteMemory(id) {
  if (confirm("Are you sure you want to delete this memory?")) {
    memories = memories.filter(m => m.id !== id);
    saveMemoriesToStorage();
    renderMemories();
    checkOnThisDay();
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
}
