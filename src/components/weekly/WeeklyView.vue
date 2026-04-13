<template>
  <section class="space-y-6 animate-slide-up" key="weekly">
    <!-- Header -->
    <div class="flex items-center justify-between px-1">
      <h2 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
        <div class="p-2 bg-indigo-50 rounded-2xl">
          <i class="fa-solid fa-calendar-check text-indigo-600 text-sm"></i>
        </div>
        This Week
      </h2>
      <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-1.5">
        <span class="text-indigo-600">{{ completedWeeklyCount }}</span>
        <span class="opacity-30">/</span>
        {{ weeklyLessons.length }} Lessons
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="weeklyLessons.length === 0" class="bg-white/60 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-16 px-8 text-center animate-fade-in">
      <div class="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
        <span class="text-4xl text-indigo-500 opacity-40">🖇️</span>
      </div>
      <h3 class="text-lg font-black text-slate-800 mb-2">No weekly plan yet</h3>
      <p class="text-slate-500 text-sm max-w-[240px] mx-auto font-medium leading-relaxed italic">
        "The secret of getting ahead is getting started." 
      </p>
      <p class="text-[11px] text-slate-400 mt-4 leading-relaxed">
        Head over to the <span class="font-bold text-blue-500 cursor-pointer" @click="$emit('set-tab', 'lessons')">Learn</span> section and toggle "Weekly" on for your favorites.
      </p>
    </div>

    <!-- Categorized/Subject-based List -->
    <div v-else class="space-y-8 pb-32">
       <div v-for="(lessons, subject) in lessonsBySubject" :key="subject" class="space-y-4">
          <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-2">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            {{ subject }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="lesson in lessons" :key="lesson.LessonId" class="bg-white rounded-[2rem] border border-slate-200/60 p-5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
               <div class="flex items-start justify-between gap-4 mb-4">
                 <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border" :class="getStatusColorClasses(lesson.Status)">
                        {{ lesson.Status || 'Dormant' }}
                      </span>
                      <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {{ parseInt(lesson.LearnedCount) || 0 }} / {{ parseInt(lesson.TargetCount) || 1 }} sessions
                      </span>
                      
                      <span v-if="lesson.InterestLevel === 'Low'" class="text-[18px]" title="Needs extra fun!">😴</span>
                    </div>
                    
                    <h4 class="text-base font-black text-slate-800 leading-tight mb-1 truncate">{{ lesson['LessonName'] }}</h4>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <i class="fa-solid fa-clock text-[9px] opacity-40"></i>
                      Next Due: {{ formatDate(lesson.NextDueDate) }}
                    </p>
                 </div>
                 <button 
                  @click="$emit('open-lesson', lesson)"
                  class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0"
                >
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
               </div>

               <div class="mt-auto flex flex-col pt-4 border-t border-slate-50 gap-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 truncate flex-1 min-w-0">
                      <i class="fa-solid" :class="getBlockEmoji(lesson.BlockType)"></i>
                      <span class="truncate">{{ lesson.BlockType || 'Any Block' }}</span>
                    </div>
                    
                    <button 
                      @click="handleMarkDone(lesson)"
                      :disabled="dataStore.saving || (isPracticedToday(lesson) && !isDueToday(lesson))"
                      class="px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-slate-200 shrink-0 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                      :class="[
                        isOverdue(lesson) && !isPracticedToday(lesson) 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-slate-900 text-white hover:bg-blue-600'
                      ]"
                    >
                      <i class="fa-solid" :class="isPracticedToday(lesson) && !isDueToday(lesson) ? 'fa-check' : 'fa-check text-[9px]'"></i>
                      {{ isOverdue(lesson) && !isPracticedToday(lesson) ? 'Overdue' : 'Done Today' }}
                    </button>
                  </div>

                  <!-- Task Count & Expand Toggle -->
                  <div class="flex items-center justify-between px-1 pt-1 border-t border-slate-50/50">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <i class="fa-solid fa-list-check opacity-50"></i>
                      Tasks: {{ getTaskSummary(lesson.LessonId) }}
                    </span>
                    <button 
                      @click="toggleTasks(lesson.LessonId)"
                      class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                      :class="{ 'rotate-180 bg-indigo-50 text-indigo-600': expandedLessons.has(lesson.LessonId) }"
                    >
                      <i class="fa-solid fa-chevron-down text-[10px]"></i>
                    </button>
                  </div>
               </div>

               <!-- Expanded Task List -->
               <transition name="list">
                 <div v-if="expandedLessons.has(lesson.LessonId)" class="mt-4 space-y-2 border-t border-slate-50 pt-4 animate-in fade-in slide-in-from-top-2">
                   <div v-if="getLessonTasks(lesson.LessonId).length === 0" class="text-[10px] text-slate-400 italic py-2 text-center">No tasks found.</div>
                   <div 
                    v-for="task in getLessonTasks(lesson.LessonId)" 
                    :key="task.LessonTaskId"
                    class="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-slate-100/50 hover:bg-slate-50/50 transition-colors"
                    :class="{ 'bg-emerald-50/30 border-emerald-100/50': isTaskDone(task) }"
                   >
                     <div class="min-w-0 flex-1">
                       <p class="text-[11px] font-bold text-slate-700 truncate" :class="{ 'text-slate-400 line-through': isTaskDone(task) }">{{ task['TaskName'] }}</p>
                       <p class="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{{ task.LearnedCount || 0 }} / {{ task.TargetCount || 1 }}</p>
                     </div>
                     <div class="flex items-center gap-1.5">
                       <button 
                        @click="handleTaskCount(task, 1)"
                        :disabled="dataStore.saving"
                        class="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-sm"
                        :class="isTaskDone(task) ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400'"
                       >
                         <i class="fa-solid" :class="isTaskDone(task) ? 'fa-check text-[10px]' : 'fa-plus text-[10px]'"></i>
                       </button>
                     </div>
                   </div>
                 </div>
               </transition>
            </div>
          </div>
       </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { lessonRepository } from '../../repositories/lessonRepository';
