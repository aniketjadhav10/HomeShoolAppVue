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

    <!-- Hero Card: Subject & Description -->
    <div v-if="lesson.SubjectName || lesson.Description" class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 md:p-6 rounded-[1.5rem] shadow-sm relative overflow-hidden group mb-4">
      <div class="absolute top-0 right-0 w-32 h-32 md:w-60 md:h-60 bg-blue-500/10 blur-[40px] rounded-full transition-transform duration-1000 -mr-10 -mt-10 pointer-events-none"></div>
      <span v-if="lesson.SubjectName" class="text-[9px] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-white shadow-sm border border-blue-100 px-2.5 py-1 rounded-lg mb-2 inline-block">{{ lesson.SubjectName }}</span>
      <p v-if="lesson.Description" class="text-slate-600 text-sm md:text-base max-w-3xl leading-relaxed font-medium block">{{ lesson.Description }}</p>
    </div>

    <!-- Planning / Goals Section -->
    <div class="bg-white/80 backdrop-blur rounded-[1.5rem] border border-slate-200 p-3 md:p-4 shadow-sm flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 mb-4 mt-2">
      <div class="flex items-center gap-2 md:gap-4 shrink-0">
        <label class="text-[10px] md:text-xs font-black text-slate-600 hidden sm:block uppercase tracking-wider">Target Sessions:</label>
        <label class="text-[10px] font-black text-slate-600 sm:hidden uppercase tracking-wider">Target:</label>
        <div class="flex items-center gap-2">
          <button @click="updateTarget(-1)" class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold outline-none active:scale-90 transition-all shadow-sm">
            <i class="fa-solid fa-minus text-[10px] md:text-xs"></i>
          </button>
          <div class="flex flex-col items-center min-w-[3rem]">
            <span class="text-base md:text-lg font-black text-slate-800 leading-none">{{ parseInt(lesson.LearnedCount) || 0 }} / {{ Math.max(1, parseInt(lesson.TargetCount) || 1) }}</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sessions</span>
          </div>
          <button @click="updateTarget(1)" class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold outline-none active:scale-90 transition-all shadow-sm">
            <i class="fa-solid fa-plus text-[10px] md:text-xs"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 shadow-inner">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" :checked="normalizeBool(lesson.LearnInThisWeek)" @change="toggleWeekly" class="sr-only peer">
          <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
        </label>
        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Weekly Plan</span>
      </div>

      <div class="flex items-center justify-end gap-2 md:gap-3 flex-1 lg:flex-none w-full lg:w-auto">
        <!-- Status Selector -->
        <div class="relative w-full max-w-[140px] md:max-w-[160px]">
          <select :value="normalizeStatusForSelect(lesson.Status)" @change="handleStatusChange" class="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[10px] md:text-sm font-bold rounded-xl px-3 py-2 md:px-4 md:py-3.5 pr-8 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer disabled:opacity-50">
            <option value="">💤 Dormant</option>
            <option v-for="s in Object.values(STATUS_LEVELS)" :key="s" :value="s">{{ s }}</option>
          </select>
          <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px] md:text-xs"></i>
        </div>



      </div>
    </div>

    <!-- ─── Pedagogical Planning ─── -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] p-4 flex flex-col gap-3">
        <label class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Interest & Pace</label>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <p class="text-[10px] font-bold text-slate-500 mb-1.5 ml-1">Engagement</p>
            <div class="flex bg-white rounded-xl p-1 border border-indigo-100 shadow-sm">
              <button 
                v-for="lv in ['Low', 'Medium', 'High']" 
                :key="lv"
                @click="handleMetadataChange('InterestLevel', lv)"
                :class="[
                  'flex-1 py-2 rounded-lg text-[10px] font-black transition-all',
                  lesson.InterestLevel === lv ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:bg-indigo-50'
                ]"
              >
                {{ lv }}
              </button>
            </div>
          </div>
          <div class="w-24">
            <p class="text-[10px] font-bold text-slate-500 mb-1.5 ml-1">Interval</p>
            <div class="flex items-center gap-2 bg-white rounded-xl p-2 border border-indigo-100 shadow-sm">
              <input 
                type="number" 
                :value="lesson.RepeatInterval || 1" 
                @change="e => handleMetadataChange('RepeatInterval', parseInt(e.target.value))"
                class="w-full text-center font-black text-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Learning Block Selection -->
      <div class="bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] p-4 flex flex-col gap-3">
        <label class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Learning Block</label>
        <div class="relative w-full">
          <select :value="lesson.BlockType || ''" @change="handleBlockChange" class="w-full appearance-none bg-white border border-emerald-200 text-emerald-800 text-xs md:text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all cursor-pointer">
            <option value="" disabled>Choose Time Block...</option>
            <option v-for="b in LESSON_BLOCKS" :key="b.id" :value="b.id">{{ b.emoji }} {{ b.label }}</option>
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
             <i class="fa-solid fa-clock-rotate-left text-emerald-400 text-xs"></i>
          </div>
        </div>
        <p class="text-[9px] text-emerald-600/70 font-medium px-1 leading-tight">Determines when this lesson appears on your dashboard.</p>
      </div>

      <div class="bg-indigo-50 border border-indigo-100 rounded-[1.5rem] p-4 flex items-center justify-between group">
        <div class="space-y-1 flex-1">
          <label class="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Schedule Next</label>
          <div class="relative mt-1">
            <input 
              type="date" 
              :value="lesson.NextDueDate ? lesson.NextDueDate.split('T')[0] : ''" 
              @change="handleDateChange"
              :min="todayDate"
              class="w-full bg-white border border-indigo-100 text-slate-700 text-sm font-black rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            />
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
          📅
        </div>
      </div>
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

    <!-- Tasks Block -->
    <div class="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <transition-group name="list" tag="div" class="flex flex-col">
        <div v-if="lessonSelectedTasks.length === 0" key="empty" class="py-12 text-sm text-center text-slate-500 italic bg-slate-50">No sub-tasks attached.</div>
        <div
          v-for="task in lessonSelectedTasks"
          :key="task.LessonTaskId"
          class="flex flex-col p-3 md:p-5 border-b border-slate-100 last:border-0 bg-white transition-all duration-300 md:hover:bg-slate-50 group gap-2"
          :class="{ 'bg-emerald-50/50': isTaskDone(task) }"
        >
          <div class="flex items-center justify-between gap-3 md:gap-4 relative">
            <div class="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
              <!-- Counter Controls -->
              <div class="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <button
                  @click="handleTaskCount(task, 1)"
                  class="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 flex items-center justify-center transition-all active:scale-90 shadow-sm disabled:opacity-50"
                  :class="{ 'bg-emerald-500 text-white border-emerald-500': isTaskDone(task) }"
                >
                  <i class="fa-solid" :class="isTaskDone(task) ? 'fa-check' : 'fa-plus'"></i>
                </button>
                <span class="text-[10px] md:text-xs font-black text-slate-500 tabular-nums">
                  {{ task.LearnedCount || 0 }} / {{ task.TargetCount || 1 }}
                </span>
                <button
                  v-if="(task.LearnedCount || 0) > 0"
                  @click="handleTaskCount(task, -1)"
                  class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all active:scale-90"
                >
                  <i class="fa-solid fa-minus text-[8px]"></i>
                </button>
              </div>

              <div class="min-w-0 flex-1 pt-0.5">
                <h4 class="text-[13px] md:text-base font-bold text-slate-800 transition-all break-words" :class="{ 'text-slate-500 decoration-slate-400': isTaskDone(task) }">{{ task['TaskName'] }}</h4>
                <p v-if="task.Notes" class="text-[9px] md:text-xs font-medium text-slate-500 mt-1 bg-slate-50 inline-block px-2 py-1 rounded-lg border border-slate-100 truncate w-full md:max-w-max md:w-auto">{{ task.Notes }}</p>
              </div>
            </div>

            <!-- Action Buttons: Photo -->
            <div class="flex items-center gap-2">
              <button
                @click="triggerPhotoPicker(task)"
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-all border outline-none active:scale-90"
                :class="task.Photo ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200'"
              >
                <i class="fa-solid fa-camera" :class="{ 'fa-beat-fade': uploadingTaskId === task.LessonTaskId }"></i>
              </button>
            </div>
          </div>

          <!-- Block Type Selector -->
          <div class="flex items-center gap-1.5 pt-1 pl-11 md:pl-14 flex-wrap">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Block:</span>
            <button
              v-for="block in LEARNING_BLOCKS"
              :key="block.id"
              @click="setTaskBlock(task, block.id)"
              :title="block.label"
              :class="[
                'flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all active:scale-90 disabled:opacity-50',
                task.BlockType === block.id
                  ? block.activeClass
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              ]"
            >
              <span>{{ block.emoji }}</span>
              <span>{{ block.shortLabel }}</span>
            </button>
          </div>

          <!-- Image Preview -->
          <div v-if="task.Photo" class="mt-2 pl-11 md:pl-14">
            <div class="relative inline-block group">
              <img :src="task.Photo" class="w-24 h-24 md:w-40 md:h-40 object-cover rounded-2xl border-2 border-white shadow-md hover:shadow-xl transition-all cursor-zoom-in" alt="Task photo proof" />
              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <i class="fa-solid fa-expand text-white"></i>
              </div>
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

    <!-- ✅ Dedicated Task Form Component (extracted from this file) -->
    <TaskForm v-model="showTaskForm" :lesson="lesson" />
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
  LESSON_BLOCKS
} from '../../composables/useLessonStatus';

