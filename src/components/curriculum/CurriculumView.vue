<template>
  <section class="space-y-4 md:space-y-8" key="curriculum">
    <transition name="slide-right" mode="out-in">
      <!-- SUB-PAGE: SUBJECT DETAILS (Lessons list) -->
      <div v-if="uiState.selectedSubjectForView" key="subject-details" class="space-y-6">
        <header class="hidden md:flex flex-row items-center justify-between gap-4 animate-slide-up">
           <div class="flex items-center gap-4">
             <button @click="uiState.selectedSubjectForView = null" class="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm active:scale-90 shrink-0">
               <i class="fa-solid fa-arrow-left text-lg"></i>
             </button>
             <div>
               <h2 class="text-xl md:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">{{ uiState.selectedSubjectForView['SubjectName'] }}</h2>
               <p class="text-slate-500 mt-1 md:mt-2 font-medium text-xs md:text-base">{{ uiState.selectedSubjectForView.Description || 'Manage lessons for this subject.' }}</p>
             </div>
           </div>
           <button @click="showLessonForm = true" class="bg-blue-600 hover:bg-blue-500 text-white md:w-auto md:h-auto px-4 py-2.5 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-90 flex items-center justify-center shrink-0 text-sm md:text-base">
             <i class="fa-solid fa-plus md:mr-2"></i> <span class="hidden md:inline">New Lesson</span>
           </button>
        </header>

        <!-- Filter Bar -->
        <div class="bg-white/60 backdrop-blur rounded-[1.5rem] p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center animate-slide-up" style="animation-delay: 30ms;">
          <div class="relative flex-1 w-full">
            <input 
              v-model="filterQuery" 
              type="text" 
              placeholder="Search by name..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
            />
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
            <div class="flex items-center gap-1.5 shrink-0 px-2 border-r border-slate-200">
               <button 
                v-for="status in [STATUS_LEVELS.INTRODUCED, STATUS_LEVELS.PRACTICING, STATUS_LEVELS.MASTERED]" 
                :key="status"
                @click="filterStatus = filterStatus === status ? '' : status"
                :class="[
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                  filterStatus === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                ]"
               >
                {{ status }}
               </button>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
               <button 
                v-for="block in LESSON_BLOCKS" 
                :key="block.id"
                @click="filterBlock = filterBlock === block.id ? '' : block.id"
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 border',
                  filterBlock === block.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                ]"
                :title="block.label"
               >
                {{ block.emoji }}
               </button>
               <button v-if="filterQuery || filterStatus || filterBlock" @click="clearFilters" class="ml-2 w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95" title="Clear all filters">
                <i class="fa-solid fa-xmark"></i>
               </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-5 md:mt-6 pt-5 bg-transparent animate-slide-up" style="animation-delay: 50ms;">
          <div v-if="getLessonsForSubject(uiState.selectedSubjectForView.SubjectId).length === 0" class="col-span-full py-16 text-sm text-slate-500 bg-white/50 rounded-3xl text-center border border-dashed border-slate-300 italic shadow-sm">No lessons in this subject yet.</div>
          <div v-else-if="filteredLessons.length === 0" class="col-span-full py-16 text-sm text-slate-500 bg-white/50 rounded-3xl text-center border border-dashed border-slate-300 italic shadow-sm">No lessons match your filters.</div>
          <transition-group name="list">
            <div
              v-for="lesson in filteredLessons"
              :key="lesson.LessonId"
              @click="$emit('open-lesson', lesson)"
              class="bg-white/80 backdrop-blur-xl border border-slate-200 md:hover:border-blue-300 p-4 md:p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 md:hover:-translate-y-1 shadow-sm md:hover:shadow-xl md:hover:shadow-blue-500/10 active:bg-slate-100 active:scale-95 group flex flex-col h-full"
            >
              <h4 class="font-bold text-base md:text-lg text-slate-800 md:group-hover:text-blue-600 transition mb-2 leading-tight">{{ lesson['LessonName'] }}</h4>
              <p class="text-xs md:text-[13px] text-slate-500 font-medium line-clamp-3 mb-5">{{ lesson.Description || 'No description provided.' }}</p>
              <div class="flex flex-wrap items-center justify-between gap-2 mt-auto pt-4 border-t border-slate-100">
                <div class="flex gap-2">
                  <span :class="['text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm border', getStatusColorClasses(lesson.Status)]">{{ lesson.Status || 'Dormant' }}</span>
                  <span v-if="normalizeBool(lesson.LearnInThisWeek)" class="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-amber-100 text-amber-600 shadow-sm border border-amber-200"><i class="fa-solid fa-fire mr-1"></i>Weekly</span>
                  <span class="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-50 text-slate-500 shadow-sm border border-slate-200">
                    <i class="fa-solid fa-list-check mr-1.5 opacity-50"></i>{{ getTaskCount(lesson.LessonId) }} Tasks
                  </span>
                </div>
                <div class="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100 shadow-inner">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="normalizeBool(lesson.LearnInThisWeek)" @change="toggleWeekly(lesson)" class="sr-only peer">
                    <div class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                  </label>
                  <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Weekly</span>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- MASTER LIST: SUBJECTS -->
      <div v-else key="subject-list" class="space-y-4 md:space-y-6">
        <header class="hidden md:flex flex-row items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 class="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Subjects</h2>
            <p class="text-slate-500 mt-1 font-medium text-sm md:text-base">Manage entire curriculum.</p>
          </div>
          <button @click="showSubjectForm = true" class="bg-blue-600 hover:bg-blue-500 text-white md:w-auto md:h-auto md:px-6 md:py-3.5 md:rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-90 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-plus md:mr-2"></i> <span class="hidden md:inline">Add Subject</span>
          </button>
        </header>

        <div v-if="dataStore.state.subjects.length === 0" class="py-16 text-center text-slate-500 italic border border-dashed border-slate-300 bg-white/50 rounded-3xl mt-4">No subjects found.</div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pt-2 md:mt-4">
          <transition-group name="list">
            <div
              v-for="subject in sortedSubjects"
              :key="subject.SubjectId"
              @click="uiState.selectedSubjectForView = subject"
              class="bg-white/90 border border-slate-200 rounded-[1.25rem] p-4 md:p-5 shadow-lg shadow-slate-200/40 backdrop-blur-xl animate-slide-up hover:border-blue-300 cursor-pointer transition-all hover:shadow-blue-500/15 active:scale-[0.98] group flex flex-col"
            >
              <div class="flex items-start gap-3 md:gap-4 mb-3">
                <div class="p-2.5 bg-blue-100/80 rounded-xl group-hover:bg-blue-600 transition-colors text-blue-600 group-hover:text-white shrink-0 shadow-inner group-active:scale-95">
                  <i class="fa-solid fa-bookmark text-base md:text-lg w-5 text-center"></i>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <h3 class="text-base md:text-lg font-extrabold text-slate-800 break-words group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{{ subject['SubjectName'] }}</h3>
                </div>
              </div>
              <p class="text-slate-500 font-medium text-xs md:text-[13px] mb-4 line-clamp-2 leading-relaxed flex-1">{{ subject.Description || 'No description provided.' }}</p>
              <div class="border-t border-slate-100 pt-3 md:pt-4 mt-auto space-y-2">
                <div class="flex items-center justify-between text-[10px] sm:text-xs font-black text-slate-400 tracking-wider">
                  <div class="flex items-center gap-1.5 text-slate-600">
                    <i class="fa-solid fa-list-check"></i>
                    <span>{{ getSubjectStats(subject.SubjectId).completed }} / {{ getSubjectStats(subject.SubjectId).total }} Finished</span>
                    <span v-if="getSubjectStats(subject.SubjectId).inProgress > 0" class="text-blue-500 font-bold ml-1 tracking-normal"><span class="text-slate-300 mr-1.5">&bull;</span>{{ getSubjectStats(subject.SubjectId).inProgress }} In progress</span>
                  </div>
                  <div v-if="getSubjectStats(subject.SubjectId).thisWeek > 0" class="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded uppercase shadow-sm shrink-0"><i class="fa-solid fa-fire mr-0.5"></i> {{ getSubjectStats(subject.SubjectId).thisWeek }} Wk</div>
                </div>
                <div v-if="getSubjectStats(subject.SubjectId).total > 0" class="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div class="bg-emerald-400 h-full transition-all duration-500" :style="{ width: `${(getSubjectStats(subject.SubjectId).completed / getSubjectStats(subject.SubjectId).total) * 100}%` }"></div>
                  <div class="bg-blue-400 h-full transition-all duration-500" :style="{ width: `${(getSubjectStats(subject.SubjectId).inProgress / getSubjectStats(subject.SubjectId).total) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>

    <!-- ✅ Dedicated Form Components (extracted from this file) -->
    <SubjectForm v-model="showSubjectForm" />
    <LessonForm v-model="showLessonForm" :subject="uiState.selectedSubjectForView" />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { dataStore, uiState } from '../../stores/dataStore';
