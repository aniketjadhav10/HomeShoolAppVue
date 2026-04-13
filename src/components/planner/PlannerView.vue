<template>
  <section class="space-y-4 md:space-y-8 h-full flex flex-col" key="planner">
    
    <!-- Top Nav / Header Mode -->
    <header class="flex flex-col items-center justify-between gap-4 animate-slide-up shrink-0 pt-2">
      <div class="flex bg-slate-900 rounded-full p-1 shadow-lg shadow-slate-200/50 w-full sm:w-auto max-w-sm">
        <button @click="viewMode = 'Day'" :class="[viewMode === 'Day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-white', 'flex-1 px-4 py-2 rounded-full text-xs font-bold transition-all']">Day</button>
        <button @click="viewMode = 'Month'" :class="[viewMode === 'Month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-white', 'flex-1 px-4 py-2 rounded-full text-xs font-bold transition-all']">Month</button>
      </div>
      
      <!-- Date Picker for Month Mode -->
      <div v-if="viewMode === 'Month'" class="flex flex-col items-center w-full mt-2 space-y-4">
        <div class="text-sm font-black text-slate-600">{{ currentYear }}</div>
        
        <!-- Month Scroller -->
        <div class="flex items-center w-full overflow-x-auto scrollbar-hide gap-6 px-4 py-1 snap-x justify-start sm:justify-center">
          <button v-for="(month, index) in monthNames" :key="month" @click="setMonth(index)" :class="[currentMonth === index ? 'text-slate-800 font-black border border-slate-800 rounded-full w-12 h-12 flex items-center justify-center shrink-0 shadow-md ring-4 ring-slate-100' : 'text-slate-400 font-bold hover:text-slate-600 transition-colors', 'snap-center text-sm']">
            <span v-if="currentMonth === index">{{ month.slice(0,3) }}</span>
            <span v-else>{{ month.slice(0,3) }}</span>
          </button>
        </div>
        
        <div class="flex flex-wrap justify-center gap-3 text-[10px] sm:text-xs font-bold text-slate-400 mt-2">
          <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-blue-500"></div> History/SS</span>
          <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-purple-500"></div> Lang Arts</span>
          <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-pink-500"></div> Math</span>
          <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> Science</span>
          <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-slate-800"></div> Tasks</span>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto w-full relative pb-10">
      
      <!-- MONTH VIEW -->
      <transition name="fade" mode="out-in">
        <div v-if="viewMode === 'Month'" class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full border border-slate-100 animate-slide-up">
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 w-full border-b border-slate-100 bg-slate-50">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center py-3 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
              {{ day }}
            </div>
          </div>
          
          <div class="grid grid-cols-7 auto-rows-[60px] sm:auto-rows-[80px] w-full p-2 gap-1 flex-1 content-start">
            <!-- Empty slots before 1st day -->
            <div v-for="n in firstDayOfMonth" :key="'empty'+n" class="w-full h-full rounded-2xl bg-transparent"></div>
            
            <!-- Days -->
            <div v-for="date in daysInMonth" :key="date" @click="selectedDate = getFullDateString(date)" :class="['relative flex flex-col items-center justify-center p-1 rounded-2xl cursor-pointer transition-all active:scale-90', getFullDateString(date) === selectedDate ? 'bg-blue-50 shadow-inner border border-blue-200 ring-2 ring-blue-500/20' : 'hover:bg-slate-50', hasEvents(date) ? (hasHolidayOrBreak(date) ? 'bg-amber-50/50' : 'bg-emerald-50/30') : '']">
              <span :class="['text-xs sm:text-sm font-bold z-10', getFullDateString(date) === selectedDate ? 'text-blue-600' : 'text-slate-600']">{{ date }}</span>
              
              <!-- Progress Arc / Dots Mock -->
              <div v-if="hasEvents(date)" class="absolute inset-0 m-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-200 opacity-60"></div>
              <div v-if="hasEvents(date)" class="absolute inset-0 m-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500 border-l-transparent border-t-transparent -rotate-45" style="border-width: 2.5px;"></div>
              
              <div v-if="hasEvents(date)" class="mt-2 text-[8px] sm:text-[9px] font-black text-slate-400">{{ getEventProgress(date) }}</div>
            </div>
          </div>
          
          <!-- Bottom Selected Day Events Panel -->
          <transition name="slide-up">
            <div v-if="selectedDate" class="bg-white border-t border-slate-100 p-4 sm:p-6 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] relative z-20 shrink-0">
              <button @click="selectedDate = null" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center transition-all"><i class="fa-solid fa-xmark text-xs"></i></button>
              
              <h4 class="font-black text-slate-800 text-sm sm:text-base mb-4">{{ formatSelectedDateDisplay(selectedDate) }}</h4>
              
              <div v-if="getEventsForDate(selectedDate).length === 0" class="text-xs text-slate-400 italic mb-4">No events mapped for this day.</div>
              
              <ul class="space-y-3 mb-5 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                <li v-for="(event, idx) in getEventsForDate(selectedDate)" :key="'evt'+idx" class="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                  <div v-if="event.IsLesson" class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-200">
                    <i class="fa-solid fa-book-open text-[10px]"></i>
                  </div>
                  <div v-else :class="['w-2 h-2 rounded-sm shrink-0 mx-3', getEventTypeColor(event.Type)]"></div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs sm:text-sm font-bold text-slate-700 truncate">{{ event.Title }}</span>
                      <span v-if="event.IsLesson" class="text-[8px] font-black uppercase tracking-tighter text-indigo-400 border border-indigo-100 px-1.5 py-0.5 rounded bg-white">Lesson</span>
                    </div>
                    <p v-if="event.IsLesson" class="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{{ event.Subject }} • {{ event.Status }}</p>
                  </div>
                  <i class="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                </li>
              </ul>
              
              <button @click="showAddEventModal = true" class="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-transform outline-none">
                Add Calendar Event
              </button>
            </div>
          </transition>
          
        </div>

        <!-- DAY / AGENDA VIEW (Original Planner functionality) -->
        <div v-else class="space-y-4 md:space-y-6 h-full pb-10 animate-slide-up">
           <div class="flex items-center gap-2 md:gap-3 bg-white/80 p-1.5 md:p-2.5 rounded-xl border border-slate-200 shadow-md shadow-slate-200/50 w-full mb-4">
            <label class="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest pl-2 md:pl-3 shrink-0">Focus Date</label>
            <input type="date" v-model="plannerDate" class="flex-1 min-w-0 md:flex-none bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl px-2 py-1.5 md:px-3 md:py-2.5 text-xs md:text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div class="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-4 md:p-8 shadow-xl shadow-slate-200/50">
            <h3 class="text-base md:text-lg font-black flex items-center gap-2 md:gap-3 mb-4 text-slate-800"><div class="p-1.5 md:p-2 bg-amber-100 rounded-xl"><i class="fa-solid fa-sun text-amber-500 text-xs md:text-sm"></i></div> Today's Block Runs</h3>
            <transition-group name="list" tag="div" class="space-y-3">
              <div v-if="agendaToday.length === 0" key="empty" class="py-8 text-sm text-center text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-full overflow-hidden">No timeline blocks setup.</div>
              <div v-for="item in agendaToday" :key="item.ScheduleId" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-3 px-4 bg-white border border-slate-200 border-l-[4px] border-l-blue-500 rounded-2xl shadow-sm hover:shadow-lg transition-all group relative">
                <div class="text-[10px] md:text-xs font-black text-slate-500 w-auto md:w-32 shrink-0 bg-slate-100 px-2.5 py-1 md:py-1.5 rounded-lg text-center md:text-left self-start md:self-auto border border-slate-200 uppercase tracking-widest">{{ item.StartTime || '00:00' }} - {{ item.EndTime || '00:00' }}</div>
                <div class="flex-1 min-w-0 pr-8 md:pr-0">
                  <h4 class="font-black text-slate-800 text-[13px] md:text-base truncate">{{ item.SubjectName }} <span class="text-slate-300 mx-1 font-normal">•</span> {{ item.LessonName }}</h4>
                  <p v-if="item.Notes" class="text-[9px] md:text-[10px] font-medium text-slate-500 mt-1 truncate max-w-full">{{ item.Notes }}</p>
                </div>
              </div>
            </transition-group>
          </div>

          <div class="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-4 md:p-8 shadow-xl shadow-slate-200/50">
            <h3 class="text-base font-black flex items-center gap-2 mb-4 text-slate-800"><div class="p-1.5 md:p-2 bg-blue-100 rounded-xl"><i class="fa-solid fa-clock text-blue-500 text-xs md:text-sm"></i></div> New Block</h3>
            <form @submit.prevent="addSchedule" class="flex flex-col gap-3">
              <div class="grid grid-cols-2 gap-3 w-full">
                <div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest pl-1">Start</label><input type="time" v-model="scheduleForm.start" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none" /></div>
                <div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest pl-1">End</label><input type="time" v-model="scheduleForm.end" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none" /></div>
              </div>
              <div class="w-full">
                <label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest pl-1">Attach Module</label>
                <select v-model="scheduleForm.lessonId" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg...')] pr-10">
                  <option value="" disabled class="text-slate-400 font-normal">Select lesson...</option>
                  <option v-for="l in lessonRepository.getLessons()" :key="l.LessonId" :value="l.LessonId" class="font-bold bg-white text-slate-800">{{ l.SubjectName }} • {{ l['LessonName'] }}</option>
                </select>
              </div>
              <button type="submit" class="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-blue-500/30 transition-all outline-none active:scale-95 flex items-center justify-center gap-2"><i class="fa-solid fa-plus"></i> Reserve Block</button>
            </form>
          </div>
        </div>
      </transition>
    </div>

    <!-- ADD CALENDAR EVENT MODAL -->
    <div v-if="showAddEventModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in" @click.self="showAddEventModal = false">
      <div class="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 max-w-md w-full animate-slide-up p-6 md:p-8">
        <h3 class="text-xl md:text-2xl font-black text-slate-800 mb-2">Schedule Event</h3>
        <p class="text-slate-500 text-xs md:text-sm mb-6 font-medium">For <span class="font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{{ formatSelectedDateDisplay(selectedDate) }}</span></p>
        
        <form @submit.prevent="saveEvent" class="space-y-4">
          <div>
             <label class="block text-xs font-bold text-slate-600 mb-1.5">Event Title</label>
             <input v-model="eventForm.title" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium" placeholder="E.g. Spring Break, Spelling Test...">
          </div>
          <div>
             <label class="block text-xs font-bold text-slate-600 mb-1.5">Type</label>
             <select v-model="eventForm.type" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700">
               <option value="Task">Task</option>
               <option value="Holiday">Holiday</option>
               <option value="Break">Break</option>
               <option value="Event">General Event</option>
             </select>
          </div>
          <div>
             <label class="block text-xs font-bold text-slate-600 mb-1.5">Notes (Optional)</label>
             <input v-model="eventForm.notes" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium" placeholder="Brief notes...">
          </div>
          
          <div class="flex justify-end gap-3 mt-8 pt-2">
            <button type="button" @click="showAddEventModal = false" class="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors">Cancel</button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { dataStore, dispatchAction } from '../../stores/dataStore';