/**
 * LessonDetailView.vue
 *
 * Displays the full detail of a selected lesson: description, progress,
 * status controls, and the task list. Task creation is delegated to TaskForm.vue.
 */
const props = defineProps({
  lesson: { type: Object, required: true }
});
defineEmits(['close']);

// ── Local UI state ───────────────────────────────────────────────────────────
const showTaskForm = ref(false);
const uploadingTaskId = ref(null);
const fileInputRef = ref(null);
const currentTaskForPhoto = ref(null);

// ─── Status & Block controls ────────────────────────────────────────────────
const handleStatusChange = async (event) => {
  const newStatus = event.target.value;
  const isWeekly = normalizeBool(props.lesson.LearnInThisWeek);
  
  // If moving from dormant to "Introduced", set an initial NextDueDate of today
  let nextDue = props.lesson.NextDueDate;
  if (!props.lesson.Status && newStatus === STATUS_LEVELS.INTRODUCED) {
    nextDue = new Date().toISOString();
  }

  await lessonRepository.updateLesson(
    props.lesson.LessonId, 
    newStatus, 
    isWeekly, 
    props.lesson.LearnedCount, 
    props.lesson.TargetCount, 
    props.lesson.BlockType,
    props.lesson.LastPracticedDate,
    nextDue,
    props.lesson.RepeatInterval || 1,
    props.lesson.InterestLevel || 'Medium'
  );
};