import { lessonRepository } from '../../repositories/lessonRepository';
import { subjectRepository } from '../../repositories/subjectRepository';
import { taskRepository } from '../../repositories/taskRepository';

// ✅ Import dedicated form components
import SubjectForm from './SubjectForm.vue';
import LessonForm from './LessonForm.vue';

// ✅ Import shared composables (no more copy-pasted logic)
import { 
  normalizeBool, 
  normalizeStatus, 
  STATUS_LEVELS, 
  getStatusColorClasses,
  LESSON_BLOCKS
} from '../../composables/useLessonStatus';
import { getLessonProgress } from '../../composables/useLessonProgress';

defineEmits(['open-lesson']);

// ── Modal visibility (local state, not global uiState) ──────────────────────
const showSubjectForm = ref(false);
const showLessonForm = ref(false);

// Filtering state
const filterQuery = ref('');
const filterStatus = ref('');
const filterBlock = ref('');

const getTaskCount = (lessonId) => taskRepository.getTasksByLesson(lessonId).length;

const clearFilters = () => {
  filterQuery.value = '';
  filterStatus.value = '';
  filterBlock.value = '';
};

// Expose to parent (GoogleSheetApp) via uiState bridge for mobile FAB buttons
// These watchers keep the old uiState in sync so the mobile header buttons still work
import { watch } from 'vue';
watch(() => uiState.showSubjectModal, (v) => { showSubjectForm.value = v; });
watch(showSubjectForm, (v) => { uiState.showSubjectModal = v; });
watch(() => uiState.showLessonModal, (v) => { showLessonForm.value = v; });
watch(showLessonForm, (v) => { uiState.showLessonModal = v; });

