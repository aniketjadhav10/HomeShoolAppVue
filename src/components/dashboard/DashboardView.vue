<template>
  <div>
    <!-- SKELETON LOADER -->
    <section v-if="dataStore.loading && (!dataStore.state.lessons || dataStore.state.lessons.length === 0)" class="space-y-4 md:space-y-8 animate-pulse pt-4">
      <!-- Skeleton Top Nav Chips -->
      <div class="flex gap-3 overflow-hidden">
        <div class="h-14 w-28 md:h-16 md:w-32 bg-slate-200/50 rounded-2xl shrink-0"></div>
        <div class="h-14 w-28 md:h-16 md:w-32 bg-slate-200/50 rounded-2xl shrink-0"></div>
        <div class="h-14 w-28 md:h-16 md:w-32 bg-slate-200/50 rounded-2xl shrink-0"></div>
      </div>
      <!-- Skeleton Focus Area -->
      <div class="h-6 w-32 bg-slate-200/50 rounded-md mb-4 mt-8"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="h-32 bg-slate-200/50 rounded-3xl"></div>
        <div class="h-32 bg-slate-200/50 rounded-3xl hidden md:block"></div>
      </div>
      <!-- Skeleton Tasks -->
      <div class="h-6 w-40 bg-slate-200/50 rounded-md mb-4 mt-8"></div>
      <div class="bg-slate-100/50 rounded-[1.5rem] p-6 space-y-4">
        <div class="h-12 bg-slate-200/50 rounded-xl"></div>
        <div class="h-12 bg-slate-200/50 rounded-xl w-5/6"></div>
        <div class="h-12 bg-slate-200/50 rounded-xl w-4/6"></div>
      </div>
    </section>

  <section v-else class="space-y-4 md:space-y-8" key="dashboard">
    <!-- Contextual Intelligence Alerts -->
    <div v-if="contextualAlerts.length" class="flex flex-col gap-2 animate-slide-down">
      <div v-for="(alert, index) in contextualAlerts" :key="'alert-'+index" :class="[
        'flex items-center gap-3 p-3 md:p-4 rounded-2xl shadow-sm border font-bold text-xs md:text-sm',
        alert.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
        alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
        'bg-blue-50 text-blue-700 border-blue-200'
      ]">
        <i :class="['fa-solid', alert.icon, 'text-lg']"></i>
        <span>{{ alert.message }}</span>
      </div>
    </div>

    <!-- Metrics grid -->
    <div class="-mx-3 px-3 md:mx-0 md:px-0 flex overflow-x-auto md:grid md:grid-cols-3 gap-3 md:gap-4 pb-2 md:pb-0 animate-slide-up snap-x snap-mandatory scrollbar-hide" style="animation-delay: 50ms;">
        <!-- All Tasks Filter -->
      <div @click="taskFilter = 'all'" :class="[taskFilter === 'all' ? 'ring-2 ring-blue-500 bg-white shadow-md scale-100 md:scale-105' : 'bg-white/70 hover:bg-white border-transparent', 'border border-slate-200 cursor-pointer transition-all duration-300 rounded-2xl p-2 md:p-3 flex items-center gap-2.5 shrink-0 snap-center shadow-sm w-[150px] md:w-auto']">
        <div :class="[taskFilter === 'all' ? 'bg-blue-600 text-white shadow-inner' : 'bg-slate-100 text-slate-600', 'w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm md:text-base transition-colors shrink-0']">
          {{ activeLessonsThisWeek.length }}
        </div>
        <span class="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-slate-600 leading-tight">Learn<br>Weekly</span>
      </div>
      
      <!-- In Progress Filter -->
      <div @click="taskFilter = 'incomplete'" :class="[taskFilter === 'incomplete' ? 'ring-2 ring-pink-500 bg-white shadow-md scale-100 md:scale-105' : 'bg-white/70 hover:bg-white border-transparent', 'border border-slate-200 cursor-pointer transition-all duration-300 rounded-2xl p-2 md:p-3 flex items-center gap-2.5 shrink-0 snap-center shadow-sm w-[150px] md:w-auto']">
        <div :class="[taskFilter === 'incomplete' ? 'bg-pink-500 text-white shadow-inner' : 'bg-slate-100 text-slate-600', 'w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm md:text-base transition-colors shrink-0']">
          {{ inProgressTopicsCount }}
        </div>
        <span class="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-slate-600 leading-tight">Active<br>Topics</span>
      </div>

      <!-- Complete Filter -->
      <div @click="taskFilter = 'complete'" :class="[taskFilter === 'complete' ? 'ring-2 ring-emerald-500 bg-white shadow-md scale-100 md:scale-105' : 'bg-white/70 hover:bg-white border-transparent', 'border border-slate-200 cursor-pointer transition-all duration-300 rounded-2xl p-2 md:p-3 flex items-center gap-2.5 shrink-0 snap-center shadow-sm w-[150px] md:w-auto']">
        <div :class="[taskFilter === 'complete' ? 'bg-emerald-500 text-white shadow-inner' : 'bg-slate-100 text-slate-600', 'w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm md:text-base transition-colors shrink-0']">
          {{ completedTopicsCount }}
        </div>
        <span class="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-slate-600 leading-tight">Completed<br>Topics</span>
      </div>
    </div>

    <!-- Priority -->
    <div class="animate-slide-up" style="animation-delay: 100ms;">
      <h3 class="text-lg md:text-xl font-bold flex items-center gap-2 mb-3 md:mb-5 text-slate-800"><i class="fa-solid fa-calendar-week text-blue-500 p-1.5 bg-blue-100 rounded-lg text-sm"></i> Focus Area</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        <transition-group name="list">
          <div v-if="activeLessonsThisWeek.length === 0" key="empty" class="col-span-full py-8 text-center text-slate-500 bg-white/50 italic border border-dashed border-slate-300 rounded-3xl shadow-sm">
            No lessons marked for focus this week.
          </div>
          <div v-for="lesson in activeLessonsThisWeek" :key="lesson.LessonId" @click="$emit('open-lesson', lesson)" class="bg-white/80 hover:bg-white border border-slate-200 p-4 rounded-3xl cursor-pointer transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-xl shadow-sm shadow-blue-500/5 group flex flex-col h-full">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 shrink-0">{{ lesson.SubjectName }}</span>
              <span class="text-[10px] md:text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded shrink-0 border border-blue-100">{{ parseInt(lesson.LearnedCount) || 0 }} / {{ Math.max(1, parseInt(lesson.TargetCount) || 1) }} Done</span>
            </div>
            <h4 class="text-base md:text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{{ lesson['Lesson Name'] }}</h4>
            <p class="text-[11px] md:text-sm text-slate-500 mt-1 line-clamp-2 font-medium flex-1">{{ lesson.Description || 'No description provided.' }}</p>
            
            <div class="mt-4 flex flex-col gap-3">
              <button @click.stop="markLearnedToday(lesson)" :disabled="getLessonProgress(lesson) >= 100" class="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm">
                 <i class="fa-solid fa-check-double mr-1"></i> Learned Today (+1)
              </button>
              
              <div class="bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden shadow-inner">
                <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-1000 ease-out" :style="{ width: `${getLessonProgress(lesson)}%` }"></div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Weekly Tasks List -->
    <div class="animate-slide-up" style="animation-delay: 150ms;">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-5 gap-3">
        <h3 class="text-lg md:text-xl font-bold flex items-center gap-2 text-slate-800"><i class="fa-solid fa-list-check text-emerald-500 p-1.5 bg-emerald-100 rounded-lg text-sm"></i> Filtered Tasks</h3>
        <div class="flex bg-slate-200 p-1 rounded-xl border border-slate-200/50 shadow-inner w-full md:w-auto overflow-x-auto scrollbar-hide shrink-0">
          <button @click="taskFilter = 'all'" :class="['flex-1 md:flex-none text-[11px] md:text-xs px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-bold transition-all outline-none whitespace-nowrap active:scale-95', taskFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">All</button>
          <button @click="taskFilter = 'incomplete'" :class="['flex-1 md:flex-none text-[11px] md:text-xs px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-bold transition-all outline-none whitespace-nowrap active:scale-95', taskFilter === 'incomplete' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Pending</button>
          <button @click="taskFilter = 'complete'" :class="['flex-1 md:flex-none text-[11px] md:text-xs px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-bold transition-all outline-none whitespace-nowrap active:scale-95', taskFilter === 'complete' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Done</button>
        </div>
      </div>
      
      <div class="bg-white/80 border border-slate-200 rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden backdrop-blur-xl">
        <transition-group name="list">
          <div v-if="weekTasksFiltered.length === 0" key="empty" class="py-10 text-center text-[13px] md:text-sm text-slate-500 italic bg-slate-50/50">No tasks match this filter.</div>
          
          <div v-for="task in weekTasksFiltered" :key="task.LessonTaskId" class="flex items-center gap-3 md:gap-4 p-3 md:p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group active:bg-slate-100" :class="{ 'opacity-60 bg-slate-50/50': isTaskDone(task) }">
            <input type="checkbox" :checked="isTaskDone(task)" @change="toggleTaskDone(task)" class="shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-slate-300 bg-white text-emerald-500 focus:ring-emerald-500/40 cursor-pointer shadow-sm transition-transform active:scale-75" />
            <div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
              <div class="min-w-0">
                <h4 class="font-bold text-slate-800 transition-all text-sm md:text-lg truncate" :class="{ 'line-through text-slate-500 decoration-slate-400': isTaskDone(task) }">{{ task['Task Name'] }}</h4>
                <span class="text-[9px] md:text-xs font-black tracking-widest text-slate-400 uppercase mt-0.5 block truncate">{{ getLesson(task.LessonId)?.SubjectName }} • {{ getLesson(task.LessonId)?.['Lesson Name'] }}</span>
              </div>
              <div class="flex items-center gap-2 md:gap-3 shrink-0 self-start md:self-auto">
                <span class="text-[10px] md:text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-200 shadow-sm">{{ parseInt(task.Progress) || 0 }}%</span>
                <!-- Quick Action Jump Button -->
                <button @click="$emit('open-lesson', getLesson(task.LessonId))" class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-200 shadow-sm active:scale-90" title="Quick Jump to Lesson">
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px] md:text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { dataStore, dispatchAction } from '../../stores/dataStore';

