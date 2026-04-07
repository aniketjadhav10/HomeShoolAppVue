<template>
  <section class="bg-slate-50/10 min-h-full space-y-4 md:space-y-8" key="lesson-detail">
    <!-- Mobile Sticky Back Header -->
    <div class="md:hidden flex items-center justify-start mb-2">
      <button @click="$emit('close')" class="text-blue-600 text-sm font-bold bg-white/80 p-2.5 px-4 rounded-xl shadow-sm border border-blue-200 active:scale-95 flex items-center gap-2">
        <i class="fa-solid fa-arrow-left"></i> Back
      </button>
    </div>
    
    <!-- Desktop Back Button -->
    <button @click="$emit('close')" class="hidden md:flex text-slate-500 hover:text-blue-600 font-bold transition-all items-center gap-2 group outline-none bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:shadow-md active:scale-95 backdrop-blur w-fit">
      <i class="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> Back
    </button>
    
    <!-- Hero Card -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 md:p-12 rounded-[1.5rem] md:rounded-[2rem] shadow-xl relative overflow-hidden group">
      <div class="absolute top-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-blue-500/10 blur-[60px] rounded-full md:group-hover:scale-110 transition-transform duration-1000 -mr-20 -mt-20 pointer-events-none"></div>
      <span class="text-[9px] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-white shadow-sm border border-blue-100 px-2.5 py-1 rounded-lg mb-3 md:mb-4 inline-block">{{ lesson.SubjectName }}</span>
      <h2 class="text-2xl md:text-6xl font-black text-slate-800 leading-tight mb-3 md:mb-4 break-words drop-shadow-sm w-full">{{ lesson['Lesson Name'] }}</h2>
      <p class="text-slate-600 text-xs md:text-xl max-w-3xl leading-relaxed font-medium block">{{ lesson.Description }}</p>
    </div>

    <!-- Planning / Goals Section -->
    <div class="bg-white/80 backdrop-blur rounded-[1.5rem] border border-slate-200 p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-2">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <label class="text-sm font-black text-slate-600 w-28 shrink-0">Target Sessions:</label>
        <div class="flex items-center gap-3">
          <button @click="updateTarget(-1)" :disabled="dataStore.saving" class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold outline-none active:scale-90 transition-all"><i class="fa-solid fa-minus text-xs"></i></button>
          <span class="text-xl font-black text-slate-800 w-8 text-center">{{ Math.max(1, parseInt(lesson.TargetCount) || 1) }}</span>
          <button @click="updateTarget(1)" :disabled="dataStore.saving" class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold outline-none active:scale-90 transition-all"><i class="fa-solid fa-plus text-xs"></i></button>
        </div>
      </div>
      
      <div class="h-px md:h-12 w-full md:w-px bg-slate-200 shrink-0"></div>

      <div class="flex items-center justify-between gap-4 w-full md:w-auto">
        <div>
          <h4 class="font-bold text-slate-800">Learn This Week</h4>
          <p class="text-xs text-slate-500 font-medium">Pin to your weekly dashboard focus area.</p>
        </div>
        <button @click="toggleWeekly" :disabled="dataStore.saving" :class="normalizeBool(lesson.LearnInThisWeek) ? 'bg-amber-100 text-amber-600 border border-amber-200 shadow-amber-500/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'" class="px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-sm outline-none active:scale-95 shrink-0">
          <i :class="['fa-solid mr-1.5', normalizeBool(lesson.LearnInThisWeek) ? 'fa-star' : 'fa-calendar-plus']"></i> 
          {{ normalizeBool(lesson.LearnInThisWeek) ? 'Pinned Week' : 'Add to Week' }}
        </button>
      </div>
    </div>

    <!-- Task Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 pt-1 md:pt-2">
      <h3 class="text-lg md:text-3xl font-black text-slate-800 flex items-center gap-2 md:gap-3"><div class="p-1.5 md:p-2 bg-blue-100 rounded-lg"><i class="fa-solid fa-list-check text-blue-500 text-sm md:text-base"></i></div> Needs Doing</h3>
      <button @click="handleGenerateAI" :disabled="dataStore.saving" class="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 md:py-3.5 rounded-2xl font-black shadow-xl shadow-purple-600/30 transition-all outline-none disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3 active:scale-95 text-sm md:text-base">
        <i class="fa-solid fa-wand-magic-sparkles"></i> AI Generator
      </button>
    </div>

    <!-- Task Creator Form -->
    <form @submit.prevent="addTask" class="bg-white/80 backdrop-blur border border-slate-200 p-4 md:p-5 rounded-3xl flex flex-col md:flex-row items-stretch gap-3 md:gap-4 shadow-xl shadow-slate-200/50">
      <div class="flex-1">
        <label class="block text-[10px] md:text-xs font-black text-slate-500 mb-1.5 md:mb-2 uppercase tracking-widest pl-1">New Task</label>
        <input v-model="newTask.name" type="text" placeholder="Task name..." required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold shadow-inner" />
      </div>
      <div class="flex-1">
        <label class="block text-[10px] md:text-xs font-black text-slate-500 mb-1.5 md:mb-2 uppercase tracking-widest pl-1">Target / Notes</label>
        <input v-model="newTask.notes" type="text" placeholder="Optional details..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold shadow-inner" />
      </div>
      <button type="submit" :disabled="dataStore.saving" class="bg-blue-600 hover:bg-blue-500 text-white mt-1 md:mt-auto px-6 py-3 md:py-4 rounded-xl font-black text-sm md:text-base shadow-lg shadow-blue-500/30 transition-all outline-none disabled:opacity-50 w-full md:w-auto flex items-center justify-center active:scale-95">
        <i class="fa-solid fa-plus md:hidden mr-2"></i> ADD
      </button>
    </form>

    <!-- Tasks Block -->
    <div class="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <transition-group name="list" tag="div" class="flex flex-col">
        <div v-if="lessonSelectedTasks.length === 0" key="empty" class="py-12 text-sm text-center text-slate-500 italic bg-slate-50">No sub-tasks attached.</div>
        
        <div v-for="task in lessonSelectedTasks" :key="task.LessonTaskId" class="flex items-center justify-between p-3 md:p-5 border-b border-slate-100 last:border-0 bg-white transition-all duration-300 md:hover:bg-slate-50 group gap-3 md:gap-4 relative" :class="{ 'bg-emerald-50': isTaskDone(task) }">
          <div class="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
            <input type="checkbox" :checked="isTaskDone(task)" @change="toggleTaskDone(task)" class="shrink-0 mt-1 md:mt-1.5 w-5 h-5 md:w-7 md:h-7 rounded border-slate-300 bg-slate-50 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer shadow-sm transition-transform active:scale-75" />
            <div class="min-w-0">
              <h4 class="text-sm md:text-xl font-bold text-slate-800 transition-all break-words" :class="{ 'line-through text-slate-500 decoration-slate-400': isTaskDone(task) }">{{ task['Task Name'] }}</h4>
              <p v-if="task.Notes" class="text-[10px] md:text-sm font-medium text-slate-500 mt-1 md:mt-2 bg-slate-50 inline-block px-2 py-1 rounded-lg border border-slate-100 truncate w-full md:max-w-max md:w-auto">{{ task.Notes }}</p>
            </div>
          </div>

        </div>
      </transition-group>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { dataStore, dispatchAction } from '../../stores/dataStore';

