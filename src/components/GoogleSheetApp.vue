<template>
  <div class="flex flex-col md:flex-row h-screen w-full font-sans text-slate-800 overflow-hidden relative selection:bg-blue-500/20 bg-slate-50/30">
    
<!-- Connectivity Indicator & Sync States -->
    <transition name="slide-down">
      <div v-if="!syncState.isOnline" class="fixed top-0 left-0 w-full bg-amber-500 text-white font-bold text-[10px] md:text-xs py-1.5 text-center shadow-md z-[100] flex justify-center items-center gap-2">
        <i class="fa-solid fa-cloud-bolt"></i> Offline Mode - Data saved locally
      </div>
      <div v-else-if="syncState.syncPending" class="fixed top-0 left-0 w-full bg-blue-500 text-white font-bold text-[10px] md:text-xs py-1.5 text-center shadow-md z-[100] flex justify-center items-center gap-2">
        <i class="fa-solid fa-arrows-rotate animate-spin"></i> Syncing offline changes...
      </div>
      <div v-else-if="syncState.syncSuccess" class="fixed top-0 left-0 w-full bg-emerald-500 text-white font-bold text-[10px] md:text-xs py-1.5 text-center shadow-md z-[100] flex justify-center items-center gap-2">
        <i class="fa-solid fa-check-circle"></i> Sync Complete! ({{ syncState.lastSyncTime }})
      </div>
    </transition>

    <!-- Mobile Top App Bar -->
    <header class="md:hidden w-full h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 fixed top-0 left-0 z-40 shadow-sm" :class="{ 'mt-7': !syncState.isOnline || syncState.syncPending }">
      <div class="flex items-center gap-3">
        <button @click="showMobileMenu = true" class="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-95 transition-all outline-none border border-slate-200/50 shadow-sm">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>
        <button v-if="activeTab === 'lessons' && !selectedLesson && uiState.selectedSubjectForView" @click="uiState.selectedSubjectForView = null" class="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-transform shadow-sm">
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <h1 v-if="activeTab === 'lessons' && !selectedLesson && !uiState.selectedSubjectForView" class="text-lg font-black tracking-tight text-slate-800">Topics</h1>
        <h1 v-else-if="activeTab === 'lessons' && !selectedLesson && uiState.selectedSubjectForView" class="text-lg font-black tracking-tight text-slate-800 truncate max-w-[140px]">{{ uiState.selectedSubjectForView['Subject Name'] }}</h1>
        <h1 v-else class="text-xl font-black tracking-tight text-slate-800">Yug <span class="text-blue-600">Homeschool</span></h1>
      </div>
      
      <button v-if="activeTab === 'lessons' && !selectedLesson && !uiState.selectedSubjectForView" @click="uiState.showSubjectModal = true" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs">
        <i class="fa-solid fa-plus"></i>
      </button>
      <button v-if="activeTab === 'lessons' && !selectedLesson && uiState.selectedSubjectForView" @click="uiState.showLessonModal = true" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs">
        <i class="fa-solid fa-plus"></i> <span class="hidden sm:inline">Lesson</span>
      </button>
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
              <h1 class="text-xl font-black tracking-tight text-slate-800 leading-tight">Yug<br><span class="text-blue-600">Homeschool</span></h1>
            </div>
            <button @click="showMobileMenu = false" class="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <nav class="px-3 py-5 flex flex-col gap-1.5 flex-1 overflow-y-auto">
            <button v-for="tab in tabs" :key="'mob-'+tab.id" 
                    @click="setTab(tab.id); showMobileMenu = false"
                    :class="[ 'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold active:scale-[0.98] outline-none', 
                             (activeTab === tab.id && (!selectedLesson || tab.id === 'lessons')) 
                             ? 'bg-blue-50 text-blue-600' 
                             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800' ]">
              <i :class="['w-6 text-xl text-center', tab.icon]"></i> 
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
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30">
          <i class="fa-solid fa-graduation-cap text-xl"></i>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-slate-800">Yug<br><span class="text-blue-600">Homeschool</span></h1>
      </div>
      <nav class="p-5 flex flex-col gap-3 flex-1 overflow-y-auto">
        <button v-for="tab in tabs" :key="tab.id" 
                @click="setTab(tab.id)"
                :class="[ 'flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-sm font-bold outline-none active:scale-95 origin-left', 
                         (activeTab === tab.id && (!selectedLesson || tab.id === 'lessons')) 
                         ? 'bg-blue-50 text-blue-600 shadow-[inset_4px_0_0_#3b82f6] shadow-sm' 
                         : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' ]">
          <i :class="['w-6 text-xl text-center', tab.icon]"></i> 
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content Flow (Scrollable) -->
    <main class="flex-1 overflow-y-auto w-full h-full relative scroll-smooth pt-20 pb-28 md:pt-0 md:pb-0 p-3 md:p-6 lg:p-8 z-10">
      
      <div class="max-w-6xl mx-auto space-y-5 md:space-y-8 h-full">

        <!-- DASHBOARD VIEW -->
        <transition name="fade" mode="out-in">
          <DashboardView v-if="activeTab === 'dashboard' && !selectedLesson" @open-lesson="openLesson" />
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
        
        <!-- API PLACEHOLDERS -->
        <transition name="fade">
          <section v-if="(activeTab === 'resources' || activeTab === 'settings') && !selectedLesson" class="flex flex-col items-center justify-center py-[20vh] px-5 text-center animate-slide-up">
            <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-slate-200/50 border border-slate-100 rotate-6 group hover:rotate-12 transition-all duration-500">
              <i class="fa-solid fa-code text-4xl text-blue-500 opacity-60"></i>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-3 drop-shadow-sm">Backend Node</h2>
            <p class="text-slate-500 text-sm md:text-lg max-w-sm font-medium">Use the DataService functions to hydrate this screen dynamically.</p>
          </section>
        </transition>

      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (Fixed) -->
    <nav class="md:hidden w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 fixed bottom-0 left-0 z-40 flex justify-around items-end pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-1 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
      <button v-for="tab in bottomTabs" :key="'bottom-'+tab.id" @click="setTab(tab.id)" class="flex flex-col items-center gap-1 w-[4.5rem] group outline-none active:scale-95 relative transition-transform">
         <div :class="[ 'flex items-center justify-center w-full rounded-2xl py-1.5 transition-all duration-300', (activeTab === tab.id && !selectedLesson) ? 'text-blue-600 bg-blue-50 shadow-sm border border-blue-100' : 'text-slate-500' ]">
           <i :class="tab.icon" class="text-xl"></i>
         </div>
         <span :class="[(activeTab === tab.id && !selectedLesson) ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 font-medium', 'text-[0.6rem] transition-all']">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Global Saving Overlay -->
    <transition name="fade">
      <div v-if="dataStore.saving" class="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6 shadow-xl shadow-blue-500/20"></div>
        <p class="text-slate-700 font-black tracking-tight text-xl animate-pulse">
          Saving Changes...
        </p>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadData, dataStore, uiState } from '../stores/dataStore';
