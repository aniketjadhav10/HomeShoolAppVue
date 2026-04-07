<template>
  <section class="space-y-4 md:space-y-8" key="curriculum">
    <transition name="slide-right" mode="out-in">
      <!-- SUB-PAGE: SUBJECT DETAILS -->
      <div v-if="uiState.selectedSubjectForView" key="subject-details" class="space-y-6">
        <header class="hidden md:flex flex-row items-center justify-between gap-4 animate-slide-up">
           <div class="flex items-center gap-4">
             <button @click="uiState.selectedSubjectForView = null" class="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm active:scale-90 shrink-0">
               <i class="fa-solid fa-arrow-left text-lg"></i>
             </button>
             <div>
               <h2 class="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">{{ uiState.selectedSubjectForView['Subject Name'] }}</h2>
               <p class="text-slate-500 mt-1 md:mt-2 font-medium text-sm md:text-lg">{{ uiState.selectedSubjectForView.Description || 'Manage lessons for this subject.' }}</p>
             </div>
           </div>
           
           <button @click="openLessonModal(uiState.selectedSubjectForView)" class="bg-blue-600 hover:bg-blue-500 text-white md:w-auto md:h-auto px-4 py-2.5 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-90 flex items-center justify-center shrink-0 text-sm md:text-base">
             <i class="fa-solid fa-plus md:mr-2"></i> <span class="hidden md:inline">New Lesson</span>
           </button>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-5 md:mt-6 pt-5 bg-transparent animate-slide-up" style="animation-delay: 50ms;">
          <div v-if="getLessonsForSubject(uiState.selectedSubjectForView.SubjectId).length === 0" class="col-span-full py-16 text-sm text-slate-500 bg-white/50 rounded-3xl text-center border border-dashed border-slate-300 italic shadow-sm">No lessons in this subject yet.</div>
          <transition-group name="list">
            <div v-for="lesson in getSortedLessons(uiState.selectedSubjectForView.SubjectId)" :key="lesson.LessonId" @click="$emit('open-lesson', lesson)" class="bg-white/80 backdrop-blur-xl border border-slate-200 md:hover:border-blue-300 p-4 md:p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 md:hover:-translate-y-1 shadow-sm md:hover:shadow-xl md:hover:shadow-blue-500/10 active:bg-slate-100 active:scale-95 group flex flex-col h-full">
              <h4 class="font-bold text-lg md:text-xl text-slate-800 md:group-hover:text-blue-600 transition mb-2 leading-tight">{{ lesson['Lesson Name'] }}</h4>
              <p class="text-xs md:text-sm text-slate-500 font-medium line-clamp-3 mb-5">{{ lesson.Description || 'No description provided.' }}</p>
              <div class="flex flex-wrap items-center justify-between gap-2 mt-auto pt-4 border-t border-slate-100">
                <div class="flex gap-2">
                  <span :class="['text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm border', getStatusColorClasses(lesson)]">{{ getComputedStatus(lesson) }}</span>
                  <span v-if="normalizeBool(lesson.LearnInThisWeek)" class="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-amber-100 text-amber-600 shadow-sm border border-amber-200"><i class="fa-solid fa-fire mr-1"></i> Weekly</span>
                </div>
                <!-- Mini action to quickly toggle weekly -->
                <button @click.stop="toggleWeekly(lesson)" class="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-90" :title="normalizeBool(lesson.LearnInThisWeek) ? 'Remove from Weekly Plan' : 'Add to Weekly Plan'">
                  <i :class="['fa-solid bg-transparent', normalizeBool(lesson.LearnInThisWeek) ? 'fa-star text-amber-500' : 'fa-calendar-plus']"></i>
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- MASTER LIST: SUBJECTS -->
      <div v-else key="subject-list" class="space-y-4 md:space-y-6">
        <header class="hidden md:flex flex-row items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 class="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Subjects</h2>
            <p class="text-slate-500 mt-2 font-medium text-lg">Manage entire curriculum.</p>
          </div>
          <button @click="uiState.showSubjectModal = true" class="bg-blue-600 hover:bg-blue-500 text-white md:w-auto md:h-auto md:px-6 md:py-3.5 md:rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-90 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-plus md:mr-2"></i> <span class="hidden md:inline">Add Subject</span>
          </button>
        </header>

        <div v-if="dataStore.state.subjects.length === 0" class="py-16 text-center text-slate-500 italic border border-dashed border-slate-300 bg-white/50 rounded-3xl mt-4">No subjects found.</div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pt-2 md:mt-4">
          <transition-group name="list">
            <div v-for="subject in dataStore.state.subjects" :key="subject.SubjectId" @click="uiState.selectedSubjectForView = subject" class="bg-white/90 border border-slate-200 rounded-[1.25rem] p-4 md:p-5 shadow-lg shadow-slate-200/40 backdrop-blur-xl animate-slide-up hover:border-blue-300 cursor-pointer transition-all hover:shadow-blue-500/15 active:scale-[0.98] group flex flex-col">
              
              <!-- Header: Icon + Title -->
              <div class="flex items-start gap-3 md:gap-4 mb-3">
                <div class="p-2.5 bg-blue-100/80 rounded-xl group-hover:bg-blue-600 transition-colors text-blue-600 group-hover:text-white shrink-0 shadow-inner group-active:scale-95">
                  <i class="fa-solid fa-bookmark text-base md:text-lg w-5 text-center"></i>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <h3 class="text-lg md:text-xl font-extrabold text-slate-800 break-words group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{{ subject['Subject Name'] }}</h3>
                </div>
              </div>
              
              <!-- Description -->
              <p class="text-slate-500 font-medium text-[13px] md:text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{{ subject.Description || 'No description provided.' }}</p>
              
              <!-- Stats Footer -->
              <div class="border-t border-slate-100 pt-3 md:pt-4 mt-auto space-y-2">
                 <div class="flex items-center justify-between text-[10px] sm:text-xs font-black text-slate-400 tracking-wider">
                   <div class="flex items-center gap-1.5 text-slate-600"><i class="fa-solid fa-list-check"></i> 
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

    <!-- Subject Bottom Sheet / Modal -->
    <div v-if="uiState.showSubjectModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 font-sans animate-fade-in" @click.self="uiState.showSubjectModal = false">
      <!-- Bottom Sheet Container (slides from bottom on mobile, pops in center on desktop) -->
      <div class="bg-white rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 max-w-md w-full animate-slide-up pb-8 md:pb-0 transition-transform duration-300">
        <!-- Mobile horizontal drag handle -->
        <div class="w-12 h-1.5 bg-slate-200 hover:bg-slate-300 transition-colors rounded-full mx-auto mt-4 mb-2 md:hidden cursor-pointer"></div>
        <div class="p-6 md:p-8 pt-2 md:pt-8">
          <h3 class="text-2xl font-black text-slate-800 mb-6">New Subject</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">Subject Name</label>
              <input v-model="subjectForm.name" type="text" class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Mathematics" @keyup.enter="saveSubject">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">Description <span class="text-slate-400 font-normal">(Optional)</span></label>
              <textarea v-model="subjectForm.description" class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all resize-none placeholder:text-slate-400" rows="3" placeholder="Brief description..."></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8">
            <button @click="uiState.showSubjectModal = false" class="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors hidden md:block">Cancel</button>
            <button @click="saveSubject" class="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 md:py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!subjectForm.name.trim()">Save Subject</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Bottom Sheet / Modal -->
    <div v-if="uiState.showLessonModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 font-sans animate-fade-in" @click.self="uiState.showLessonModal = false">
      <div class="bg-white rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 max-w-md w-full animate-slide-up pb-8 md:pb-0 transition-transform duration-300">
        <!-- Mobile horizontal drag handle -->
        <div class="w-12 h-1.5 bg-slate-200 hover:bg-slate-300 transition-colors rounded-full mx-auto mt-4 mb-2 md:hidden cursor-pointer"></div>
        <div class="p-6 md:p-8 pt-2 md:pt-8">
          <h3 class="text-2xl font-black text-slate-800 mb-2">New Lesson</h3>
          <p class="text-slate-500 text-sm mb-6 font-medium">in <span class="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-md">{{ uiState.selectedSubjectForView?.['Subject Name'] }}</span></p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">Lesson Name</label>
              <input v-model="lessonForm.name" type="text" id="lessonNameInput" class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Algebra Basics" @keyup.enter="saveLesson">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">Description <span class="text-slate-400 font-normal">(Optional)</span></label>
              <textarea v-model="lessonForm.description" class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all resize-none placeholder:text-slate-400" rows="3" placeholder="Brief description..."></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8">
            <button @click="uiState.showLessonModal = false" class="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors hidden md:block">Cancel</button>
            <button @click="saveLesson" class="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 md:py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!lessonForm.name.trim()">Save Lesson</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { dataStore, dispatchAction, uiState } from '../../stores/dataStore';