const props = defineProps({
  lesson: {
    type: Object,
    required: true
  }
});
defineEmits(['close']);

const newTask = ref({ name: '', notes: '' });

const normalizeBool = (v) => v === true || (typeof v === 'string' && v.trim().toUpperCase() === 'TRUE');

const updateTarget = async (increment) => {
  const current = Math.max(1, parseInt(props.lesson.TargetCount) || 1);
  const newTarget = Math.max(1, current + increment);
  await dispatchAction('updateLesson', props.lesson.LessonId, props.lesson.Status, props.lesson.LearnInThisWeek, props.lesson.LearnedCount, newTarget);
};

const toggleWeekly = async () => {
  const isWeekly = normalizeBool(props.lesson.LearnInThisWeek);
  const newStatus = isWeekly ? props.lesson.Status : 'In Progress';
  await dispatchAction('updateLesson', props.lesson.LessonId, newStatus, !isWeekly, props.lesson.LearnedCount, props.lesson.TargetCount);
};

const isTaskDone = (task) => {
  return parseInt(task.Progress) === 100 || normalizeBool(task.LearnedToday);
};

const lessonSelectedTasks = computed(() => {
  if (!props.lesson) return [];
  const tasks = (dataStore.state.tasks || []).filter(t => t.LessonId === props.lesson.LessonId);
  return tasks.sort((a,b) => {
    return isTaskDone(a) === isTaskDone(b) ? 0 : isTaskDone(a) ? 1 : -1;
  });
});

const toggleTaskDone = async (task) => {
  const done = isTaskDone(task);
  const newProgress = done ? 0 : 100;
  task.Progress = newProgress;
  task.LearnedToday = done ? "FALSE" : "TRUE";
  
  if (!done && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
  
  await dispatchAction('updateTask', task.LessonTaskId, task.LessonId, task.LessonName || 'Lesson', newProgress, !done);
};

const addTask = async () => {
  if (!props.lesson) return;
  await dispatchAction('saveLessonTask', null, props.lesson.LessonId, newTask.value.name, newTask.value.notes, 0);
  newTask.value = { name: '', notes: '' };
};


const handleGenerateAI = async () => {
  const age = prompt("Child age?", "2");
  if(age) {
    await dispatchAction('generateLessonTasksWithGemini', props.lesson.LessonId, props.lesson['Lesson Name'], age);
  }
};
</script>
