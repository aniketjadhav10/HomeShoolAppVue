<template>
  <section class="bg-slate-50/10 min-h-full space-y-4 md:space-y-8 pb-32 md:pb-8" key="lesson-detail">
    <!-- Sticky Header (Desktop Only) -->
    <div class="hidden md:flex sticky top-0 z-10 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-[1.5rem] shadow-sm items-center gap-4 mb-4">
      <button @click="$emit('close')" class="text-slate-500 hover:text-blue-600 font-bold transition-all flex items-center gap-2 group outline-none bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md active:scale-95 shrink-0">
        <i class="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> <span>Back</span>
      </button>
      <div class="flex-1 min-w-0">
        <h2 class="text-xl font-black text-slate-800 truncate leading-tight">{{ lesson['LessonName'] }}</h2>
      </div>
    </div>

    <!-- COMPACT SCHEDULING PREVIEW -->
    <div class="grid grid-cols-3 gap-2 pb-2">
       <div class="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 shadow-sm">
          <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black shadow-inner">
             {{ parseInt(lesson.LearnedCount) || 0 }}
          </div>
          <div class="flex flex-col items-center flex-1 w-full justify-end">
             <span class="text-[7px] font-black text-slate-400 uppercase leading-none tracking-[0.1em] scale-90 sm:scale-100">Target</span>
             <span class="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-tight mt-0.5">{{ Math.max(1, parseInt(lesson.TargetCount) || 1) }} Sess</span>
          </div>
       </div>

       <div v-if="lesson.Status" class="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 shadow-sm">
          <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-[10px] shadow-inner border', getStatusColorClasses(lesson.Status)]">
             <i class="fa-solid fa-award"></i>
          </div>
          <div class="flex flex-col items-center flex-1 w-full justify-end">
             <span class="text-[7px] font-black text-slate-400 uppercase leading-none tracking-[0.1em] scale-90 sm:scale-100">Status</span>
             <span class="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-tight mt-0.5 max-w-[80px] truncate text-center">{{ lesson.Status }}</span>
          </div>
       </div>

       <div v-if="lesson.BlockType" class="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 shadow-sm">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-sm shadow-inner border border-emerald-100">
             {{ getBlockEmoji(lesson.BlockType) }}
          </div>
          <div class="flex flex-col items-center flex-1 w-full justify-end overflow-hidden">
             <span class="text-[7px] font-black text-slate-400 uppercase leading-none tracking-[0.1em] scale-90 sm:scale-100">Block</span>
             <span class="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-tight mt-0.5 max-w-full truncate text-center">{{ getBlockLabel(lesson.BlockType).split(' ')[0] }}</span>
          </div>
       </div>
    </div>

    <!-- Hero Card: Subject & Description -->
    <div v-if="lesson.SubjectName || lesson.Description" class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 md:p-6 rounded-[1.5rem] shadow-sm relative overflow-hidden group mb-4">
      <div class="absolute top-0 right-0 w-32 h-32 md:w-60 md:h-60 bg-blue-500/10 blur-[40px] rounded-full transition-transform duration-1000 -mr-10 -mt-10 pointer-events-none"></div>
      <span v-if="lesson.SubjectName" class="text-[9px] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-white shadow-sm border border-blue-100 px-2.5 py-1 rounded-lg mb-2 inline-block">{{ lesson.SubjectName }}</span>
      <p v-if="lesson.Description" class="text-slate-600 text-sm md:text-base max-w-3xl leading-relaxed font-medium block">{{ lesson.Description }}</p>
    </div>

    <!-- Task Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 pt-1 md:pt-2">
      <h3 class="text-base md:text-xl font-black text-slate-800 flex items-center gap-2 md:gap-3">
        <div class="p-1.5 md:p-2 bg-blue-100 rounded-lg"><i class="fa-solid fa-list-check text-blue-500 text-xs md:text-sm"></i></div>
        Needs Doing
      </h3>
      <div class="flex items-center gap-2 w-full md:w-auto">
        <button @click="showTaskForm = true" class="flex-1 md:flex-none bg-blue-600 text-white px-5 py-3 md:py-3.5 rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all outline-none active:scale-95 text-sm md:text-base flex items-center justify-center gap-2">
          <i class="fa-solid fa-plus"></i> Add
        </button>
        <button @click="handleGenerateAI" :disabled="dataStore.saving" class="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 md:py-3.5 rounded-2xl font-black shadow-lg shadow-purple-600/30 transition-all outline-none disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate
        </button>
      </div>
    </div>

    <!-- FIXED FLOATING HUB BUTTON (FAB) - Teleported to body to bypass stacking contexts -->
    <teleport to="body">
      <div class="fixed bottom-24 right-6 z-[190] flex flex-col items-end gap-3 pointer-events-none">
          <button 
            @click.stop="$emit('open-schedule')"
            class="w-16 h-16 rounded-[2.2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-500/50 flex items-center justify-center relative group active:scale-90 transition-all overflow-hidden border border-white/10 pointer-events-auto"
          >
            <!-- Shimmer Effect -->
            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div class="relative flex items-center justify-center">
               <i class="fa-solid fa-calendar-plus text-2xl transition-transform group-hover:scale-110"></i>
               <!-- Active Pulse Dot -->
               <div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-4 border-indigo-600 animate-pulse"></div>
            </div>
          </button>
      </div>
    </teleport>

    <!-- ✅ Dedicated Forms & Drawers -->
    <TaskForm v-model="showTaskForm" :lesson="lesson" />

    <!-- Tasks Block -->
    <div class="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <transition-group name="list" tag="div" class="flex flex-col">
        <div v-if="lessonSelectedTasks.length === 0" key="empty" class="py-12 text-sm text-center text-slate-500 italic bg-slate-50">No sub-tasks attached.</div>
        <div
          v-for="task in lessonSelectedTasks"
          :key="task.LessonTaskId"
          class="flex flex-col p-3 md:p-5 border-b border-slate-100 last:border-0 bg-white transition-all duration-300 md:hover:bg-slate-50 group gap-2"
        >
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="pt-0.5 text-blue-400">
               <i class="fa-solid fa-circle-check text-base opacity-70"></i>
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-[13px] md:text-base font-bold text-slate-800 transition-all break-words">{{ task['TaskName'] }}</h4>
              <p v-if="task.Notes" class="text-[9px] md:text-xs font-medium text-slate-500 mt-1 bg-slate-50 inline-block px-2.5 py-1.5 rounded-lg border border-slate-100 w-full">{{ task.Notes }}</p>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Hidden File Input for Camera -->
    <input
      type="file"
      ref="fileInputRef"
      class="hidden"
      accept="image/*"
      capture="environment"
      @change="onFileSelected"
    />

  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { dataStore } from '../../stores/dataStore';
