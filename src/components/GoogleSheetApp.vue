<template>
  <div class="flex flex-col md:flex-row h-screen w-full font-sans text-slate-800 overflow-hidden relative selection:bg-blue-500/20 bg-slate-50/30">
    
    <!-- Subtle Floating Sync Indicator (Bottom Right) -->
    <div class="fixed bottom-[84px] md:bottom-6 right-4 z-[100] flex flex-col items-end gap-2 pointer-events-none">
      <transition name="pop">
        <div v-if="!syncState.isOnline" class="bg-amber-500 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-amber-400 flex items-center gap-2 pointer-events-auto">
          <i class="fa-solid fa-cloud-bolt"></i> Offline
        </div>
      </transition>

      <transition name="pop">
        <div v-if="syncState.syncPending" class="bg-blue-600 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-blue-500 flex items-center gap-2 animate-pulse pointer-events-auto">
          <i class="fa-solid fa-arrows-rotate animate-spin"></i> Saving...
        </div>
      </transition>

      <transition name="pop">
        <div v-if="syncState.syncSuccess" class="bg-emerald-500 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-emerald-400 flex items-center gap-2 pointer-events-auto">
          <i class="fa-solid fa-check-circle"></i> Saved
        </div>
      </transition>
    </div>

    <!-- SW Update Available Banner -->
    <transition name="slide-down">
      <div v-if="swUpdateAvailable" class="fixed top-0 left-0 w-full bg-indigo-600 text-white font-bold text-[10px] md:text-xs py-2 text-center shadow-md z-[101] flex justify-center items-center gap-3">
        <i class="fa-solid fa-rotate"></i> A new version is available!
        <button @click="reloadForUpdate" class="bg-white text-indigo-700 px-3 py-0.5 rounded-full text-[10px] font-black hover:bg-indigo-50 active:scale-95 transition-all">Update Now</button>
      </div>
    </transition>

    <!-- PWA Install Prompt Banner -->
    <transition name="slide-down">
      <div v-if="pwaInstallable" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[101] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 border border-white/10 max-w-sm w-[calc(100%-2rem)]">
        <i class="fa-solid fa-mobile-screen-button text-blue-400 text-xl shrink-0"></i>
        <div class="flex-1 min-w-0">
          <p class="font-black text-sm">Add to Home Screen</p>
          <p class="text-[10px] text-slate-400 font-medium">Install for a faster, offline experience.</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button @click="pwaInstallable = false" class="text-slate-400 hover:text-white text-xs font-bold transition-colors active:scale-90">Later</button>
          <button @click="triggerInstall" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-blue-500/30 active:scale-95 transition-all">Install</button>
        </div>
      </div>
    </transition>

    <!-- Mobile Top App Bar -->
    <header class="md:hidden w-full h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 fixed top-0 left-0 z-40 shadow-sm">
      <div class="flex items-center gap-3 overflow-hidden pr-2">
        <button v-if="!selectedLesson" @click="showMobileMenu = true" class="shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-95 transition-all outline-none border border-slate-200/50 shadow-sm">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>
        <button v-else @click="selectedLesson = null" class="shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-95 transition-all outline-none border border-blue-200 shadow-sm">
          <i class="fa-solid fa-arrow-left text-lg"></i>
        </button>

        <button v-if="activeTab === 'lessons' && !selectedLesson && uiState.selectedSubjectForView" @click="uiState.selectedSubjectForView = null" class="shrink-0 w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-transform shadow-sm">
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <h1 v-if="selectedLesson" class="text-sm sm:text-base font-black tracking-tight text-slate-800 truncate">{{ selectedLesson['LessonName'] }}</h1>
        <h1 v-else-if="activeTab === 'lessons' && !selectedLesson && !uiState.selectedSubjectForView" class="text-base font-black tracking-tight text-slate-800 shrink-0">Topics</h1>
        <h1 v-else-if="activeTab === 'lessons' && !selectedLesson && uiState.selectedSubjectForView" class="text-base font-black tracking-tight text-slate-800 truncate">{{ uiState.selectedSubjectForView['SubjectName'] }}</h1>
        <h1 v-else class="text-lg font-black tracking-tight text-slate-800 shrink-0">Yug <span class="text-blue-600">Homeschool</span></h1>
        
        <!-- Dashboard Global Actions (Mobile) -->
        <div v-if="activeTab === 'dashboard' && !selectedLesson" class="flex items-center gap-1.5 ml-2">
          <button @click="handleRefresh" :disabled="dataStore.loading" class="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg active:scale-95 transition-all text-sm shadow-sm border border-slate-200">
            <i class="fa-solid" :class="dataStore.loading ? 'fa-arrows-rotate animate-spin' : 'fa-rotate-right'"></i>
          </button>
          <button @click="handleCalendarSync" :disabled="syncingCalendar" class="h-8 px-3 flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider shadow-sm border border-blue-100">
            <i class="fa-solid" :class="syncingCalendar ? 'fa-arrows-rotate animate-spin' : 'fa-calendar-check'"></i>
            <span class="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>
      
      <div class="shrink-0 flex items-center">
        <button v-if="activeTab === 'lessons' && !selectedLesson && !uiState.selectedSubjectForView" @click="uiState.showSubjectModal = true" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs inline-flex">
          <i class="fa-solid fa-plus"></i>
        </button>
        <button v-if="activeTab === 'lessons' && !selectedLesson && uiState.selectedSubjectForView" @click="uiState.showLessonModal = true" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs inline-flex">
          <i class="fa-solid fa-plus"></i> <span class="hidden sm:inline">Lesson</span>
        </button>
      </div>
    </header>

    <!-- Mobile Slide-out Menu Overlay -->
    <transition name="slide-right">
      <div v-if="showMobileMenu" class="fixed inset-0 z-[100] md:hidden flex">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showMobileMenu = false"></div>
        <aside class="w-[75vw] max-w-[300px] bg-white h-full relative z-10 flex flex-col shadow-2xl">
          <div class="p-6 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                <i class="fa-solid fa-graduation-cap text-lg"></i>
              </div>
              <h1 class="text-lg font-black tracking-tight text-slate-800 leading-tight">Yug<br><span class="text-blue-600">Homeschool</span></h1>
            </div>
            <button @click="showMobileMenu = false" class="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <nav class="px-3 py-5 flex flex-col gap-1.5 flex-1 overflow-y-auto">
            <button v-for="tab in tabs" :key="'mob-'+tab.id" 
                    @click="setTab(tab.id); showMobileMenu = false"
                    :class="[ 'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-[13px] font-bold active:scale-[0.98] outline-none', 
                             (activeTab === tab.id && (!selectedLesson || tab.id === 'lessons')) 
                             ? 'bg-blue-50 text-blue-600' 
                             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800' ]">
              <i :class="['w-6 text-lg text-center', tab.icon]"></i> 
              <span>{{ tab.label }}</span>
            </button>
          </nav>
          <!-- Additional Feature: Real-time Last Synced Verification -->
          <div v-if="syncState.lastSyncTime" class="p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 mt-auto shrink-0">
             <i class="fa-solid fa-clock opacity-50"></i> Last synced: {{ syncState.lastSyncTime }}
          </div>
        </aside>
      </div>
    </transition>

    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex w-64 bg-white/50 border-r border-slate-200 flex-col flex-shrink-0 z-40 shadow-sm backdrop-blur-2xl">
      <div class="p-6 flex items-center gap-4 border-b border-slate-200 shrink-0">
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-black tracking-tight text-slate-800 leading-tight">Yug<br><span class="text-blue-600">Homeschool</span></h1>
        </div>
        
        <!-- Dashboard Global Actions (Desktop Sidebar) -->
        <div v-if="activeTab === 'dashboard' && !selectedLesson" class="flex flex-col gap-2 shrink-0">
          <button @click="handleRefresh" :disabled="dataStore.loading" class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all border border-slate-200 shadow-sm" title="Refresh data">
            <i class="fa-solid" :class="dataStore.loading ? 'fa-arrows-rotate animate-spin' : 'fa-rotate-right'"></i>
          </button>
          <button @click="handleCalendarSync" :disabled="syncingCalendar" class="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 active:scale-95 transition-all border border-blue-200 shadow-sm" title="Sync to Calendar">
            <i class="fa-solid" :class="syncingCalendar ? 'fa-arrows-rotate animate-spin' : 'fa-calendar-check'"></i>
          </button>
        </div>
      </div>
      <nav class="p-5 flex flex-col gap-3 flex-1 overflow-y-auto">
        <button v-for="tab in tabs" :key="tab.id" 
                @click="setTab(tab.id)"
                :class="[ 'flex items-center gap-4 px-5 py-3.5 rounded-3xl transition-all duration-300 text-[13px] font-bold outline-none active:scale-95 origin-left', 
                         (activeTab === tab.id && (!selectedLesson || tab.id === 'lessons')) 
                         ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105' 
                         : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' ]">
          <i :class="['w-6 text-lg text-center', tab.icon]"></i> 
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content Flow (Scrollable) -->
    <main class="flex-1 overflow-y-auto w-full h-full relative scroll-smooth pt-20 pb-36 md:pt-0 md:pb-0 p-3 md:p-6 lg:p-8 z-10">
      
      <div class="max-w-6xl mx-auto space-y-5 md:space-y-8 h-full">

        <!-- DASHBOARD VIEW -->
        <transition name="fade" mode="out-in">
          <DashboardView v-if="activeTab === 'dashboard' && !selectedLesson" @open-lesson="openLesson" />
        </transition>

        <!-- WEEKLY VIEW -->
        <transition name="fade" mode="out-in">
          <WeeklyView v-if="activeTab === 'weekly' && !selectedLesson" @open-lesson="openLesson" @set-tab="setTab" />
        </transition>

        <!-- CURRICULUM VIEW -->
        <transition name="fade" mode="out-in">
          <CurriculumView v-if="activeTab === 'lessons' && !selectedLesson" @open-lesson="openLesson" />
        </transition>

        <!-- LESSON DETAIL VIEW OVERLAY FOR MOBILE / VIEW ON DESKTOP -->
        <transition name="slide-right" mode="out-in">
          <LessonDetailView v-if="selectedLesson" :lesson="selectedLesson" @close="selectedLesson = null" />
        </transition>

        <!-- PLANNER VIEW -->
        <transition name="fade" mode="out-in">
          <PlannerView v-if="activeTab === 'planner' && !selectedLesson" />
        </transition>

        <!-- PROFILE VIEW -->
        <transition name="fade" mode="out-in">
          <ProfileView v-if="activeTab === 'profile' && !selectedLesson" />
        </transition>
        
        <!-- SETTINGS VIEW -->
        <transition name="fade" mode="out-in">
          <SettingsView v-if="activeTab === 'settings' && !selectedLesson" />
        </transition>

        <!-- RESOURCES PLACEHOLDER (still pending full implementation) -->
        <transition name="fade">
          <section v-if="activeTab === 'resources' && !selectedLesson" class="flex flex-col items-center justify-center py-[20vh] px-5 text-center animate-slide-up">
            <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-slate-200/50 border border-slate-100 rotate-6 group hover:rotate-12 transition-all duration-500">
              <i class="fa-solid fa-photo-film text-4xl text-purple-500 opacity-60"></i>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-3 drop-shadow-sm">Resource Library</h2>
            <p class="text-slate-500 text-sm md:text-lg max-w-sm font-medium">Coming soon! Link videos, worksheets and books to your lessons.</p>
          </section>
        </transition>


      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (Fixed) -->
    <nav class="md:hidden w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 fixed bottom-0 left-0 z-40 flex justify-around items-end pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-1 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
      <button v-for="tab in bottomTabs" :key="'bottom-'+tab.id" @click="setTab(tab.id)" class="flex flex-col items-center gap-1 w-full group outline-none active:scale-95 relative transition-all duration-300">
         <div :class="[ 'flex items-center justify-center w-4/5 rounded-[1.8rem] py-2 transition-all duration-300', (activeTab === tab.id && !selectedLesson) ? 'text-white bg-blue-600 shadow-lg shadow-blue-500/40 scale-110 -translate-y-1' : 'text-slate-500' ]">
           <i :class="tab.icon" class="text-xl"></i>
         </div>
         <span :class="[(activeTab === tab.id && !selectedLesson) ? 'text-blue-600 font-bold opacity-100' : 'text-slate-500 font-medium opacity-60', 'text-[0.6rem] transition-all']">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Global Loading Overlay (Initial & Refresh) with Quotes -->
    <transition name="fade">
      <div v-if="dataStore.loading && !dataStore.state.subjects.length" class="fixed inset-0 bg-slate-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
        <!-- Modern Loader -->
        <div class="relative w-24 h-24 mb-10">
          <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div class="absolute inset-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <i class="fa-solid fa-graduation-cap text-2xl"></i>
          </div>
        </div>
        
        <!-- Rotating Quote -->
        <div class="max-w-md animate-fade-in" :key="currentQuoteIndex">
          <i class="fa-solid fa-quote-left text-blue-500/30 text-4xl mb-4 block"></i>
          <p class="text-white text-xl md:text-2xl font-black tracking-tight leading-snug mb-4 italic">
            "{{ quotes[currentQuoteIndex].text }}"
          </p>
          <p class="text-slate-400 font-bold text-sm uppercase tracking-widest">— {{ quotes[currentQuoteIndex].author }}</p>
        </div>

        <!-- Progress Bar -->
        <div class="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-12">
          <div class="bg-blue-500 h-full w-1/2 animate-shimmer"></div>
        </div>
      </div>
    </transition>

    <!-- Global Saving Loader with Backdrop Blur -->
    <transition name="fade">
      <div v-if="dataStore.saving" class="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <div class="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20 border border-white flex flex-col items-center gap-6 animate-slide-up">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div class="absolute inset-3 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
              <i class="fa-solid fa-cloud-arrow-up text-xl"></i>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-lg font-black text-slate-800">Saving Changes...</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Syncing with database</p>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { loadData, dispatchAction, dataStore, uiState } from '../stores/dataStore';