import { getStatusColorClasses, normalizeBool } from '../../composables/useLessonStatus';
import { isPracticedToday, isDueToday, isOverdue } from '../../composables/useLessonProgress';
import { dataStore } from '../../stores/dataStore';
import { taskRepository } from '../../repositories/taskRepository';
import { ref, reactive } from 'vue';

defineProps({
  // No complex props needed as we use the repository directly
});

defineEmits(['open-lesson', 'set-tab']);

const weeklyLessons = computed(() => {
  return lessonRepository.getLessons()
    .filter(l => normalizeBool(l.LearnInThisWeek))
    .sort((a, b) => {
      const getWeight = (l) => {
        if (isPracticedToday(l)) return 2;
        if (isOverdue(l)) return 0;
        return 1;
      };
      return getWeight(a) - getWeight(b);
    });
});

const lessonsBySubject = computed(() => {
  const groups = {};
  weeklyLessons.value.forEach(l => {
    const sName = l.SubjectName || 'Uncategorized';
    if (!groups[sName]) groups[sName] = [];
    groups[sName].push(l);
  });
  return groups;
});

const completedWeeklyCount = computed(() => {
  return weeklyLessons.value.filter(l => isPracticedToday(l)).length;
});

const handleMarkDone = async (lesson) => {
  await lessonRepository.markLessonPracticed(lesson);
};

const expandedLessons = ref(new Set());

const toggleTasks = (id) => {
  if (expandedLessons.value.has(id)) expandedLessons.value.delete(id);
  else expandedLessons.value.add(id);
};

const getLessonTasks = (id) => taskRepository.getTasksByLesson(id);

const getTaskSummary = (id) => {
  const tasks = getLessonTasks(id);
  if (tasks.length === 0) return 'None';
  const completed = tasks.filter(t => isTaskDone(t)).length;
  return `${completed}/${tasks.length}`;
};

const isTaskDone = (task) => {
  const learned = parseInt(task.LearnedCount) || 0;
  const target = parseInt(task.TargetCount) || 1;
  return learned >= target || task.Status === 'Completed';
};

const handleTaskCount = async (task, increment) => {
  const current = parseInt(task.LearnedCount) || 0;
  const target = parseInt(task.TargetCount) || 1;
  const newCount = Math.max(0, current + increment);

  let newStatus = task.Status || 'Pending';
  if (newCount >= target) newStatus = 'Completed';
  else if (newCount > 0) newStatus = 'In Progress';
  else newStatus = 'Pending';

  if (increment > 0 && 'vibrate' in navigator) navigator.vibrate(50);

  await taskRepository.updateTask(
    task.LessonTaskId,
    task.LessonId,
    task.TaskName,
    newStatus,
    newCount,
    target,
    task.Photo,
    task.BlockType
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not scheduled';
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const diffTime = d - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Overdue';
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getBlockEmoji = (blockType) => {
  if (blockType?.includes('Morning')) return 'fa-sun text-amber-500';
  if (blockType?.includes('Deep')) return 'fa-brain text-blue-500';
  if (blockType?.includes('Rest')) return 'fa-moon text-purple-500';
  if (blockType?.includes('Life')) return 'fa-seedling text-emerald-500';
  return 'fa-calendar-day opacity-20';
};
</script>