import { lessonRepository } from '../../repositories/lessonRepository';
import { plannerRepository } from '../../repositories/plannerRepository';
import { normalizeBool } from '../../composables/useLessonStatus';

// === VIEW MODES ===
const viewMode = ref('Month'); 

// === MONTH CALENDAR LOGIC ===
const currentDate = new Date();
const currentYear = ref(currentDate.getFullYear());
const currentMonth = ref(currentDate.getMonth()); // 0-11
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const selectedDate = ref(null); // 'YYYY-MM-DD'
const showAddEventModal = ref(false);

const eventForm = ref({ title: '', type: 'Task', notes: '' });

const setMonth = (idx) => {
  currentMonth.value = idx;
  selectedDate.value = null; // reset selected
};

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const getFullDateString = (day) => {
  const y = currentYear.value;
  const m = String(currentMonth.value + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatSelectedDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Mock Events Check
const getLessonsByDate = (dateStr) => {
  if (!dateStr) return [];
  // Only show lessons that are marked for this week and match the due date
  return lessonRepository.getLessons().filter(l => {
    if (!normalizeBool(l.LearnInThisWeek)) return false;
    if (!l.NextDueDate) return false;
    // Extract YYYY-MM-DD from ISO string
    const dueDate = new Date(l.NextDueDate).toISOString().split('T')[0];
    return dueDate === dateStr;
  }).map(l => ({
    Title: l['LessonName'],
    Subject: l.SubjectName,
    Type: 'Lesson',
    Status: l.Status,
    IsLesson: true
  }));
};

const getEventsForDate = (dateStr) => {
  const events = plannerRepository.getEventsByDate(dateStr);
  const lessons = getLessonsByDate(dateStr);
  return [...events, ...lessons];
};

const hasEvents = (day) => {
  const dateStr = getFullDateString(day);
  return getEventsForDate(dateStr).length > 0;
};

const hasHolidayOrBreak = (day) => {
  const dateStr = getFullDateString(day);
  return getEventsForDate(dateStr).some(e => e.Type === 'Holiday' || e.Type === 'Break');
};

const getEventProgress = (day) => {
  const evts = getEventsForDate(getFullDateString(day));
  const tasks = evts.filter(e => e.Type === 'Task');
  if (tasks.length === 0) return `${evts.length}/${evts.length}`;
  // For aesthetic
  return `0/${tasks.length}`;
};

const getEventTypeColor = (type) => {
  switch (type) {
    case 'Holiday': return 'bg-amber-500';
    case 'Break': return 'bg-pink-500';
    case 'Task': return 'bg-purple-500';
    default: return 'bg-blue-500';
  }
};

const saveEvent = async () => {
  if (eventForm.value.title && selectedDate.value) {
    await plannerRepository.saveCalendarEvent(null, selectedDate.value, eventForm.value.title, eventForm.value.type, eventForm.value.notes);
    showAddEventModal.value = false;
    eventForm.value = { title: '', type: 'Task', notes: '' };
  }
};

// === AGENDA (ORIGINAL PLANNER) LOGIC ===
const plannerDate = ref(new Date().toISOString().slice(0, 10));
const scheduleForm = ref({ start: '09:00', end: '10:00', lessonId: '', notes: '' });

const agendaToday = computed(() => {
  return plannerRepository.getSchedulesByDate(plannerDate.value)
    .sort((a,b) => (a.StartTime || '').localeCompare(b.StartTime || ''));
});

const getLesson = (id) => lessonRepository.getLessonById(id);

const addSchedule = async () => {
  const les = getLesson(scheduleForm.value.lessonId);
  if (!les) return;
  await plannerRepository.saveScheduleEntry(null, plannerDate.value, scheduleForm.value.start, scheduleForm.value.end,
    les.SubjectId, les.SubjectName, les.LessonId, les['LessonName'], scheduleForm.value.notes
  );
  scheduleForm.value.notes = '';
};

</script>
