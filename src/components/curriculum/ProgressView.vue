<template>
  <div class="progress-view space-y-6 animate-slide-up">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Curriculum Progress</h2>
        <p class="text-slate-500 mt-1 font-medium text-sm md:text-base">Bird's-eye view of all lessons grouped by status.</p>
      </div>
      
      <!-- Global Search -->
      <div class="relative w-full md:w-64">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search lessons..." 
          class="w-full bg-white/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium shadow-sm backdrop-blur"
        />
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
      </div>
    </header>

    <!-- Progress Board (Kanban style) -->
    <div class="flex overflow-x-auto pb-10 gap-5 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <div 
        v-for="column in columns" 
        :key="column.status"
        class="flex-shrink-0 w-[290px] md:w-[320px] flex flex-col gap-4"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between px-2 h-10">
          <div class="flex items-center gap-2.5">
            <div :class="['w-2.5 h-2.5 rounded-full shadow-sm', column.dotColor]"></div>
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{{ column.label }}</h3>
          </div>
          <span class="text-[10px] font-black bg-slate-200/50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200/40 shadow-inner tabular-nums">{{ column.lessons.length }}</span>
        </div>

        <!-- Column Body -->
        <div class="flex flex-col gap-3 min-h-[200px] bg-slate-100/30 rounded-[2rem] p-3 border border-slate-200/40 shadow-inner">
          <div v-if="column.lessons.length === 0" class="py-16 flex flex-col items-center justify-center text-slate-300">
            <div class="w-16 h-16 bg-white/50 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <i :class="['fa-solid text-2xl opacity-20', column.icon]"></i>
            </div>
            <span class="text-[10px] font-black uppercase tracking-[0.15em] opacity-50">No Lessons</span>
          </div>
          
          <transition-group name="list">
            <div 
              v-for="lesson in column.lessons" 
              :key="lesson.LessonId"
              @click="$emit('open-lesson', lesson)"
              class="bg-white rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 border border-slate-100 transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden"
            >
              <!-- Small accent line at the bottom -->
              <div :class="['absolute bottom-0 left-0 h-1 transition-all group-hover:h-1.5', column.accentBg]" :style="{ width: `${(parseInt(lesson.LearnedCount || 0) / parseInt(lesson.TargetCount || 1)) * 100}%` }"></div>

              <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm md:text-base font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 tracking-tight">{{ lesson.LessonName }}</h4>
                    <div class="flex items-center gap-1.5 mt-1">
                       <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{{ lesson.SubjectName }}</span>
                    </div>
                  </div>
                  <div v-if="normalizeBool(lesson.LearnInThisWeek)" class="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 border border-amber-100 shrink-0 shadow-sm" title="Weekly Goal">
                    <i class="fa-solid fa-fire text-[10px]"></i>
                  </div>
                </div>
                
                <div class="flex items-center justify-between mt-1 pt-3 border-t border-slate-50 gap-3">
                   <div class="flex items-center gap-2">
                     <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter tabular-nums">{{ lesson.LearnedCount || 0 }} / {{ lesson.TargetCount || 1 }} Complete</span>
                   </div>
                   <div class="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                      <i class="fa-solid fa-chevron-right text-[10px]"></i>
                   </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
    
    <!-- Floating Hint for Desktop -->
    <div class="hidden md:flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-4 bg-white/50 backdrop-blur rounded-2xl border border-slate-200/50 shadow-sm">
       <i class="fa-solid fa-mouse-pointer opacity-50"></i>
       Scroll horizontally to see all stages
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { lessonRepository } from '../../repositories/lessonRepository';
import { STATUS_LEVELS, normalizeStatus, normalizeBool } from '../../composables/useLessonStatus';

defineEmits(['open-lesson']);

const searchQuery = ref('');

const allLessons = computed(() => lessonRepository.getLessons());

const filteredLessons = computed(() => {
  const all = allLessons.value;
  if (!searchQuery.value) return all;
  const q = searchQuery.value.toLowerCase();
  return all.filter(l => 
    (l.LessonName || '').toLowerCase().includes(q) || 
    (l.SubjectName || '').toLowerCase().includes(q)
  );
});

const getLessonsByStatus = (status) => {
  return filteredLessons.value.filter(l => normalizeStatus(l.Status) === status);
};

const columns = computed(() => [
  { 
    status: STATUS_LEVELS.INTRODUCED, 
    label: 'Introduced', 
    dotColor: 'bg-cyan-500', 
    accentBg: 'bg-cyan-500',
    icon: 'fa-wand-magic-sparkles',
    lessons: getLessonsByStatus(STATUS_LEVELS.INTRODUCED) 
  },
  { 
    status: STATUS_LEVELS.PRACTICING, 
    label: 'Practicing', 
    dotColor: 'bg-amber-500', 
    accentBg: 'bg-amber-500',
    icon: 'fa-seedling',
    lessons: getLessonsByStatus(STATUS_LEVELS.PRACTICING) 
  },
  { 
    status: STATUS_LEVELS.FAMILIAR, 
    label: 'Familiar', 
    dotColor: 'bg-indigo-500', 
    accentBg: 'bg-indigo-500',
    icon: 'fa-brain',
    lessons: getLessonsByStatus(STATUS_LEVELS.FAMILIAR) 
  },
  { 
    status: STATUS_LEVELS.MASTERED, 
    label: 'Mastered', 
    dotColor: 'bg-emerald-500', 
    accentBg: 'bg-emerald-500',
    icon: 'fa-trophy',
    lessons: getLessonsByStatus(STATUS_LEVELS.MASTERED) 
  },
  { 
    status: STATUS_LEVELS.REVISIT, 
    label: 'Revisit', 
    dotColor: 'bg-purple-500', 
    accentBg: 'bg-purple-500',
    icon: 'fa-clock-rotate-left',
    lessons: getLessonsByStatus(STATUS_LEVELS.REVISIT) 
  }
]);
</script>

<style scoped>
/* Kanban Board Scrollbar Styling */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.list-enter-active, .list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