import { syncState, processQueue } from '../services/syncService';

import DashboardView from './dashboard/DashboardView.vue';
import CurriculumView from './curriculum/CurriculumView.vue';
import LessonDetailView from './lesson/LessonDetailView.vue';
import PlannerView from './planner/PlannerView.vue';
import ProfileView from './profile/ProfileView.vue';

// === TABS CONFIG ===
const tabs = [
  { id: 'dashboard', label: 'Dash', icon: 'fa-solid fa-chart-pie' },
  { id: 'lessons', label: 'Learn', icon: 'fa-solid fa-book-open' },
  { id: 'planner', label: 'Plan', icon: 'fa-solid fa-calendar-days' },
  { id: 'progress', label: 'Progress', icon: 'fa-solid fa-chart-line' },
  { id: 'resources', label: 'Lib', icon: 'fa-solid fa-photo-film' },
  { id: 'profile', label: 'Profile', icon: 'fa-solid fa-user-graduate' },
  { id: 'settings', label: 'Gear', icon: 'fa-solid fa-gear' }
];

const bottomTabs = tabs.slice(0, 4); // Keep bottom nav uncluttered

// === STATE ===
const activeTab = ref('dashboard');
const selectedLesson = ref(null);
const showMobileMenu = ref(false);

// === MOUNT ===
onMounted(() => {
  loadData();
  processQueue(); // Check for pending queue drops on load

  // Bind to Service Worker Background Native Sync Resolves
  window.addEventListener('homeschool-data-hydrated', async (e) => {
    const freshData = e.detail;
    if (freshData && freshData.subjects) {
      dataStore.state = { ...dataStore.state, ...freshData };
      syncState.syncSuccess = true;
      setTimeout(() => syncState.syncSuccess = false, 3000);
    }
  });

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