defineEmits(['open-lesson']);

const taskFilter = ref('incomplete');

const normalizeBool = (v) => v === true || (typeof v === 'string' && v.trim().toUpperCase() === 'TRUE');
const normalizeStatus = (v) => (v ?? '').toString().trim().toLowerCase();

const activeLessonsThisWeek = computed(() => {
  return (dataStore.state.lessons || []).filter(l => normalizeBool(l.LearnInThisWeek));
});

const inProgressTopicsCount = computed(() => {
  return (dataStore.state.lessons || []).filter(l => normalizeStatus(l.Status) === 'in progress').length;
});

const completedTopicsCount = computed(() => {
  return (dataStore.state.lessons || []).filter(l => getLessonProgress(l) === 100 || normalizeStatus(l.Status) === 'completed').length;
});

const isTaskDone = (task) => {
  return parseInt(task.Progress) === 100 || normalizeBool(task.LearnedToday);
};

const weekTasksFiltered = computed(() => {
  const weekLessonIds = new Set(activeLessonsThisWeek.value.map(l => l.LessonId));
  let wTasks = (dataStore.state.tasks || []).filter(t => weekLessonIds.has(t.LessonId));
  if (taskFilter.value === 'incomplete') {
    wTasks = wTasks.filter(t => !isTaskDone(t));
  } else if (taskFilter.value === 'complete') {
    wTasks = wTasks.filter(t => isTaskDone(t));
  }
  return wTasks;
});