import { syncState, processQueue } from '../services/syncService';

import DashboardView from './dashboard/DashboardView.vue';
import CurriculumView from './curriculum/CurriculumView.vue';
import LessonDetailView from './lesson/LessonDetailView.vue';
import PlannerView from './planner/PlannerView.vue';
import ProfileView from './profile/ProfileView.vue';
import SettingsView from './settings/SettingsView.vue';
import WeeklyView from './weekly/WeeklyView.vue';


// === TABS CONFIG ===
const tabs = [
  { id: 'dashboard', label: 'Dash', icon: 'fa-solid fa-chart-pie' },
  { id: 'lessons', label: 'Learn', icon: 'fa-solid fa-book-open' },
  { id: 'weekly', label: 'Week', icon: 'fa-solid fa-calendar-check' },
  { id: 'planner', label: 'Plan', icon: 'fa-solid fa-calendar-days' },
  { id: 'progress', label: 'Progress', icon: 'fa-solid fa-chart-line' },
  { id: 'resources', label: 'Lib', icon: 'fa-solid fa-photo-film' },
  { id: 'profile', label: 'Profile', icon: 'fa-solid fa-user-graduate' },
  { id: 'settings', label: 'Gear', icon: 'fa-solid fa-gear' }
];

const bottomTabs = tabs.slice(0, 4); // Keep bottom nav uncluttered

