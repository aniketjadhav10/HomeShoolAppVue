<template>
  <teleport to="body">
    <transition name="schedule-modal">
      <div v-if="modelValue" class="fixed inset-0 z-[500] flex items-center justify-center p-3">
        <!-- Backdrop -->
        <div @click="$emit('update:modelValue', false)" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        
        <!-- Modal Content — compact, no-scroll design -->
        <div class="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm flex flex-col schedule-modal-box overflow-hidden">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <i class="fa-solid fa-calendar-plus text-white text-[10px]"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-800 leading-none">Scheduling Hub</h3>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{{ lesson.LessonName }}</p>
              </div>
            </div>
            <button @click="$emit('update:modelValue', false)" class="w-7 h-7 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-200 transition-colors">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <div class="p-3 flex flex-col gap-2.5">

            <!-- Row 1: Status + Weekly toggle -->
            <div class="grid grid-cols-2 gap-2">
              <!-- Status -->
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                <div class="relative">
                  <select :value="normalizeStatusForSelect(lesson.Status)" @change="handleStatusChange"
                    class="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg px-2 py-1.5 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer">
                    <option value="">💤 Dormant</option>
                    <option v-for="s in Object.values(STATUS_LEVELS)" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <i class="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[8px]"></i>
                </div>
              </div>

              <!-- Weekly Plan toggle -->
              <div :class="['rounded-2xl p-2.5 flex flex-col justify-between transition-opacity', !lesson.Status ? 'bg-slate-50 border border-slate-200 opacity-60' : 'bg-indigo-50/60 border border-indigo-100']">
                <label :class="['text-[9px] font-black uppercase tracking-widest block mb-1', !lesson.Status ? 'text-slate-400' : 'text-indigo-400']">Weekly Plan</label>
                <label class="relative inline-flex items-center gap-2" :class="!lesson.Status ? 'cursor-not-allowed' : 'cursor-pointer'">
                  <input type="checkbox" :checked="normalizeBool(lesson.LearnInThisWeek)" @change="toggleWeekly" :disabled="!lesson.Status" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner relative peer-disabled:opacity-50"></div>
                  <span class="text-[10px] font-black" :class="!lesson.Status ? 'text-slate-400' : (normalizeBool(lesson.LearnInThisWeek) ? 'text-indigo-600' : 'text-slate-400')">
                    {{ normalizeBool(lesson.LearnInThisWeek) ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Row 2: Sessions counter + Interval -->
            <div class="grid grid-cols-2 gap-2">
              <!-- Target Sessions -->
              <div class="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Sessions</label>
                <div class="flex items-center gap-1.5">
                  <button @click="updateTarget(-1)" class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center outline-none active:scale-90 transition-all shadow-sm">
                    <i class="fa-solid fa-minus text-[8px]"></i>
                  </button>
                  <div class="flex-1 text-center">
                    <span class="text-base font-black text-slate-800 leading-none">{{ parseInt(lesson.LearnedCount) || 0 }}/{{ Math.max(1, parseInt(lesson.TargetCount) || 1) }}</span>
                  </div>
                  <button @click="updateTarget(1)" class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center outline-none active:scale-90 transition-all shadow-sm">
                    <i class="fa-solid fa-plus text-[8px]"></i>
                  </button>
                </div>
              </div>

              <!-- Practice Interval -->
              <div class="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-2.5">
                <label class="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1.5">Interval</label>
                <div class="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    :value="lesson.RepeatInterval || 1" 
                    @change="e => handleMetadataChange('RepeatInterval', parseInt(e.target.value))"
                    class="w-14 h-7 bg-white border border-indigo-200 rounded-lg text-center font-black text-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                  <span class="text-[9px] font-black text-indigo-400 uppercase">Days</span>
                </div>
              </div>
            </div>

            <!-- Row 3: Interest Level -->
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interest Level</label>
                <span class="text-sm">{{ lesson.InterestLevel === 'High' ? '🔥' : lesson.InterestLevel === 'Low' ? '😴' : '😊' }}</span>
              </div>
              <div class="flex bg-white p-0.5 rounded-xl border border-slate-200 shadow-sm gap-0.5">
                <button 
                  v-for="lv in ['Low', 'Medium', 'High']" 
                  :key="lv"
                  @click="handleMetadataChange('InterestLevel', lv)"
                  :class="[
                    'flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-wider',
                    (lesson.InterestLevel || 'Medium') === lv ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'
                  ]"
                >{{ lv }}</button>
              </div>
            </div>

            <!-- Row 4: Time Block -->
            <div class="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-2.5">
              <label class="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1.5">Time Block</label>
              <div class="relative">
                <select :value="lesson.BlockType || ''" @change="handleBlockChange"
                  class="w-full appearance-none bg-white border border-emerald-200 text-emerald-800 text-[11px] font-black rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm cursor-pointer">
                  <option value="" disabled>Choose block...</option>
                  <option v-for="b in LESSON_BLOCKS" :key="b.id" :value="b.id">{{ b.emoji }} {{ b.label }}</option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 text-[10px]">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
              </div>
            </div>

            <!-- Row 5: Next Session Date -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-3 py-2.5 flex items-center justify-between gap-3">
              <div>
                <p class="text-[9px] font-black uppercase tracking-[0.15em] text-white/70">Next Session</p>
              </div>
              <div class="relative flex-1 max-w-[160px]">
                <input 
                  type="date" 
                  :value="lesson.NextDueDate ? lesson.NextDueDate.split('T')[0] : ''" 
                  @change="handleDateChange"
                  :min="todayDate"
                  class="w-full bg-white/15 border border-white/25 text-white text-xs font-black rounded-xl px-3 py-2 focus:outline-none focus:bg-white/25 transition-all cursor-pointer"
                />
              </div>
              <div class="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-calendar-check text-white text-[10px]"></i>
              </div>
            </div>

          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { lessonRepository } from '../../repositories/lessonRepository';
import { 
  normalizeBool, 
  normalizeStatusForSelect, 
  STATUS_LEVELS,
  LESSON_BLOCKS
} from '../../composables/useLessonStatus';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  lesson: { type: Object, required: true }
});

const emit = defineEmits(['update:modelValue']);

// ── Handlers ─────────────────────────────────────────────────────────────

const handleStatusChange = async (event) => {
  const newStatus = event.target.value;
  const isWeekly = normalizeBool(props.lesson.LearnInThisWeek);
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

const handleMetadataChange = async (field, value) => {
  const data = { ...props.lesson, [field]: value };
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

const todayDate = computed(() => new Date().toISOString().split('T')[0]);
</script>

<style>
/* Scheduling Hub Modal — NOT scoped so it applies to teleported DOM */
.schedule-modal-enter-active,
.schedule-modal-leave-active {
  transition: opacity 0.3s ease;
}
.schedule-modal-enter-from,
.schedule-modal-leave-to {
  opacity: 0;
}
.schedule-modal-enter-active .schedule-modal-box,
.schedule-modal-leave-active .schedule-modal-box {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.schedule-modal-enter-from .schedule-modal-box,
.schedule-modal-leave-to .schedule-modal-box {
  opacity: 0;
  transform: scale(0.92) translateY(16px);
}

input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
}

.modal-scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.modal-scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