defineEmits(['open-lesson']);

const getLessonsForSubject = (id) => dataStore.state.lessons.filter(l => l.SubjectId === id);

const normalizeStatus = (v) => (v ?? '').toString().trim().toLowerCase();
const normalizeBool = (v) => v === true || (typeof v === 'string' && v.trim().toUpperCase() === 'TRUE');

const getLessonProgress = (lesson) => {
  const target = Math.max(1, parseInt(lesson.TargetCount) || 1);
  const learned = parseInt(lesson.LearnedCount) || 0;
  return Math.min(100, Math.round((learned / target) * 100));
};

const toggleWeekly = async (lesson) => {
  const isWeekly = normalizeBool(lesson.LearnInThisWeek);
  const newStatus = isWeekly ? lesson.Status : 'In Progress'; // Auto mark in-progress if putting in weekly plan
  await dispatchAction('updateLesson', lesson.LessonId, newStatus, !isWeekly, lesson.LearnedCount, lesson.TargetCount);
};

const getComputedStatus = (lesson) => {
  const p = getLessonProgress(lesson);
  let s = normalizeStatus(lesson.Status);
  if (p === 100 || s === 'completed' || s === 'done') return 'Completed';
  if (s === 'in progress' || (p > 0 && p < 100)) return 'In Progress';
  if (s === 'hold' || s === 'on hold') return 'On Hold';
  return s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'Pending';
};