// === STATE ===
const activeTab = ref('weekly');
const selectedLesson = ref(null);
const showMobileMenu = ref(false);
const syncingCalendar = ref(false);

// ─── Actions moved from Dashboard ───────────────────────────────────────────
const handleRefresh = async () => {
  if (dataStore.loading) return;
  await loadData();
};

const handleCalendarSync = async () => {
  if (syncingCalendar.value) return;
  syncingCalendar.value = true;
  try {
    const result = await dispatchAction('syncWeeklyPlanToCalendar');
    if (result && result.status === 'success') {
      alert(result.message);
    }
  } catch (e) {
    console.error('Calendar sync failed:', e);
    alert('Failed to sync calendar. Check your connection.');
  } finally {
    syncingCalendar.value = false;
  }
};
// FIX: SW update + PWA install states
const swUpdateAvailable = ref(false);
const pwaInstallable = ref(false);

// === QUOTES ===
const quotes = [
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
  { text: "The best thing about homeschooling is the time we have together.", author: "Homeschool Mom" },
  { text: "Children are not things to be molded, but people to be unfolded.", author: "Jess Lair" },
  { text: "Homeschooling is a marathon, not a sprint. Enjoy the scenery.", author: "Ancient Wisdom" },
  { text: "The world is our classroom, and life is our curriculum.", author: "Modern Explorer" },
  { text: "Knowledge is a treasure, but practice is the key to it.", author: "Lao Tzu" }
];
const currentQuoteIndex = ref(Math.floor(Math.random() * quotes.length));