const getLesson = (id) => dataStore.state.lessons.find(l => l.LessonId === id);

const getLessonProgress = (lesson) => {
  const target = Math.max(1, parseInt(lesson.TargetCount) || 1);
  const learned = parseInt(lesson.LearnedCount) || 0;
  return Math.min(100, Math.round((learned / target) * 100));
};

const markLearnedToday = async (lesson) => {
  if (getLessonProgress(lesson) >= 100) return;
  
  const newLearnedCount = (parseInt(lesson.LearnedCount) || 0) + 1;
  const newStatus = (newLearnedCount >= (parseInt(lesson.TargetCount) || 1)) ? 'Completed' : 'In Progress';
  if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]); // Nice haptic burst
  await dispatchAction('updateLesson', lesson.LessonId, newStatus, lesson.LearnInThisWeek, newLearnedCount, lesson.TargetCount);
};

const toggleTaskDone = async (task) => {
  const done = isTaskDone(task);
  const newProgress = done ? 0 : 100;
  task.Progress = newProgress;
  task.LearnedToday = done ? "FALSE" : "TRUE";
  
  if (!done && 'vibrate' in navigator) {
    navigator.vibrate(50); // Haptic feedback on completion
  }
  
  await dispatchAction('updateTask', task.LessonTaskId, task.LessonId, task.LessonName || 'Lesson', newProgress, !done);
};

const contextualAlerts = computed(() => {
  const alerts = [];
  
  // Tasks pending status
  const weekTasks = (dataStore.state.tasks || []).filter(t => new Set(activeLessonsThisWeek.value.map(l => l.LessonId)).has(t.LessonId));
  const pendingCount = weekTasks.filter(t => !isTaskDone(t)).length;
  
  if (pendingCount > 0) {
    alerts.push({
      type: 'warning',
      icon: 'fa-triangle-exclamation',
      message: `${pendingCount} tasks are still pending this week.`
    });
  } else if (weekTasks.length > 0) {
    alerts.push({
      type: 'success',
      icon: 'fa-award',
      message: `All caught up! You finished every marked task this week.`
    });
  }

  // Lagging progress intelligence
  const laggingLessons = activeLessonsThisWeek.value.filter(l => getLessonProgress(l) < 30);
  if (laggingLessons.length > 0) {
    alerts.push({
      type: 'info',
      icon: 'fa-chart-line',
      message: `${laggingLessons[0].SubjectName} (${laggingLessons[0]['Lesson Name']}) progress is lagging under 30%.`
    });
  }
  
  return alerts;
});
</script>