const handleDateChange = async (event) => {
  const newDateStr = event.target.value;
  if (!newDateStr) return;

  const nextDue = new Date(newDateStr).toISOString();

  await lessonRepository.updateLesson(
    props.lesson.LessonId, 
    props.lesson.Status, 
    normalizeBool(props.lesson.LearnInThisWeek), 
    props.lesson.LearnedCount, 
    props.lesson.TargetCount, 
    props.lesson.BlockType,
    props.lesson.LastPracticedDate,
    nextDue,
    props.lesson.RepeatInterval || 1,
    props.lesson.InterestLevel || 'Medium'
  );
};

const todayDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const handleMetadataChange = async (field, value) => {
  const data = {
    ...props.lesson,
    [field]: value
  };
  await lessonRepository.updateLesson(
    data.LessonId,
    data.Status,
    normalizeBool(data.LearnInThisWeek),
    data.LearnedCount,
    data.TargetCount,
    data.BlockType,
    data.LastPracticedDate,
    data.NextDueDate,
    data.RepeatInterval,
    data.InterestLevel
  );
};

const handleBlockChange = async (event) => {
  const newBlock = event.target.value;
  await lessonRepository.updateLesson(
    props.lesson.LessonId, 
    props.lesson.Status, 
    normalizeBool(props.lesson.LearnInThisWeek), 
    props.lesson.LearnedCount, 
    props.lesson.TargetCount,
    newBlock,
    props.lesson.LastPracticedDate,
    props.lesson.NextDueDate,
    props.lesson.RepeatInterval || 1,
    props.lesson.InterestLevel || 'Medium'
  );
};