onMounted(() => {
  setInterval(() => {
    currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.length;
  }, 4000);
  
  loadData();
  processQueue();

  // Push an initial state so the first 'back' action doesn't exit the app immediately
  if (!window.history.state) {
    window.history.replaceState({ tab: 'dashboard' }, "");
  }

  // Bind to Service Worker Background Native Sync Resolves
  window.addEventListener('homeschool-data-hydrated', async (e) => {
    const freshData = e.detail;
    if (freshData && freshData.subjects) {
      dataStore.state = { ...dataStore.state, ...freshData };
      // syncSuccess is now managed by syncService.js directly — no need to set it here again
    }
  });

  // FIX: Listen for SW update notification dispatched from main.js
  window.addEventListener('sw-update-available', () => {
    swUpdateAvailable.value = true;
  });

  // FIX: Listen for PWA install prompt captured in main.js
  window.addEventListener('pwa-installable', () => {
    pwaInstallable.value = true;
  });
  // Also check if already captured before this component mounted
  if (window.__pwaInstallPrompt) {
    pwaInstallable.value = true;
  }

  // App Foregrounding Hydration (Aggressively guards against device-drift)
  let lastActiveTimestamp = Date.now();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const minutesIdle = (Date.now() - lastActiveTimestamp) / 1000 / 60;
      if (minutesIdle > 15 && navigator.onLine) {
         console.log(`[Hydration] App idle for ${Math.round(minutesIdle)}mins. Background fetching fresh data...`);
         loadData(); 
      }
      lastActiveTimestamp = Date.now();
    }
  });
});