import { lessonRepository } from '../../repositories/lessonRepository';
import { taskRepository } from '../../repositories/taskRepository';

// ✅ Import dedicated form component
import TaskForm from './TaskForm.vue';

// ✅ Import shared composables
import { 
  normalizeBool, 
  normalizeStatusForSelect, 
  STATUS_LEVELS,
  LESSON_BLOCKS,
  getStatusColorClasses
} from '../../composables/useLessonStatus';

/**
 * LessonDetailView.vue
 *
 * Displays the full detail of a selected lesson. Scheduling and settings
 * have been moved to LessonScheduleDrawer for a cleaner mobile-first experience.
 */
const props = defineProps({
  lesson: { type: Object, required: true }
});
defineEmits(['close', 'open-schedule']);

// ── Local UI state ───────────────────────────────────────────────────────────
const showTaskForm = ref(false);
const uploadingTaskId = ref(null);
const fileInputRef = ref(null);
const currentTaskForPhoto = ref(null);

// ── Helpers ──────────────────────────────────────────────────────────────────
const getBlockEmoji = (blockId) => LESSON_BLOCKS.find(b => b.id === blockId)?.emoji || '📅';
const getBlockLabel = (blockId) => LESSON_BLOCKS.find(b => b.id === blockId)?.label || 'Unknown Block';

const lessonSelectedTasks = computed(() => {
  if (!props.lesson) return [];
  return taskRepository.getTasksByLesson(props.lesson.LessonId);
});

// ── AI Generation ────────────────────────────────────────────────────────────
const handleGenerateAI = async () => {
  const age = prompt('Child age?', '2');
  if (age) {
    await taskRepository.generateTasksWithAi(props.lesson.LessonId, props.lesson['LessonName'], age);
  }
};
</script>
