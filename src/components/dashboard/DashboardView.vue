<template>
  <div class="space-y-0">

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SKELETON LOADER                                 -->
    <!-- ═══════════════════════════════════════════════ -->
    <section v-if="dataStore.loading && (!dataStore.state.lessons || dataStore.state.lessons.length === 0)" class="space-y-5 animate-pulse pt-2">
      <div class="h-20 bg-white/60 rounded-3xl"></div>
      <div class="h-40 bg-amber-50/70 rounded-3xl"></div>
      <div class="h-10 bg-white/60 rounded-2xl"></div>
      <div class="space-y-3">
        <div class="h-32 bg-blue-50/60 rounded-3xl"></div>
        <div class="h-32 bg-purple-50/60 rounded-3xl"></div>
        <div class="h-32 bg-green-50/60 rounded-3xl"></div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- MAIN DASHBOARD                                  -->
    <!-- ═══════════════════════════════════════════════ -->
    <section v-else class="space-y-4" key="dashboard">

      <!-- ─── 1. 7-DAY CALENDAR STRIP ─── -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm px-4 py-4 uppercase">
        <!-- 7-day scroll strip -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            v-for="day in calendarDays"
            :key="day.dateStr"
            @click="selectedCalendarDate = day.dateStr"
            :class="[
              'flex flex-col items-center shrink-0 w-12 py-2.5 rounded-2xl transition-all active:scale-90 border',
              selectedCalendarDate === day.dateStr
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                : day.isToday
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50'
            ]"
          >
            <span class="text-[9px] font-bold uppercase tracking-widest opacity-70">{{ day.dayName }}</span>
            <span class="text-base font-black mt-0.5">{{ day.dayNum }}</span>
          </button>
        </div>
      </div>

      <!-- ─── 2. CURRENTLY ACTIVE BLOCK (auto-detected) ─── -->
      <div v-if="dataStore.loading" class="h-44 bg-slate-100 rounded-3xl animate-pulse flex flex-col justify-center px-6">
        <div class="h-3 w-20 bg-slate-200 rounded mb-3"></div>
        <div class="h-8 w-48 bg-slate-200 rounded mb-4"></div>
        <div class="space-y-2">
          <div class="h-10 w-full bg-white/50 rounded-xl px-3 py-2"></div>
        </div>
      </div>
      <div
        v-else-if="activeBlock"
        class="rounded-3xl p-5 border shadow-lg relative overflow-hidden"
        :class="activeBlock.heroBg"
      >
        <!-- decorative circle -->
        <div class="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10" :class="activeBlock.glowColor"></div>

        <div class="flex items-start justify-between mb-3">
          <div>
            <span class="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-1" :class="activeBlock.accentText">
              <span class="w-1.5 h-1.5 rounded-full animate-pulse inline-block" :class="activeBlock.dotColor"></span>
              Currently Active
            </span>
            <h3 class="text-2xl font-black leading-tight" :class="activeBlock.titleColor">{{ activeBlock.name }}</h3>
            <p class="text-[11px] font-medium mt-0.5" :class="activeBlock.subtitleColor">{{ activeBlock.subtitle }}</p>
          </div>
          <div class="text-3xl" :style="{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }">{{ activeBlock.emoji }}</div>
        </div>

        <!-- Top 2 tasks in the active block -->
        <div v-if="activeBlock.lessons.length > 0" class="space-y-1.5 mb-4">
          <div
            v-for="lesson in activeBlock.lessons.slice(0, 2)"
            :key="lesson.LessonId"
            class="flex items-center gap-2.5 bg-white/50 rounded-xl px-3 py-2"
          >
            <i :class="['fa-solid text-sm', activeBlock.taskIcon]" :style="{ color: activeBlock.iconHex }"></i>
            <span class="text-[13px] font-semibold text-slate-700 truncate">{{ lesson['LessonName'] }}</span>
          </div>
        </div>
        <div v-else class="text-[12px] italic mb-4" :class="activeBlock.subtitleColor">
          No lessons assigned to this block.
        </div>


      </div>

      <!-- ─── 3. DAILY PROGRESS BAR ─── -->
      <div v-if="dataStore.loading" class="bg-white/80 rounded-3xl border border-slate-100 px-4 py-5 animate-pulse">
        <div class="flex justify-between mb-4">
          <div class="h-4 w-32 bg-slate-100 rounded"></div>
          <div class="h-6 w-12 bg-slate-100 rounded"></div>
        </div>
        <div class="h-2 w-full bg-slate-100 rounded-full"></div>
      </div>
      <div v-else class="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm px-4 py-3.5">
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-sm font-black text-slate-700">Daily Journey</p>
            <p class="text-[10px] text-slate-400 font-medium">{{ completedTasksTotal }} of {{ totalTasksCount }} tasks completed</p>
          </div>
          <span class="text-xl font-black" :class="overallProgress >= 100 ? 'text-emerald-500' : 'text-indigo-600'">
            {{ overallProgress }}%
          </span>
        </div>
        <!-- Segmented bars for each block -->
        <div class="flex gap-1.5 h-2 rounded-full overflow-hidden">
          <div
            v-for="block in learningBlocks"
            :key="block.id"
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="block.progressBar"
            :style="{ width: `${block.progress}%`, minWidth: block.progress > 0 ? '4px' : '0' }"
          ></div>
        </div>
        <!-- Legend -->
        <div class="flex gap-3 mt-2 flex-wrap">
          <span v-for="block in learningBlocks" :key="block.id" class="flex items-center gap-1 text-[9px] font-bold text-slate-500">
            <span class="w-2 h-2 rounded-full inline-block" :class="block.legendDot"></span>
            {{ block.name }}
          </span>
        </div>
      </div>

      <!-- ─── 4. PROGRESS INSIGHTS (GRAPHS) ─── -->
      <div v-if="!dataStore.loading && dataStore.state.lessons.length > 0" class="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-700 flex items-center gap-2">
            <i class="fa-solid fa-chart-simple text-indigo-500"></i>
            Progress Insights
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <!-- Donut Chart: Pedagogical Status -->
          <div class="flex flex-col items-center">
            <div class="relative w-40 h-40">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="12" />
                <circle 
                  v-for="(segment, i) in statusDonutSegments" 
                  :key="'seg'+i"
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  :stroke="segment.color" 
                  stroke-width="12" 
                  :stroke-dasharray="segment.dashArray" 
                  :stroke-dashoffset="segment.dashOffset"
                  stroke-linecap="round"
                  class="transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-2xl font-black text-slate-800">{{ masteredPercentage }}%</span>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Mastered</span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
              <div v-for="stat in statusSummary" :key="stat.label" class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: stat.color }"></div>
                <span class="text-[9px] font-bold text-slate-500 uppercase truncate">{{ stat.label }}</span>
                <span class="text-[9px] font-black text-slate-800 ml-auto">{{ stat.count }}</span>
              </div>
            </div>
          </div>

          <!-- Vertical Bar Chart: Subject Mastery -->
          <div class="space-y-4">
            <div v-for="subject in subjectMasteryList.slice(0, 5)" :key="subject.name" class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-600 uppercase tracking-wide truncate max-w-[120px]">{{ subject.name }}</span>
                <span class="text-[10px] font-black text-slate-400">{{ Math.round(subject.rate) }}%</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden group">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out rounded-full shadow-sm group-hover:from-blue-400 group-hover:to-indigo-500"
                  :style="{ width: subject.rate + '%' }"
                ></div>
              </div>
            </div>
            <p v-if="subjectMasteryList.length > 5" class="text-[9px] font-bold text-center text-slate-400 uppercase">+ {{ subjectMasteryList.length - 5 }} More Subjects</p>
          </div>
        </div>
      </div>

      <!-- ─── 5. TODAY'S LEARNING JOURNEY ─── -->
    <div class="space-y-6">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-rocket text-indigo-500"></i>
          Today's Journey
        </h3>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
          {{ todaysLessons.length }} Scheduled
        </span>
      </div>

      <div v-if="todaysLessons.length === 0" class="bg-white/60 border-2 border-dashed border-slate-200 rounded-[2rem] py-12 px-6 text-center">
        <div class="text-4xl mb-3">🌈</div>
        <p class="text-slate-500 font-bold text-sm">All caught up! Time for free play.</p>
        <p class="text-[11px] text-slate-400 mt-1">New lessons appear here once they are "Introduced".</p>
      </div>

      <div v-else class="space-y-8">
        <div v-for="group in lessonGroups" :key="group.title" class="space-y-3">
          <div v-if="group.lessons.length > 0">
            <h4 class="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-4" :class="group.color">
              <i :class="['fa-solid', group.icon]"></i>
              {{ group.title }}
            </h4>

            <div class="grid grid-cols-1 gap-4">
              <div 
                v-for="lesson in group.lessons" 
                :key="lesson.LessonId"
                class="bg-white rounded-[1.8rem] border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <!-- Interest Suggestion Alert -->
                <div v-if="aiSuggestions[lesson.LessonId]" class="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div class="flex items-start gap-2">
                    <span class="text-lg">✨</span>
                    <div class="text-[11px] font-medium text-indigo-700 italic leading-relaxed">
                      {{ aiSuggestions[lesson.LessonId] }}
                    </div>
                  </div>
                </div>

                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border" :class="getStatusColorClasses(lesson.Status)">
                        {{ lesson.Status || 'Dormant' }}
                      </span>
                      <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {{ parseInt(lesson.LearnedCount) || 0 }} / {{ parseInt(lesson.TargetCount) || 1 }} sessions
                      </span>
                      <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                        <i class="fa-solid fa-list-check opacity-50"></i>{{ getTaskCount(lesson.LessonId) }} Tasks
                      </span>

                      <span v-if="lesson.InterestLevel === 'Low'" class="text-[18px]" title="Needs extra fun!">😴</span>
                      <span v-if="lesson.InterestLevel === 'High'" class="text-[18px]" title="Loves this!">🔥</span>
                    </div>
                    <h5 class="text-base font-black text-slate-800 truncate">{{ lesson['LessonName'] }}</h5>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ lesson.SubjectName }}</p>
                  </div>
                  <button 
                    @click="$emit('open-lesson', lesson)"
                    class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-slate-50 gap-3">
              <div class="flex-1">
                    <button 
                      v-if="lesson.InterestLevel === 'Low'"
                      @click="getAiHelp(lesson)"
                      :disabled="loadingAi[lesson.LessonId]"
                      class="flex items-center gap-2 text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                    >
                      <i class="fa-solid" :class="loadingAi[lesson.LessonId] ? 'fa-spinner animate-spin' : 'fa-wand-sparkles'"></i>
                      {{ loadingAi[lesson.LessonId] ? 'Thinking...' : 'Fun Ideas' }}
                    </button>
                  </div>

                  <button 
                    @click="handleMarkDone(lesson)"
                    :disabled="dataStore.saving || (isPracticedToday(lesson) && !isDueToday(lesson))"
                    class="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    :class="[
                      isOverdue(lesson) && !isPracticedToday(lesson) 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600'
                    ]"
                  >
                    <i class="fa-solid" :class="isPracticedToday(lesson) ? 'fa-check' : 'fa-check'"></i>
                    {{ isOverdue(lesson) && !isPracticedToday(lesson) ? 'Overdue' : 'Done Today' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- ─── 5. ALL WEEKLY TASKS (collapsed by default) ─── -->
      <details class="group">
        <summary class="flex items-center justify-between bg-white/70 backdrop-blur border border-slate-200 rounded-2xl px-4 py-3 cursor-pointer list-none select-none transition-all hover:bg-white">
          <span class="text-sm font-black text-slate-700 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-slate-400 text-xs"></i>
            All Tasks
            <span class="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{{ weekTasksAll.length }}</span>
          </span>
          <div class="flex items-center gap-2">
            <div class="flex rounded-xl bg-slate-100 p-0.5 text-[10px] font-bold">
              <button @click.prevent="taskFilter = 'all'" :class="['px-2.5 py-1 rounded-lg transition-all', taskFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400']">All</button>
              <button @click.prevent="taskFilter = 'incomplete'" :class="['px-2.5 py-1 rounded-lg transition-all', taskFilter === 'incomplete' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400']">Pending</button>
              <button @click.prevent="taskFilter = 'complete'" :class="['px-2.5 py-1 rounded-lg transition-all', taskFilter === 'complete' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400']">Done</button>
            </div>
            <i class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform group-open:rotate-180"></i>
          </div>
        </summary>

        <div class="bg-white/80 border border-slate-200 rounded-2xl mt-2 overflow-hidden shadow-sm">
          <transition-group name="list" tag="div">
            <div v-if="weekTasksFiltered.length === 0" key="empty" class="py-8 text-center text-[12px] text-slate-400 italic">
              No tasks match this filter.
            </div>
            <div
              v-for="task in weekTasksFiltered"
              :key="task.LessonTaskId"
              class="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              :class="{ 'opacity-50': isTaskDone(task) }"
            >
            <div class="flex flex-col items-center gap-1 shrink-0">
              <button
                @click="handleDashboardTaskCount(task, 1)"
                class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 flex items-center justify-center transition-all active:scale-90 shadow-sm disabled:opacity-50"
                :class="{ 'bg-emerald-500 text-white border-emerald-500': isTaskDone(task) }"
              >
                <i class="fa-solid" :class="isTaskDone(task) ? 'fa-check' : 'fa-plus'"></i>
              </button>
              <span class="text-[9px] font-black text-slate-400 tabular-nums">
                {{ task.LearnedCount || 0 }}/{{ task.TargetCount || 1 }}
              </span>
              <button
                v-if="(task.LearnedCount || 0) > 0"
                @click="handleDashboardTaskCount(task, -1)"
                class="w-5 h-5 rounded-md bg-white border border-slate-100 text-slate-300 hover:text-red-500 flex items-center justify-center transition-all active:scale-90"
              >
                <i class="fa-solid fa-minus text-[7px]"></i>
              </button>
            </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-[13px] font-semibold text-slate-700 truncate transition-all"
                  :class="{ 'line-through text-slate-400': isTaskDone(task) }"
                >{{ task['TaskName'] }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {{ getLesson(task.LessonId)?.SubjectName }} · {{ getLesson(task.LessonId)?.['LessonName'] }}
                </p>
              </div>
              <button
                @click="$emit('open-lesson', getLesson(task.LessonId))"
                class="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-100 transition-all active:scale-90 shrink-0"
                title="Open lesson"
              >
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </button>
            </div>
          </transition-group>
        </div>
      </details>

    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { dataStore, dispatchAction, loadData } from '../../stores/dataStore';
import { lessonRepository } from '../../repositories/lessonRepository';
import { taskRepository } from '../../repositories/taskRepository';
import { 
  normalizeBool, 
  normalizeStatus, 
  STATUS_LEVELS, 
  getStatusColorClasses, 
  getNextStatus 
} from '../../composables/useLessonStatus';
import { getLessonProgress, isPracticedToday, isDueToday, isOverdue } from '../../composables/useLessonProgress';


// ─── Existing state (preserved) ───────────────────────────────────────────────
const taskFilter = ref('incomplete');

// ─── Reactive Time Tracking ──────────────────────────────────────────────────
const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 60000); // Update every minute
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const today = computed(() => now.value);
const currentHour = computed(() => now.value.getHours());

const selectedCalendarDate = ref(today.value.toISOString().slice(0, 10));

const calendarDays = computed(() => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Show 3 days before today + today + 3 after = 7 days
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today.value);
    d.setDate(today.value.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      dateStr,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
});

// ─── Learning Block Definitions ───────────────────────────────────────────────
const BLOCK_DEFS = [
  {
    id: '🌞 Morning Energy (6 AM – 10 AM)',
    name: 'Morning Energy',
    subtitle: 'Wake up your body and mind',
    emoji: '🌞',
    timeRange: '6:00 AM – 10:00 AM',
    startHour: 6,
    endHour: 10,
    heroBg: 'bg-amber-50 border-amber-200',
    glowColor: 'bg-amber-400',
    accentText: 'text-amber-600',
    dotColor: 'bg-amber-500',
    titleColor: 'text-amber-900',
    subtitleColor: 'text-amber-700/70',
    btnClass: 'bg-amber-800 hover:bg-amber-900 text-amber-50 shadow-amber-800/30',
    taskIcon: 'fa-bell',
    iconHex: '#b45309',
    cardBg: 'bg-amber-50/60 border-amber-100/80',
    accent: 'bg-amber-400',
    titleText: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-600',
    pctText: 'text-amber-500',
    checkColor: 'amber',
    markBtnText: 'text-amber-600 hover:text-amber-800',
    progressBar: 'bg-amber-400',
    legendDot: 'bg-amber-400',
    activeRing: 'ring-amber-300',
  },
  {
    id: '🧠 Deep Learning (10 AM – 2 PM)',
    name: 'Deep Learning',
    subtitle: 'Academic focus and problem-solving',
    emoji: '🧠',
    timeRange: '10:00 AM – 2:00 PM',
    startHour: 10,
    endHour: 14,
    heroBg: 'bg-blue-50 border-blue-200',
    glowColor: 'bg-blue-400',
    accentText: 'text-blue-600',
    dotColor: 'bg-blue-500',
    titleColor: 'text-blue-900',
    subtitleColor: 'text-blue-700/70',
    btnClass: 'bg-blue-700 hover:bg-blue-800 text-blue-50 shadow-blue-700/30',
    taskIcon: 'fa-book-open',
    iconHex: '#1d4ed8',
    cardBg: 'bg-blue-50/60 border-blue-100/80',
    accent: 'bg-blue-400',
    titleText: 'text-blue-800',
    iconBg: 'bg-blue-100 text-blue-600',
    pctText: 'text-blue-500',
    checkColor: 'blue',
    markBtnText: 'text-blue-600 hover:text-blue-800',
    progressBar: 'bg-blue-400',
    legendDot: 'bg-blue-400',
    activeRing: 'ring-blue-300',
  },
  {
    id: '😴 Rest & Creative (2 PM – 6 PM)',
    name: 'Rest & Creative',
    subtitle: 'Imagination and expression',
    emoji: '😴',
    timeRange: '2:00 PM – 6:00 PM',
    startHour: 14,
    endHour: 18,
    heroBg: 'bg-purple-50 border-purple-200',
    glowColor: 'bg-purple-400',
    accentText: 'text-purple-600',
    dotColor: 'bg-purple-500',
    titleColor: 'text-purple-900',
    subtitleColor: 'text-purple-700/70',
    btnClass: 'bg-purple-700 hover:bg-purple-800 text-purple-50 shadow-purple-700/30',
    taskIcon: 'fa-palette',
    iconHex: '#7c3aed',
    cardBg: 'bg-purple-50/60 border-purple-100/80',
    accent: 'bg-purple-400',
    titleText: 'text-purple-800',
    iconBg: 'bg-purple-100 text-purple-600',
    pctText: 'text-purple-500',
    checkColor: 'purple',
    markBtnText: 'text-purple-600 hover:text-purple-800',
    progressBar: 'bg-purple-400',
    legendDot: 'bg-purple-400',
    activeRing: 'ring-purple-300',
  },
  {
    id: '🌆 Life Learning (6 PM – 10 PM)',
    name: 'Life Learning',
    subtitle: 'Evening flow and daily skills',
    emoji: '🌆',
    timeRange: '6:00 PM – 10:00 PM',
    startHour: 18,
    endHour: 22,
    heroBg: 'bg-emerald-50 border-emerald-200',
    glowColor: 'bg-emerald-400',
    accentText: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
    titleColor: 'text-emerald-900',
    subtitleColor: 'text-emerald-700/70',
    btnClass: 'bg-emerald-700 hover:bg-emerald-800 text-emerald-50 shadow-emerald-700/30',
    taskIcon: 'fa-house-chimney',
    iconHex: '#047857',
    cardBg: 'bg-emerald-50/60 border-emerald-100/80',
    accent: 'bg-emerald-400',
    titleText: 'text-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-600',
    pctText: 'text-emerald-500',
    checkColor: 'emerald',
    markBtnText: 'text-emerald-600 hover:text-emerald-800',
    progressBar: 'bg-emerald-400',
    legendDot: 'bg-emerald-400',
    activeRing: 'ring-emerald-300',
  },
];

// ─── Map lesson to a block ────────────────────────────────────────────────────
// Priority: 1) Explicit Lesson.BlockType (manual assignment)
//           2) Explicit task.BlockType on any task of this lesson
//           3) Subject/lesson name fuzzy match
//           4) Round-robin fallback
function getBlockIdForLesson(lesson, index) {
  // 1. Primary: Explicit Lesson-level assignment
  if (lesson.BlockType) return lesson.BlockType;

  // 2. Secondary: Check if any task in this lesson has an explicit BlockType
  const tasks = taskRepository.getTasks().filter(t => t.LessonId === lesson.LessonId);
  const explicitTaskBlock = tasks.find(t => t.BlockType)?.BlockType;
  if (explicitTaskBlock) {
    // We need to map the internal task-level block IDs
    // to the new full-string Lesson-level IDs.
    const map = {
      'morning': '🌞 Morning Energy (6 AM – 10 AM)',
      'deep': '🧠 Deep Learning (10 AM – 2 PM)',
      'creative': '😴 Rest & Creative (2 PM – 6 PM)',
      'life': '🌆 Life Learning (6 PM – 10 PM)'
    };
    return map[explicitTaskBlock] || explicitTaskBlock;
  }

  // 3. Fuzzy match subject/lesson name
  const name = (lesson.SubjectName || lesson['LessonName'] || '').toLowerCase();
  if (/physical|sport|play|motor|outdoor|exercise|yoga|stretch/.test(name))            return '🌞 Morning Energy (6 AM – 10 AM)';
  if (/math|science|reading|language|history|geography|cognitive|puzzle|word|literacy/.test(name)) return '🧠 Deep Learning (10 AM – 2 PM)';
  if (/art|creat|draw|paint|music|story|craft|drama|imag|express|colou?r/.test(name)) return '😴 Rest & Creative (2 PM – 6 PM)';
  if (/life|skill|cook|clean|help|home|daily|social|hygiene|chore|bedtime|evening/.test(name))    return '🌆 Life Learning (6 PM – 10 PM)';

  // 4. Round-robin fallback
  const ids = [
    '🌞 Morning Energy (6 AM – 10 AM)', 
    '🧠 Deep Learning (10 AM – 2 PM)', 
    '😴 Rest & Creative (2 PM – 6 PM)', 
    '🌆 Life Learning (6 PM – 10 PM)'
  ];
  return ids[index % 4];
}

// ─── Hydrated learning blocks (with lessons + progress) ───────────────────────
const learningBlocks = computed(() => {
  const weekLessons = lessonRepository.getLessons().filter(l => normalizeBool(l.LearnInThisWeek));

  return BLOCK_DEFS.map(def => {
    const lessons = weekLessons.filter((l, i) => getBlockIdForLesson(l, i) === def.id);
    const totalLessons = lessons.length;
    const doneLessons = lessons.filter(l => getLessonProgress(l) >= 100).length;
    const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

    return { ...def, lessons, progress, doneLessons, totalLessons };
  });
});

// ─── Auto-detect currently active block from the hour ─────────────────────────
const activeBlock = computed(() => {
  const hour = currentHour.value;
  
  // Find block using exact range
  const block = learningBlocks.value.find(b => hour >= b.startHour && hour < b.endHour);
  if (block) return block;

  // Smart fallback: 
  // If it's early morning (before 6 AM), we are likely still in "Life Learning" mode (sleep/night).
  if (hour < 6) return learningBlocks.value.find(b => b.id === '🌆 Life Learning (6 PM – 10 PM)') || learningBlocks.value[0];
  
  // Otherwise fallback to first block
  return learningBlocks.value[0];
});

// ─── Daily progress (overall) ─────────────────────────────────────────────────
const completedTasksTotal = computed(() =>
  learningBlocks.value.reduce((sum, b) => sum + b.doneLessons, 0)
);
const totalTasksCount = computed(() =>
  learningBlocks.value.reduce((sum, b) => sum + b.totalLessons, 0)
);
const overallProgress = computed(() => {
  if (totalTasksCount.value === 0) return 0;
  return Math.round((completedTasksTotal.value / totalTasksCount.value) * 100);
});

// ─── Today's Learning Engine ───────────────────────────────────────────────
const aiSuggestions = ref({});
const loadingAi = ref({});

const todaysLessons = computed(() => {
  const allLessons = lessonRepository.getLessons();
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  
  return allLessons.filter(l => {
    // 1. Dormant check: ignore if no status (user will add step by step)
    if (!l.Status || l.Status === 'Pending') return false;
    
    // 2. Schedule check: nextDueDate <= today
    if (!l.NextDueDate) return true; // Show if introduced but never scheduled
    
    const dueDate = new Date(l.NextDueDate);
    dueDate.setHours(0,0,0,0);
    return dueDate <= todayDate;
  });
});

const lessonGroups = computed(() => {
  const lessons = todaysLessons.value;
  return [
    { 
      title: 'New Discoveries', 
      lessons: lessons.filter(l => l.Status === STATUS_LEVELS.INTRODUCED),
      icon: 'fa-wand-magic-sparkles',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    { 
      title: 'Building Skills', 
      lessons: lessons.filter(l => [STATUS_LEVELS.PRACTICING, STATUS_LEVELS.FAMILIAR].includes(l.Status)),
      icon: 'fa-seedling',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    { 
      title: 'Mastery Refresher', 
      lessons: lessons.filter(l => [STATUS_LEVELS.MASTERED, STATUS_LEVELS.REVISIT].includes(l.Status)),
      icon: 'fa-trophy',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];
});

const handleMarkDone = async (lesson) => {
  await lessonRepository.markLessonPracticed(lesson);
};

// ─── Progress Insights Analytics ───────────────────────────────────────────
const statusSummary = computed(() => {
  const lessons = lessonRepository.getLessons();
  const counts = {
    [STATUS_LEVELS.INTRODUCED]: 0,
    [STATUS_LEVELS.PRACTICING]: 0,
    [STATUS_LEVELS.FAMILIAR]: 0,
    [STATUS_LEVELS.MASTERED]: 0,
    [STATUS_LEVELS.REVISIT]: 0,
  };
  
  lessons.forEach(l => {
    if (counts[l.Status] !== undefined) counts[l.Status]++;
  });

  return [
    { label: 'Introduced', count: counts[STATUS_LEVELS.INTRODUCED], color: '#06b6d4' }, // cyan-500
    { label: 'Practicing', count: counts[STATUS_LEVELS.PRACTICING], color: '#f59e0b' }, // amber-500
    { label: 'Familiar', count: counts[STATUS_LEVELS.FAMILIAR], color: '#6366f1' },   // indigo-500
    { label: 'Mastered', count: counts[STATUS_LEVELS.MASTERED], color: '#10b981' },   // emerald-500
  ];
});

const masteredPercentage = computed(() => {
  const lessons = lessonRepository.getLessons();
  if (lessons.length === 0) return 0;
  const mastered = lessons.filter(l => l.Status === STATUS_LEVELS.MASTERED).length;
  return Math.round((mastered / lessons.length) * 100);
});

const statusDonutSegments = computed(() => {
  const lessons = lessonRepository.getLessons();
  if (lessons.length === 0) return [];
  
  let currentOffset = 0;
  return statusSummary.value.map(s => {
    const percentage = (s.count / lessons.length) * 100;
    // Stroke calculation (circumference of r=40 is ~251.3)
    const circum = 2 * Math.PI * 40;
    const dashArray = `${(percentage * circum) / 100} ${circum}`;
    const dashOffset = - (currentOffset * circum) / 100;
    currentOffset += percentage;
    return { ...s, dashArray, dashOffset };
  });
});

const subjectMasteryList = computed(() => {
  const lessons = lessonRepository.getLessons();
  const subjects = dataStore.state.subjects;
  
  return subjects.map(s => {
    const subjectLessons = lessons.filter(l => l.SubjectId === s.SubjectId);
    if (subjectLessons.length === 0) return { name: s.SubjectName, rate: 0 };
    const mastered = subjectLessons.filter(l => l.Status === STATUS_LEVELS.MASTERED).length;
    return {
      name: s.SubjectName,
      rate: (mastered / subjectLessons.length) * 100
    };
  }).sort((a, b) => b.rate - a.rate);
});

const LEARENING_BLOCKS_WITH_PROGRESS = computed(() => {
  // Mock logic to show segments in the progress bar if desired
  return { id: 'all', bg: 'bg-indigo-500', width: overallProgress.value };
});

const getAiHelp = async (lesson) => {
  if (loadingAi.value[lesson.LessonId]) return;
  
  loadingAi.value[lesson.LessonId] = true;
  try {
    // Call our new GAS function
    const result = await dispatchAction('getAlternativeActivityWithAi', lesson['LessonName'], '2-3');
    if (result && result.status === 'success') {
      aiSuggestions.value[lesson.LessonId] = result.suggestion;
    }
  } catch (e) {
    console.error('AI SUGGESTION FAILED:', e);
  } finally {
    loadingAi.value[lesson.LessonId] = false;
  }
};

// ─── Existing computed (preserved) ────────────────────────────────────────────
const activeLessonsThisWeek = computed(() => {
  return lessonRepository.getLessons().filter(l => normalizeBool(l.LearnInThisWeek));
});

const weekTasksAll = computed(() => {
  const ids = new Set(activeLessonsThisWeek.value.map(l => l.LessonId));
  return taskRepository.getTasks().filter(t => ids.has(t.LessonId));
});

const weekTasksFiltered = computed(() => {
  let tasks = weekTasksAll.value;
  if (taskFilter.value === 'incomplete') tasks = tasks.filter(t => !isTaskDone(t));
  else if (taskFilter.value === 'complete') tasks = tasks.filter(t => isTaskDone(t));
  return tasks;
});

const isTaskDone = (task) => {
  const learned = parseInt(task.LearnedCount) || 0;
  const target = parseInt(task.TargetCount) || 1;
  return learned >= target;
};

const getLesson = (id) => lessonRepository.getLessonById(id);
const getTaskCount = (lessonId) => taskRepository.getTasksByLesson(lessonId).length;

// ─── Existing actions (preserved exactly) ────────────────────────────────────
const handleDashboardTaskCount = async (task, increment) => {
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
    task.TaskName || 'Task',
    newStatus,
    newCount,
    target,
    task.Photo,
    task.BlockType
  );
};

// ─── Actions moved to LessonDetail / Curriculum ─────────────────────────────

// ─── Contextual alerts (preserved) ───────────────────────────────────────────
const contextualAlerts = computed(() => {
  const alerts = [];
  const weekIds = new Set(activeLessonsThisWeek.value.map(l => l.LessonId));
  const weekTasks = taskRepository.getTasks().filter(t => weekIds.has(t.LessonId));
  const pendingCount = weekTasks.filter(t => !isTaskDone(t)).length;

  if (pendingCount > 0) {
    alerts.push({ type: 'warning', icon: 'fa-triangle-exclamation', message: `${pendingCount} tasks are still pending this week.` });
  } else if (weekTasks.length > 0) {
    alerts.push({ type: 'success', icon: 'fa-award', message: `All caught up! Every task is done this week. 🎉` });
  }

  const lagging = activeLessonsThisWeek.value.filter(l => getLessonProgress(l) < 30);
  if (lagging.length > 0) {
    alerts.push({ type: 'info', icon: 'fa-chart-line', message: `${lagging[0].SubjectName} (${lagging[0]['LessonName']}) is under 30%.` });
  }
  return alerts;
});
</script>