// === BACK BUTTON HANDLING (PWA / MOBILE) ===
// Intercept the browser/hardware back button to close modals/lessons or switch tabs instead of closing the app
watch([selectedLesson, () => uiState.selectedSubjectForView, showMobileMenu, () => uiState.showSubjectModal, () => uiState.showLessonModal], 
  ([less, subView, menu, subModal, lessModal]) => {
    const isAnyOverlayOpen = less || subView || menu || subModal || lessModal;
    if (isAnyOverlayOpen) {
      if (window.history.state?.overlay !== true) {
        window.history.pushState({ overlay: true, tab: activeTab.value }, "");
      }
    }
  }
);

// Track tab changes in history
watch(activeTab, (newTab) => {
  if (window.history.state?.tab !== newTab) {
    window.history.pushState({ tab: newTab }, "");
  }
});

window.onpopstate = (event) => {
  // 1. If we have overlays open, close them first
  if (selectedLesson.value || uiState.selectedSubjectForView || showMobileMenu.value || uiState.showSubjectModal || uiState.showLessonModal) {
    selectedLesson.value = null;
    uiState.selectedSubjectForView = null;
    showMobileMenu.value = false;
    uiState.showSubjectModal = false;
    uiState.showLessonModal = false;
    return;
  }

  // 2. Otherwise, check if we should switch tabs
  if (event.state && event.state.tab && event.state.tab !== activeTab.value) {
    activeTab.value = event.state.tab;
  }
};

// FIX: Reload page to activate the waiting SW update
const reloadForUpdate = () => {
  swUpdateAvailable.value = false;
  window.location.reload();
};

// FIX: Trigger the browser's native PWA install prompt
const triggerInstall = async () => {
  pwaInstallable.value = false;
  if (window.__pwaInstallPrompt) {
    window.__pwaInstallPrompt.prompt();
    const { outcome } = await window.__pwaInstallPrompt.userChoice;
    console.log(`[PWA] Install outcome: ${outcome}`);
    window.__pwaInstallPrompt = null;
  }
};

// === HELPERS ===
const setTab = (tab) => {
  activeTab.value = tab;
  selectedLesson.value = null;
  uiState.selectedSubjectForView = null; // Clear selected subject when navigating
  // Scroll to top instantly on mobile navigation
  window.scrollTo(0,0);
  document.querySelector('main')?.scrollTo(0,0);
};

const openLesson = (lesson) => {
  selectedLesson.value = lesson;
};
</script>

<style>
/* Gorgeous Vue Transition Animations */

/* Simple Fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide Right for Page Changes */
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from { opacity: 0; transform: translateX(30px); }
.slide-right-leave-to { opacity: 0; transform: translateX(-30px); }

/* Slide Down */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0; transform: translateY(-20px);
}

/* Pop */
.pop-enter-active, .pop-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-enter-from, .pop-leave-to {
  opacity: 0; transform: scale(0.9);
}

/* List Groups (Tasks, Agenda) */
.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.98);
}
.list-leave-active {
  position: absolute; /* allows for smooth collapse */
  width: 100%;
}

/* Stagger Slide Up */
@keyframes slideUp {
  0% { opacity: 0; transform: translateY(15px) scale(0.99); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0; /* starts hidden before animation runs */
}

/* Continuous Subtle Scale */
@keyframes breathing {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.scale-animation {
  animation: breathing 3s infinite ease-in-out;
}

/* Hide Scrollbar helper for horizontal scrollers */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
