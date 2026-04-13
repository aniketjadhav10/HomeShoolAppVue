<template>
  <div class="space-y-6 md:space-y-8 animate-slide-up pb-6 h-full flex flex-col">
    
    <!-- Profile Card (Hero Section) -->
    <div class="relative bg-gradient-to-tr从 from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl shadow-purple-500/30 overflow-hidden shrink-0 transition-transform hover:-translate-y-1 duration-500">
      <!-- Glassmorphism Orbs -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/20 blur-3xl opacity-50 mix-blend-overlay"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-900/40 blur-3xl opacity-60 mix-blend-multiply"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        <!-- Avatar Wrapper -->
        <div class="relative group cursor-pointer">
          <div class="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-xl transition-all duration-500 scale-110"></div>
          <div class="w-28 h-28 md:w-36 md:h-36 rounded-full border-[5px] border-white/40 shadow-xl overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center relative z-10">
            <!-- Using dicebear for a nice dynamic avatar, but seeded for Yug -->
            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=YugJadhav&backgroundColor=transparent&skinColor=f2d3b1" alt="Yug" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out" />
          </div>
          <!-- Tiny level badge on avatar -->
          <div class="absolute bottom-0 right-0 md:bottom-2 md:right-2 bg-gradient-to-br from-yellow-400 to-amber-600 text-white text-xs font-black px-2.5 py-1 rounded-xl border-2 border-white shadow-lg z-20 transform group-hover:scale-110 transition-transform">
            Lvl 12
          </div>
        </div>
        
        <!-- User Information -->
        <div class="text-center md:text-left flex-1 min-w-0 flex flex-col justify-center py-2">
          <h2 class="text-3xl md:text-5xl font-black mb-1 md:mb-2 tracking-tight drop-shadow-md">Yug Jadhav</h2>
          <p class="text-white/80 font-bold text-base md:text-xl mb-5 flex items-center justify-center md:justify-start gap-2">
            <i class="fa-solid fa-compass"></i> Grade 5 Explorer
          </p>
          
          <div class="flex flex-wrap justify-center md:justify-start gap-3">
            <div class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl text-sm font-bold border border-white/10 shadow-sm flex items-center gap-2.5 transition-colors cursor-default">
              <i class="fa-solid fa-fire text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]"></i> 
              <span><span class="text-white">14 Day</span> Streak</span>
            </div>
            <div class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl text-sm font-bold border border-white/10 shadow-sm flex items-center gap-2.5 transition-colors cursor-default">
              <i class="fa-solid fa-star text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"></i> 
              <span><span class="text-white">1,250</span> XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 shrink-0">
      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-col hover:-translate-y-1 transition-all duration-300 group">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <i class="fa-solid fa-book-open"></i>
        </div>
        <span class="text-3xl font-black text-slate-800 tracking-tight">{{ totalLessons }}</span>
        <span class="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lessons Done</span>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-col hover:-translate-y-1 transition-all duration-300 group">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <i class="fa-solid fa-check-double"></i>
        </div>
        <span class="text-3xl font-black text-slate-800 tracking-tight">{{ completedSessions }}</span>
        <span class="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sessions Done</span>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-col hover:-translate-y-1 transition-all duration-300 group">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <i class="fa-solid fa-clock"></i>
        </div>
        <span class="text-3xl font-black text-slate-800 tracking-tight">124<span class="text-xl text-slate-500">h</span></span>
        <span class="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Time Logged</span>
      </div>
      
      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 md:p-6 shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-col hover:-translate-y-1 transition-all duration-300 group">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <i class="fa-solid fa-medal"></i>
        </div>
        <span class="text-3xl font-black text-slate-800 tracking-tight">8</span>
        <span class="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Badges Won</span>
      </div>
    </div>

    <!-- Details Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 flex-1">
      
      <!-- Achievements Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xl md:text-2xl font-black flex items-center gap-3 text-slate-800">
            <div class="p-2.5 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-inner">
               <i class="fa-solid fa-award text-yellow-500 text-lg"></i>
            </div>
            Achievements
          </h3>
          <button class="text-xs md:text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors active:scale-95">View All</button>
        </div>
        
        <div class="grid grid-cols-3 gap-3 md:gap-5 flex-1 content-start">
          <div class="flex flex-col items-center text-center group cursor-pointer p-3 md:p-4 rounded-3xl hover:bg-slate-50 transition-colors">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center border-[3px] border-white shadow-md group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-yellow-500/20 transition-all duration-300">
              <i class="fa-solid fa-crown text-3xl md:text-4xl text-yellow-600 drop-shadow-sm group-hover:scale-110 transition-transform"></i>
            </div>
            <span class="text-xs md:text-sm font-bold text-slate-800 mt-3 md:mt-4 leading-tight">Math Wizard</span>
            <span class="text-[10px] md:text-xs font-bold text-slate-400 mt-1 bg-slate-100 px-2 py-0.5 rounded-md">Level 5</span>
          </div>
          
          <div class="flex flex-col items-center text-center group cursor-pointer p-3 md:p-4 rounded-3xl hover:bg-slate-50 transition-colors">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center border-[3px] border-white shadow-md group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-300">
              <i class="fa-solid fa-rocket text-3xl md:text-4xl text-blue-600 drop-shadow-sm group-hover:scale-110 transition-transform"></i>
            </div>
            <span class="text-xs md:text-sm font-bold text-slate-800 mt-3 md:mt-4 leading-tight">Fast Learner</span>
            <span class="text-[10px] md:text-xs font-bold text-slate-400 mt-1 bg-slate-100 px-2 py-0.5 rounded-md">3 Days Row</span>
          </div>
          
          <div class="flex flex-col items-center text-center group cursor-pointer p-3 md:p-4 rounded-3xl hover:bg-slate-50 transition-colors">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center border-[3px] border-white shadow-md group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-emerald-500/20 transition-all duration-300">
              <i class="fa-solid fa-leaf text-3xl md:text-4xl text-emerald-600 drop-shadow-sm group-hover:scale-110 transition-transform"></i>
            </div>
            <span class="text-xs md:text-sm font-bold text-slate-800 mt-3 md:mt-4 leading-tight">Science Pro</span>
            <span class="text-[10px] md:text-xs font-bold text-slate-400 mt-1 bg-slate-100 px-2 py-0.5 rounded-md">10 Lessons</span>
          </div>
        </div>
      </div>

      <!-- Subject Mastery Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col group/card">
        <div class="flex items-center justify-between mb-8 relative z-10">
          <h3 class="text-xl md:text-2xl font-black flex items-center gap-3 text-slate-800">
            <div class="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-inner">
               <i class="fa-solid fa-chart-radar text-indigo-500 text-lg"></i>
            </div>
            Subject Mastery
          </h3>
        </div>
        
        <div class="space-y-6 relative z-10 flex-1 content-center">
          <div v-for="(sub, index) in topSubjects" :key="sub.id" class="relative group cursor-default">
            <div class="flex justify-between items-center mb-2.5">
              <span class="text-sm md:text-base font-bold text-slate-700 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black">
                  {{ index + 1 }}
                </div>
                {{ sub.name }}
              </span>
              <span class="text-sm md:text-base font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{{ sub.progress }}%</span>
            </div>
            <div class="w-full bg-slate-100 md:h-3.5 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
              <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 shadow-sm relative overflow-hidden" :style="{ width: sub.progress + '%' }">
                <!-- Gloss effect on bar -->
                <div class="absolute inset-0 bg-white/20 w-full h-1/2 rounded-t-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Decorative subtle background icon -->
        <i class="fa-solid fa-brain absolute -bottom-10 -right-10 text-[12rem] text-indigo-500/[0.03] pointer-events-none -rotate-12 group-hover/card:scale-110 group-hover/card:-rotate-6 transition-all duration-700 ease-out"></i>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { dataStore } from '../../stores/dataStore';