// ── Data helpers ─────────────────────────────────────────────────────────────
const getLessonsForSubject = (id) => lessonRepository.getLessonsBySubject(id);

const toggleWeekly = async (lesson) => {
  const isWeekly = normalizeBool(lesson.LearnInThisWeek);
  await lessonRepository.updateLesson(
    lesson.LessonId, 
    lesson.Status, 
    !isWeekly, 
    lesson.LearnedCount, 
    lesson.TargetCount, 
    lesson.BlockType,
    lesson.LastPracticedDate,
    lesson.NextDueDate,
    lesson.RepeatInterval || 1,
    lesson.InterestLevel || 'Medium'
  );
};

const getSortedLessons = (subjectId) => {
  const lessons = getLessonsForSubject(subjectId);
  const statusWeight = (lesson) => {
    const s = normalizeStatus(lesson.Status);
    const isWeekly = normalizeBool(lesson.LearnInThisWeek);
    if (s === STATUS_LEVELS.MASTERED) return 5;
    if (isWeekly && [STATUS_LEVELS.PRACTICING, STATUS_LEVELS.FAMILIAR].includes(s)) return 1;
    if ([STATUS_LEVELS.PRACTICING, STATUS_LEVELS.FAMILIAR].includes(s)) return 2;
    if (s === STATUS_LEVELS.REVISIT) return 4;
    if (s === STATUS_LEVELS.INTRODUCED) return 3;
    return 6; // Dormant
  };
  return lessons.slice().sort((a, b) => {
    const wDiff = statusWeight(a) - statusWeight(b);
    if (wDiff !== 0) return wDiff;
    return (a['LessonName'] || '').localeCompare(b['LessonName'] || '');
  });
};

const filteredLessons = computed(() => {
  if (!uiState.selectedSubjectForView) return [];
  
  const all = getSortedLessons(uiState.selectedSubjectForView.SubjectId);
  
  return all.filter(l => {
    const matchesQuery = !filterQuery.value || (l['LessonName'] || '').toLowerCase().includes(filterQuery.value.toLowerCase());
    const matchesStatus = !filterStatus.value || normalizeStatus(l.Status) === filterStatus.value;
    const matchesBlock = !filterBlock.value || l.BlockType === filterBlock.value;
    
    return matchesQuery && matchesStatus && matchesBlock;
  });
});

const getSubjectStats = (subjectId) => {
  const lessons = getLessonsForSubject(subjectId);
  const total = lessons.length;
  let completed = 0, inProgress = 0, thisWeek = 0;
  lessons.forEach(l => {
    if (normalizeBool(l.LearnInThisWeek)) thisWeek++;
    const status = normalizeStatus(l.Status);
    if (status === STATUS_LEVELS.MASTERED) {
      completed++;
    } else if ([STATUS_LEVELS.PRACTICING, STATUS_LEVELS.FAMILIAR, STATUS_LEVELS.INTRODUCED, STATUS_LEVELS.REVISIT].includes(status)) {
      inProgress++;
    }
  });
  return { total, completed, inProgress, thisWeek };
};

const sortedSubjects = computed(() => {
  const subjects = subjectRepository.getSubjects();
  if (!subjects.length) return [];
  return subjects.map(subject => ({ subject, stats: getSubjectStats(subject.SubjectId) }))
    .sort((a, b) => {
      if (b.stats.thisWeek !== a.stats.thisWeek) return b.stats.thisWeek - a.stats.thisWeek;
      if (b.stats.inProgress !== a.stats.inProgress) return b.stats.inProgress - a.stats.inProgress;
      return (a.subject['SubjectName'] || '').localeCompare(b.subject['SubjectName'] || '');
    })
    .map(item => item.subject);
});
</script>