const updateTarget = async (increment) => {
  const current = Math.max(1, parseInt(props.lesson.TargetCount) || 1);
  const newTarget = Math.max(1, current + increment);
  await lessonRepository.updateLesson(
    props.lesson.LessonId, 
    props.lesson.Status, 
    props.lesson.LearnInThisWeek, 
    props.lesson.LearnedCount, 
    newTarget, 
    props.lesson.BlockType,
    props.lesson.LastPracticedDate,
    props.lesson.NextDueDate,
    props.lesson.RepeatInterval || 1,
    props.lesson.InterestLevel || 'Medium'
  );
};

const toggleWeekly = async () => {
  const isWeekly = normalizeBool(props.lesson.LearnInThisWeek);
  await lessonRepository.updateLesson(
    props.lesson.LessonId, 
    props.lesson.Status, 
    !isWeekly, 
    props.lesson.LearnedCount, 
    props.lesson.TargetCount, 
    props.lesson.BlockType,
    props.lesson.LastPracticedDate,
    props.lesson.NextDueDate,
    props.lesson.RepeatInterval || 1,
    props.lesson.InterestLevel || 'Medium'
  );
};

// ── Task list logic ─────────────────────────────────────────────────────────
const isTaskDone = (task) => {
  const learned = parseInt(task.LearnedCount) || 0;
  const target = parseInt(task.TargetCount) || 1;
  return learned >= target || task.Status === 'Completed';
};

const lessonSelectedTasks = computed(() => {
  if (!props.lesson) return [];
  return taskRepository.getTasksByLesson(props.lesson.LessonId).slice().sort((a, b) => {
    return isTaskDone(a) === isTaskDone(b) ? 0 : isTaskDone(a) ? 1 : -1;
  });
});

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
    task.BlockType   // ← preserve block assignment
  );
};

// ── Block assignment ─────────────────────────────────────────────────────────
const LEARNING_BLOCKS = [
  { id: 'morning',  emoji: '🌞', label: 'Morning Energy',  shortLabel: 'Morning',  activeClass: 'bg-amber-100 border-amber-400 text-amber-700' },
  { id: 'deep',     emoji: '🧠', label: 'Deep Learning',   shortLabel: 'Deep',     activeClass: 'bg-blue-100 border-blue-400 text-blue-700' },
  { id: 'creative', emoji: '😴', label: 'Rest & Creative', shortLabel: 'Creative', activeClass: 'bg-purple-100 border-purple-400 text-purple-700' },
  { id: 'life',     emoji: '🌆', label: 'Life Learning',   shortLabel: 'Life',     activeClass: 'bg-emerald-100 border-emerald-400 text-emerald-700' },
];

const setTaskBlock = async (task, blockId) => {
  await taskRepository.setTaskBlock(task, blockId);
};

// ── Photo Picker / Upload Logic ──────────────────────────────────────────────
const triggerPhotoPicker = (task) => {
  currentTaskForPhoto.value = task;
  fileInputRef.value?.click();
};

const onFileSelected = async (event) => {
  const file = event.target.files?.[0];
  if (!file || !currentTaskForPhoto.value) return;

  const task = currentTaskForPhoto.value;
  uploadingTaskId.value = task.LessonTaskId;

  try {
    // 1. Upload to Drive (returns { thumbnailUrl })
    const result = await taskRepository.uploadTaskPhoto(file);
    
    // 2. Update task record with the new photo URL
    await taskRepository.updateTask(
      task.LessonTaskId,
      task.LessonId,
      task.TaskName,
      task.Status,
      task.LearnedCount,
      task.TargetCount,
      result.thumbnailUrl,
      task.BlockType   // ← preserve block assignment
    );
  } catch (err) {
    alert("Photo upload failed. Check connection.");
    console.error(err);
  } finally {
    uploadingTaskId.value = null;
    currentTaskForPhoto.value = null;
    event.target.value = ''; // Reset input
  }
};

// ── AI Generation ────────────────────────────────────────────────────────────
const handleGenerateAI = async () => {
  const age = prompt('Child age?', '2');
  if (age) {
    await taskRepository.generateTasksWithAi(props.lesson.LessonId, props.lesson['LessonName'], age);
  }
};
</script>