import { subjectRepository } from '../../repositories/subjectRepository';
import { lessonRepository } from '../../repositories/lessonRepository';
// ✅ Import shared composables
import { normalizeBool, normalizeStatus } from '../../composables/useLessonStatus';
import { getLessonProgress } from '../../composables/useLessonProgress';

const normalizeStatusStr = (v) => (v ?? '').toString().trim().toLowerCase();


const totalLessons = computed(() => {
  return lessonRepository.getLessons().filter(l => normalizeStatus(l.Status) === 'completed').length || 0;
});

const completedSessions = computed(() => {
  return lessonRepository.getLessons().reduce((acc, l) => acc + (parseInt(l.LearnedCount) || 0), 0);
});

const topSubjects = computed(() => {
  const subjectsWithProgress = subjectRepository.getSubjects().map(sub => {
    const subLessons = lessonRepository.getLessonsBySubject(sub.SubjectId);
    if (!subLessons.length) return { id: sub.SubjectId, name: sub['SubjectName'], progress: 0 };
    
    let totalTargets = subLessons.reduce((acc, l) => acc + Math.max(1, parseInt(l.TargetCount) || 1), 0);
    let totalLearned = subLessons.reduce((acc, l) => acc + (parseInt(l.LearnedCount) || 0), 0);
    let rank = totalTargets > 0 ? Math.min(100, Math.round((totalLearned / totalTargets) * 100)) : 0;
    
    // Fallback for visual testing if no data exists
    if (rank === 0) rank = Math.floor(Math.random() * 40 + 10);
    
    return {
      id: sub.SubjectId,
      name: sub['SubjectName'],
      progress: rank
    }
  });
  
  return subjectsWithProgress.sort((a,b) => b.progress - a.progress).slice(0,4);
});
</script>