const getStatusColorClasses = (lesson) => {
  const s = getComputedStatus(lesson).toLowerCase();
  if (s === 'in progress') return 'bg-blue-50 text-blue-600 border-blue-200';
  if (s === 'completed' || s === 'done') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (s === 'on hold' || s === 'hold') return 'bg-slate-100 text-slate-500 border-slate-200';
  return 'bg-slate-50 text-slate-600 border-slate-200'; // Pending
};

const getSortedLessons = (subjectId) => {
  const lessons = getLessonsForSubject(subjectId);
  const statusWeight = (lesson) => {
    const s = getComputedStatus(lesson).toLowerCase();
    if (s === 'in progress') return 1;
    if (s === 'on hold' || s === 'hold') return 3;
    if (s === 'completed' || s === 'done') return 4;
    return 2; // pending
  };
  return lessons.slice().sort((a, b) => statusWeight(a) - statusWeight(b));
};

const getSubjectStats = (subjectId) => {
  const lessons = getLessonsForSubject(subjectId);
  const total = lessons.length;
  let completed = 0;
  let inProgress = 0;
  let thisWeek = 0;

  lessons.forEach(l => {
    if (normalizeBool(l.LearnInThisWeek)) thisWeek++;
    const status = normalizeStatus(l.Status);
    const progress = getLessonProgress(l);
    
    if (progress === 100 || status === 'completed' || status === 'done') {
      completed++;
    } else if (status === 'in progress' || (progress > 0 && progress < 100)) {
      inProgress++;
    }
  });

  return { total, completed, inProgress, thisWeek };
};

const subjectForm = ref({ name: '', description: '' });

watch(() => uiState.showSubjectModal, (newVal) => {
  if (newVal) {
    subjectForm.value = { name: '', description: '' };
  }
});

const saveSubject = async () => {
  if (subjectForm.value.name.trim()) {
    await dispatchAction('saveSubject', null, subjectForm.value.name.trim(), subjectForm.value.description.trim());
    uiState.showSubjectModal = false;
  }
};

const lessonForm = ref({ name: '', description: '' });

const openLessonModal = () => {
  lessonForm.value = { name: '', description: '' };
  uiState.showLessonModal = true;
};

const saveLesson = async () => {
  if (lessonForm.value.name.trim() && uiState.selectedSubjectForView) {
    await dispatchAction(
      'saveLesson', 
      null, 
      uiState.selectedSubjectForView.SubjectId, 
      uiState.selectedSubjectForView['Subject Name'], 
      lessonForm.value.name.trim(), 
      lessonForm.value.description.trim(), 
      true
    );
    uiState.showLessonModal = false;
  }
};
</script>
