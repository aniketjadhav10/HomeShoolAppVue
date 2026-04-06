<template>
  <div class="flex flex-col md:flex-row h-screen w-full font-sans text-slate-800 overflow-hidden relative selection:bg-blue-500/20 bg-slate-50/30">
    
    <!-- Mobile Top App Bar -->
    <header class="md:hidden w-full h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-5 fixed top-0 left-0 z-40 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-md cursor-pointer active:scale-95 transition-transform" @click="setTab('dashboard')">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <h1 class="text-xl font-black tracking-tight text-slate-800">Homeschool <span class="text-blue-600">OS</span></h1>
      </div>
    </header>

    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex w-64 bg-white/50 border-r border-slate-200 flex-col flex-shrink-0 z-40 shadow-sm backdrop-blur-2xl">
      <div class="p-6 flex items-center gap-4 border-b border-slate-200 shrink-0">
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30">
          <i class="fa-solid fa-graduation-cap text-xl"></i>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-slate-800">Homeschool<br><span class="text-blue-600">OS</span></h1>
      </div>
      <nav class="p-5 flex flex-col gap-3 flex-1 overflow-y-auto">
        <button v-for="tab in tabs" :key="tab.id" 
                @click="setTab(tab.id)"
                :class="[ 'flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-sm font-bold outline-none active:scale-95 origin-left', 
                         (activeTab === tab.id && (!selectedLesson || tab.id === 'lessons')) 
                         ? 'bg-blue-50 text-blue-600 shadow-[inset_4px_0_0_#3b82f6] shadow-sm' 
                         : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' ]">
          <i :class="['w-6 text-xl text-center', tab.icon]"></i> 
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content Flow (Scrollable) -->
    <main class="flex-1 overflow-y-auto w-full h-full relative scroll-smooth pt-20 pb-28 md:pt-0 md:pb-0 p-5 md:p-8 lg:p-10 z-10">
      
      <div class="max-w-6xl mx-auto space-y-8 h-full">

        <!-- DASHBOARD VIEW -->
        <transition name="fade" mode="out-in">
          <section v-if="activeTab === 'dashboard' && !selectedLesson" class="space-y-6 md:space-y-10" key="dashboard">
            <header class="animate-slide-up">
              <h2 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Overview</h2>
              <p class="text-slate-500 mt-2 text-md md:text-lg font-medium">Track your educational progress.</p>
            </header>

            <!-- Metrics grid - swipeable row on mobile, grid on desktop -->
            <div class="-mx-5 px-5 md:mx-0 md:px-0 flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:gap-6 pb-4 md:pb-0 animate-slide-up snap-x snap-mandatory" style="animation-delay: 50ms;">
              <!-- Complete Filter -->
              <div @click="taskFilter = 'complete'" :class="[taskFilter === 'complete' ? 'ring-2 ring-emerald-500 shadow-emerald-500/20 bg-white scale-100 md:scale-105' : 'hover:bg-white bg-white/70', 'cursor-pointer transition-all duration-300 backdrop-blur-xl border border-slate-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center gap-4 shadow-xl shadow-slate-200/50 group min-w-[200px] md:min-w-0 snap-center']">
                <div class="p-4 bg-emerald-100/80 text-emerald-600 rounded-[1.5rem] text-2xl group-active:scale-90 transition-transform"><i class="fa-solid fa-check-double"></i></div>
                <div>
                  <h3 class="text-3xl md:text-4xl font-black text-slate-800">{{ completedTasksCount }}</h3>
                  <label class="text-[0.7rem] uppercase tracking-wider text-slate-500 font-bold cursor-pointer mt-1 block">Completed</label>
                </div>
              </div>
              
              <!-- In Progress Filter -->
              <div @click="taskFilter = 'incomplete'" :class="[taskFilter === 'incomplete' ? 'ring-2 ring-pink-500 shadow-pink-500/20 bg-white scale-100 md:scale-105' : 'hover:bg-white bg-white/70', 'cursor-pointer transition-all duration-300 backdrop-blur-xl border border-slate-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center gap-4 shadow-xl shadow-slate-200/50 group min-w-[200px] md:min-w-0 snap-center']">
                <div class="p-4 bg-pink-100/80 text-pink-600 rounded-[1.5rem] text-2xl group-active:scale-90 transition-transform"><i class="fa-solid fa-spinner"></i></div>
                <div>
                  <h3 class="text-3xl md:text-4xl font-black text-slate-800">{{ inProgressTasksCount }}</h3>
                  <label class="text-[0.7rem] uppercase tracking-wider text-slate-500 font-bold cursor-pointer mt-1 block">In Progress</label>
                </div>
              </div>
              
              <!-- All Tasks Filter -->
              <div @click="taskFilter = 'all'" :class="[taskFilter === 'all' ? 'ring-2 ring-blue-500 shadow-blue-500/20 bg-white scale-100 md:scale-105' : 'hover:bg-white bg-white/70', 'cursor-pointer transition-all duration-300 backdrop-blur-xl border border-slate-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center gap-4 shadow-xl shadow-slate-200/50 group min-w-[200px] md:min-w-0 snap-center']">
                <div class="p-4 bg-amber-100/80 text-amber-600 rounded-[1.5rem] text-2xl group-active:scale-90 transition-transform"><i class="fa-solid fa-fire"></i></div>
                <div>
                  <h3 class="text-3xl md:text-4xl font-black text-slate-800">{{ activeLessonsThisWeek.length }}</h3>
                  <label class="text-[0.7rem] uppercase tracking-wider text-slate-500 font-bold cursor-pointer mt-1 block">Learn Weekly</label>
                </div>
              </div>
            </div>

            <!-- Priority -->
            <div class="animate-slide-up" style="animation-delay: 100ms;">
              <h3 class="text-xl font-bold flex items-center gap-3 mb-4 md:mb-5 text-slate-800"><i class="fa-solid fa-calendar-week text-blue-500 p-1.5 bg-blue-100 rounded-lg text-sm"></i> Focus Area</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                <transition-group name="list">
                  <div v-if="activeLessonsThisWeek.length === 0" key="empty" class="col-span-full py-10 text-center text-slate-500 bg-white/50 italic border border-dashed border-slate-300 rounded-[2rem] shadow-sm">
                    No lessons marked for focus this week.
                  </div>
                  <div v-for="lesson in activeLessonsThisWeek" :key="lesson.LessonId" @click="openLesson(lesson)" class="bg-white/80 hover:bg-white border border-slate-200 p-5 rounded-[2rem] cursor-pointer transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-xl shadow-sm shadow-blue-500/5 active:scale-95 group">
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">{{ lesson.SubjectName }}</span>
                      <span class="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">{{ getLessonProgress(lesson) }}%</span>
                    </div>
                    <h4 class="text-lg md:text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{{ lesson['Lesson Name'] }}</h4>
                    <p class="text-xs md:text-sm text-slate-500 mt-2 line-clamp-2 font-medium">{{ lesson.Description || 'No description provided.' }}</p>
                    <div class="bg-slate-100 h-2 rounded-full mt-4 overflow-hidden shadow-inner">
                      <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-700 ease-out" :style="{ width: `${getLessonProgress(lesson)}%` }"></div>
                    </div>
                  </div>
                </transition-group>
              </div>
            </div>

            <!-- Weekly Tasks List -->
            <div class="animate-slide-up" style="animation-delay: 150ms;">
              <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-5 gap-4">
                <h3 class="text-xl font-bold flex items-center gap-3 text-slate-800"><i class="fa-solid fa-list-check text-emerald-500 p-1.5 bg-emerald-100 rounded-lg text-sm"></i> Filtered Tasks</h3>
                <div class="flex bg-slate-200 p-1 rounded-xl border border-slate-200/50 shadow-inner w-full md:w-auto overflow-x-auto scrollbar-hide shrink-0">
                  <button @click="taskFilter = 'all'" :class="['flex-1 md:flex-none text-xs px-5 py-2.5 rounded-[0.6rem] font-bold transition-all outline-none whitespace-nowrap active:scale-95', taskFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">All</button>
                  <button @click="taskFilter = 'incomplete'" :class="['flex-1 md:flex-none text-xs px-5 py-2.5 rounded-[0.6rem] font-bold transition-all outline-none whitespace-nowrap active:scale-95', taskFilter === 'incomplete' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Pending</button>
                  <button @click="taskFilter = 'complete'" :class="['flex-1 md:flex-none text-xs px-5 py-2.5 rounded-[0.6rem] font-bold transition-all outline-none whitespace-nowrap active:scale-95', taskFilter === 'complete' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Done</button>
                </div>
              </div>
              
              <div class="bg-white/80 border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden backdrop-blur-xl">
                <transition-group name="list">
                  <div v-if="weekTasksFiltered.length === 0" key="empty" class="py-12 text-center text-slate-500 italic bg-slate-50/50">No tasks match this filter.</div>
                  
                  <div v-for="task in weekTasksFiltered" :key="task.LessonTaskId" class="flex items-center gap-4 p-4 md:p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group active:bg-slate-100" :class="{ 'opacity-60 bg-slate-50/50': isTaskDone(task) }">
                    <input type="checkbox" :checked="isTaskDone(task)" @change="toggleTaskDone(task)" class="shrink-0 w-6 h-6 rounded-[0.4rem] border-slate-300 bg-white text-emerald-500 focus:ring-emerald-500/40 cursor-pointer shadow-sm transition-transform active:scale-75" />
                    <div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
                      <div class="min-w-0">
                        <h4 class="font-bold text-slate-800 transition-all text-[0.95rem] md:text-lg truncate" :class="{ 'line-through text-slate-500 decoration-slate-400': isTaskDone(task) }">{{ task['Task Name'] }}</h4>
                        <span class="text-[0.65rem] md:text-xs font-black tracking-widest text-slate-400 uppercase mt-0.5 block truncate">{{ getLesson(task.LessonId)?.SubjectName }} • {{ getLesson(task.LessonId)?.['Lesson Name'] }}</span>
                      </div>
                      <span class="text-xs font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0 self-start md:self-auto">{{ parseInt(task.Progress) || 0 }}%</span>
                    </div>
                  </div>
                </transition-group>
              </div>
            </div>
          </section>
        </transition>

        <!-- CURRICULUM VIEW -->
        <transition name="fade" mode="out-in">
          <section v-if="activeTab === 'lessons' && !selectedLesson" class="space-y-6 md:space-y-8" key="curriculum">
            <header class="flex flex-row items-center justify-between gap-4 animate-slide-up">
              <div>
                <h2 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Topics</h2>
                <p class="hidden md:block text-slate-500 mt-2 font-medium text-lg">Manage entire curriculum.</p>
              </div>
              <button @click="promptNewSubject" class="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-3.5 rounded-full md:rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-90 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-plus md:mr-2"></i> <span class="hidden md:inline">Add Subject</span>
              </button>
            </header>

            <div v-if="dataStore.state.subjects.length === 0" class="py-16 text-center text-slate-500 italic border border-dashed border-slate-300 bg-white/50 rounded-3xl">No subjects found.</div>
            
            <transition-group name="list">
              <div v-for="subject in dataStore.state.subjects" :key="subject.SubjectId" class="bg-white/80 border border-slate-200 rounded-[2rem] p-5 md:p-8 shadow-xl shadow-slate-200/50 mb-6 backdrop-blur-xl animate-slide-up">
                <div class="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h3 class="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                      <div class="p-2 bg-blue-100 rounded-xl shrink-0"><i class="fa-solid fa-bookmark text-blue-600 text-lg md:text-xl"></i></div>
                      <span class="break-words">{{ subject['Subject Name'] }}</span>
                    </h3>
                    <p class="text-slate-500 font-medium text-sm md:text-base mt-2 md:mt-3">{{ subject.Description }}</p>
                  </div>
                  <button @click="promptNewLesson(subject)" class="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-5 py-3 rounded-xl font-bold transition-all shrink-0 outline-none shadow-sm active:scale-95 flex justify-center items-center gap-2">
                    <i class="fa-solid fa-plus"></i> New Lesson
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div v-if="getLessonsForSubject(subject.SubjectId).length === 0" class="col-span-full py-5 text-sm text-slate-500 bg-slate-50 rounded-2xl text-center border border-slate-200 italic">No lessons in this subject yet.</div>
                  <transition-group name="list">
                    <div v-for="lesson in getLessonsForSubject(subject.SubjectId)" :key="lesson.LessonId" @click="openLesson(lesson)" class="bg-slate-50 border border-slate-200 md:hover:border-blue-300 p-5 rounded-2xl cursor-pointer transition-all duration-300 md:hover:-translate-y-1 shadow-sm md:hover:shadow-xl md:hover:shadow-blue-500/10 active:bg-slate-100 active:scale-95 group">
                      <h4 class="font-bold text-lg text-slate-800 md:group-hover:text-blue-600 transition">{{ lesson['Lesson Name'] }}</h4>
                      <div class="flex flex-wrap gap-2 mt-4">
                        <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 shadow-sm border border-slate-300/50">{{ lesson.Status || 'Pending' }}</span>
                        <span v-if="lesson.LearnInThisWeek === 'TRUE' || lesson.LearnInThisWeek === true" class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-amber-100 text-amber-600 shadow-sm border border-amber-200"><i class="fa-solid fa-fire mr-1"></i> Weekly</span>
                      </div>
                    </div>
                  </transition-group>
                </div>
              </div>
            </transition-group>
          </section>
        </transition>

        <!-- LESSON DETAIL VIEW OVERLAY FOR MOBILE / VIEW ON DESKTOP -->
        <transition name="slide-right" mode="out-in">
          <section v-if="selectedLesson" class="bg-slate-50/10 min-h-full space-y-6 md:space-y-8" key="lesson-detail">
            <!-- Mobile Sticky Back Header -->
            <div class="md:hidden flex items-center justify-start mb-4">
              <button @click="selectedLesson = null" class="text-blue-600 font-bold bg-white/80 p-3 px-5 rounded-2xl shadow-sm border border-blue-200 active:scale-95 flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> Back
              </button>
            </div>
            
            <!-- Desktop Back Button -->
            <button @click="selectedLesson = null" class="hidden md:flex text-slate-500 hover:text-blue-600 font-bold transition-all items-center gap-2 group outline-none bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:shadow-md active:scale-95 backdrop-blur w-fit">
              <i class="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> Back
            </button>
            
            <!-- Hero Card -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 md:p-12 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[60px] rounded-full md:group-hover:scale-110 transition-transform duration-1000 -mr-20 -mt-20 pointer-events-none"></div>
              <span class="text-[0.65rem] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-white shadow-sm border border-blue-100 px-3 py-1.5 rounded-lg mb-4 inline-block">{{ selectedLesson.SubjectName }}</span>
              <h2 class="text-3xl md:text-6xl font-black text-slate-800 leading-tight mb-4 break-words drop-shadow-sm w-full">{{ selectedLesson['Lesson Name'] }}</h2>
              <p class="text-slate-600 text-sm md:text-xl max-w-3xl leading-relaxed font-medium block">{{ selectedLesson.Description }}</p>
            </div>

            <!-- Task Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              <h3 class="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3"><div class="p-2 bg-blue-100 rounded-lg"><i class="fa-solid fa-list-check text-blue-500"></i></div> Needs Doing</h3>
              <button @click="handleGenerateAI" :disabled="dataStore.saving" class="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 md:py-3.5 rounded-[1.5rem] md:rounded-2xl font-black shadow-xl shadow-purple-600/30 transition-all outline-none disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95">
                <i class="fa-solid fa-wand-magic-sparkles"></i> AI Generator
              </button>
            </div>

            <!-- Task Creator Form -->
            <form @submit.prevent="addTask" class="bg-white/80 backdrop-blur border border-slate-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-stretch gap-4 shadow-xl shadow-slate-200/50">
              <div class="flex-1">
                <label class="block text-[0.65rem] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">New Task</label>
                <input v-model="newTask.name" type="text" placeholder="Task name..." required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold shadow-inner" />
              </div>
              <div class="flex-1">
                <label class="block text-[0.65rem] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Target / Notes</label>
                <input v-model="newTask.notes" type="text" placeholder="Optional details..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold shadow-inner" />
              </div>
              <button type="submit" :disabled="dataStore.saving" class="bg-blue-600 hover:bg-blue-500 text-white mt-2 md:mt-auto px-8 py-4 rounded-xl font-black shadow-lg shadow-blue-500/30 transition-all outline-none disabled:opacity-50 w-full md:w-auto flex items-center justify-center active:scale-95">
                <i class="fa-solid fa-plus md:hidden mr-2"></i> ADD
              </button>
            </form>

            <!-- Tasks Block -->
            <div class="bg-white/80 backdrop-blur rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <transition-group name="list" tag="div" class="flex flex-col">
                <div v-if="lessonSelectedTasks.length === 0" key="empty" class="py-16 text-center text-slate-500 italic bg-slate-50">No sub-tasks attached.</div>
                
                <div v-for="task in lessonSelectedTasks" :key="task.LessonTaskId" class="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 last:border-0 bg-white transition-all duration-300 md:hover:bg-slate-50 group gap-4 relative" :class="{ 'bg-emerald-50': isTaskDone(task) }">
                  <div class="flex items-start gap-4 flex-1 min-w-0">
                    <input type="checkbox" :checked="isTaskDone(task)" @change="toggleTaskDone(task)" class="shrink-0 mt-1.5 w-7 h-7 rounded-[0.4rem] border-slate-300 bg-slate-50 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer shadow-sm transition-transform active:scale-75" />
                    <div class="min-w-0">
                      <h4 class="text-base md:text-xl font-bold text-slate-800 transition-all break-words" :class="{ 'line-through text-slate-500 decoration-slate-400': isTaskDone(task) }">{{ task['Task Name'] }}</h4>
                      <p v-if="task.Notes" class="text-xs md:text-sm font-medium text-slate-500 mt-2 bg-slate-50 inline-block px-2.5 py-1 rounded-lg border border-slate-100 truncate w-full md:max-w-max md:w-auto">{{ task.Notes }}</p>
                    </div>
                  </div>
                  <!-- Mobile Delete (always visible, stacked) vs Desktop Delete (hover based) -->
                  <button @click="deleteTask(task.LessonTaskId)" class="text-slate-400 hover:text-red-500 bg-slate-50 md:bg-transparent hover:bg-red-50 transition-all p-3.5 rounded-xl shrink-0 outline-none active:scale-90 md:opacity-0 md:group-hover:opacity-100 border border-slate-200 md:border-transparent">
                    <i class="fa-solid fa-trash text-lg"></i>
                  </button>
                </div>
              </transition-group>
            </div>
          </section>
        </transition>

        <!-- PLANNER VIEW -->
        <transition name="fade" mode="out-in">
          <section v-if="activeTab === 'planner' && !selectedLesson" class="space-y-6 md:space-y-8" key="planner">
            <header class="flex flex-col md:flex-row md:items-end justify-between gap-5 animate-slide-up">
              <div>
                <h2 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Planner</h2>
                <p class="text-slate-500 mt-2 font-medium text-lg">Time blocking and agenda.</p>
              </div>
              <div class="flex items-center gap-3 bg-white/80 p-2 md:p-2.5 rounded-[1.2rem] border border-slate-200 shadow-md shadow-slate-200/50 w-full md:w-auto">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 shrink-0">Filter Date</label>
                <input type="date" v-model="plannerDate" class="flex-1 min-w-0 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </header>

            <div class="bg-white/80 backdrop-blur border border-slate-200 rounded-[2rem] p-5 md:p-10 shadow-xl shadow-slate-200/50 animate-slide-up" style="animation-delay: 50ms;">
              <h3 class="text-2xl font-black flex items-center gap-3 mb-6 text-slate-800"><div class="p-2 bg-amber-100 rounded-xl"><i class="fa-solid fa-sun text-amber-500"></i></div> Today's Run</h3>
              
              <transition-group name="list" tag="div" class="space-y-4">
                <div v-if="agendaToday.length === 0" key="empty" class="py-12 text-center text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 max-w-full overflow-hidden">No blocks mapped for this date.</div>
                
                <div v-for="item in agendaToday" :key="item.ScheduleId" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-4 md:py-5 px-5 md:px-6 bg-white border border-slate-200 border-l-[6px] border-l-blue-500 rounded-2xl shadow-sm md:hover:shadow-lg transition-all group relative overflow-hidden">
                  <div class="text-[0.7rem] md:text-sm font-black text-slate-500 w-auto md:w-32 shrink-0 bg-slate-100 px-3 py-1.5 rounded-lg text-center md:text-left self-start md:self-auto border border-slate-200 uppercase tracking-widest">
                    {{ item.StartTime || '00:00' }} - {{ item.EndTime || '00:00' }}
                  </div>
                  <div class="flex-1 min-w-0 pr-10 md:pr-0">
                    <h4 class="font-black text-slate-800 text-lg md:text-xl truncate">{{ item.SubjectName }} <span class="text-slate-300 mx-1.5 font-normal">•</span> {{ item.LessonName }}</h4>
                    <p v-if="item.Notes" class="text-xs md:text-sm font-medium text-slate-500 mt-2 truncate max-w-full"><i class="fa-solid fa-message mr-1 text-slate-400"></i> {{ item.Notes }}</p>
                  </div>
                  <button @click="deleteSchedule(item.ScheduleId)" class="absolute top-4 right-4 md:relative md:top-auto md:right-auto text-slate-400 hover:text-red-500 bg-slate-50 md:hover:bg-red-50 p-3 rounded-xl transition-all md:opacity-0 group-hover:opacity-100 active:scale-90 border border-slate-200 md:border-transparent shrink-0">
                    <i class="fa-solid fa-trash text-lg md:text-base"></i>
                  </button>
                </div>
              </transition-group>
            </div>

            <div class="bg-white/80 backdrop-blur border border-slate-200 rounded-[2rem] p-5 md:p-10 shadow-xl shadow-slate-200/50 animate-slide-up" style="animation-delay: 100ms;">
              <h3 class="text-xl font-black flex items-center gap-3 mb-6 text-slate-800"><div class="p-2 bg-blue-100 rounded-xl"><i class="fa-solid fa-clock text-blue-500"></i></div> New Block</h3>
              <form @submit.prevent="addSchedule" class="flex flex-col gap-5">
                <div class="grid grid-cols-2 gap-4 w-full">
                  <div class="flex-1">
                    <label class="block text-[0.65rem] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Start</label>
                    <input type="time" v-model="scheduleForm.start" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-[0.65rem] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">End</label>
                    <input type="time" v-model="scheduleForm.end" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner" />
                  </div>
                </div>
                <div class="w-full">
                  <label class="block text-[0.65rem] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Attach Module</label>
                  <select v-model="scheduleForm.lessonId" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all appearance-none shadow-inner bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat pr-10">
                    <option value="" disabled class="text-slate-400 font-normal">Select lesson...</option>
                    <option v-for="l in dataStore.state.lessons" :key="l.LessonId" :value="l.LessonId" class="font-bold bg-white text-slate-800">
                      {{ l.SubjectName }} • {{ l['Lesson Name'] }}
                    </option>
                  </select>
                </div>
                <div class="w-full">
                  <label class="block text-[0.65rem] md:text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Notes / Plan</label>
                  <input type="text" v-model="scheduleForm.notes" placeholder="Optional notes..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner" />
                </div>
                <button type="submit" class="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black shadow-xl shadow-blue-500/30 transition-all outline-none active:scale-95 flex items-center justify-center gap-2">
                   <i class="fa-solid fa-plus"></i> Reserve Block
                </button>
              </form>
            </div>
          </section>
        </transition>
        
        <!-- API PLACEHOLDERS -->
        <transition name="fade">
          <section v-if="(activeTab === 'resources' || activeTab === 'settings') && !selectedLesson" class="flex flex-col items-center justify-center py-[20vh] px-5 text-center animate-slide-up">
            <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-slate-200/50 border border-slate-100 rotate-6 group hover:rotate-12 transition-all duration-500">
              <i class="fa-solid fa-code text-4xl text-blue-500 opacity-60"></i>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-3 drop-shadow-sm">Backend Node</h2>
            <p class="text-slate-500 text-sm md:text-lg max-w-sm font-medium">Use the DataService functions to hydrate this screen dynamically.</p>
          </section>
        </transition>

      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (Fixed) -->
    <nav class="md:hidden w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 fixed bottom-0 left-0 z-40 flex justify-around items-end pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-1 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
      <button v-for="tab in tabs" :key="'bottom-'+tab.id" @click="setTab(tab.id)" class="flex flex-col items-center gap-1 w-[4.5rem] group outline-none active:scale-95 relative transition-transform">
         <div :class="[ 'flex items-center justify-center w-full rounded-2xl py-1.5 transition-all duration-300', (activeTab === tab.id && !selectedLesson) ? 'text-blue-600 bg-blue-50 shadow-sm border border-blue-100' : 'text-slate-500' ]">
           <i :class="tab.icon" class="text-xl"></i>
         </div>
         <span :class="[(activeTab === tab.id && !selectedLesson) ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 font-medium', 'text-[0.6rem] transition-all']">{{ tab.label }}</span>
      </button>
    </nav>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { dataStore, loadData, dispatchAction } from '../stores/dataStore';

// === TABS CONFIG ===
const tabs = [
  { id: 'dashboard', label: 'Dash', icon: 'fa-solid fa-chart-pie' },
  { id: 'lessons', label: 'Learn', icon: 'fa-solid fa-book-open' },
  { id: 'planner', label: 'Plan', icon: 'fa-solid fa-calendar-days' },
  { id: 'resources', label: 'Lib', icon: 'fa-solid fa-photo-film' },
  { id: 'settings', label: 'Gear', icon: 'fa-solid fa-gear' }
];

// === STATE ===
const activeTab = ref('dashboard');
const selectedLesson = ref(null);

const taskFilter = ref('incomplete');
const plannerDate = ref(new Date().toISOString().slice(0, 10));

const newTask = ref({ name: '', notes: '' });
const scheduleForm = ref({ start: '09:00', end: '10:00', lessonId: '', notes: '' });

// === MOUNT ===
onMounted(() => {
  loadData();
});

// === COMPUTED METRICS ===
const normalizeBool = (v) => v === true || (typeof v === 'string' && v.trim().toUpperCase() === 'TRUE');
const normalizeStatus = (v) => (v ?? '').toString().trim().toLowerCase();

const activeLessonsThisWeek = computed(() => {
  return (dataStore.state.lessons || []).filter(l => normalizeBool(l.LearnInThisWeek));
});

const inProgressTasksCount = computed(() => {
  return (dataStore.state.lessons || []).filter(l => normalizeStatus(l.Status) === 'in progress').length;
});

const completedTasksCount = computed(() => {
  return (dataStore.state.tasks || []).filter(t => parseInt(t.Progress) === 100 || t.Status === "Completed").length;
});

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

const lessonSelectedTasks = computed(() => {
  if (!selectedLesson.value) return [];
  const tasks = (dataStore.state.tasks || []).filter(t => t.LessonId === selectedLesson.value.LessonId);
  return tasks.sort((a,b) => {
    return isTaskDone(a) === isTaskDone(b) ? 0 : isTaskDone(a) ? 1 : -1;
  });
});

const agendaToday = computed(() => {
  return (dataStore.state.schedule || []).filter(s => s.Date === plannerDate.value)
    .sort((a,b) => (a.StartTime || '').localeCompare(b.StartTime || ''));
});

// === HELPERS ===
const setTab = (tab) => {
  activeTab.value = tab;
  selectedLesson.value = null;
  // Scroll to top instantly on mobile navigation
  window.scrollTo(0,0);
  document.querySelector('main')?.scrollTo(0,0);
};

const openLesson = (lesson) => {
  selectedLesson.value = lesson;
};

const getLesson = (id) => dataStore.state.lessons.find(l => l.LessonId === id);
const getLessonsForSubject = (id) => dataStore.state.lessons.filter(l => l.SubjectId === id);

const getLessonProgress = (lesson) => {
  const lTasks = dataStore.state.tasks.filter(t => t.LessonId === lesson.LessonId);
  if (!lTasks.length) return 0;
  let total = lTasks.reduce((acc, t) => acc + (parseInt(t.Progress) || 0), 0);
  return Math.round(total / lTasks.length);
};

const isTaskDone = (task) => {
  return parseInt(task.Progress) === 100 || normalizeBool(task.LearnedToday);
};

// === CRUD ACTIONS ===
const toggleTaskDone = async (task) => {
  const done = isTaskDone(task);
  const newProgress = done ? 0 : 100;
  task.Progress = newProgress;
  task.LearnedToday = done ? "FALSE" : "TRUE";
  await dispatchAction('updateTask', task.LessonTaskId, task.LessonId, task.LessonName || 'Lesson', newProgress, !done);
};

const addTask = async () => {
  if (!selectedLesson.value) return;
  await dispatchAction('saveLessonTask', null, selectedLesson.value.LessonId, newTask.value.name, newTask.value.notes, 0);
  newTask.value = { name: '', notes: '' };
};

const deleteTask = async (taskId) => {
  if(confirm("Delete this lesson task?")) {
    await dispatchAction('deleteLessonTask', taskId);
  }
};

const handleGenerateAI = async () => {
  const age = prompt("Child age?", "2");
  if(age) {
    await dispatchAction('generateLessonTasksWithGemini', selectedLesson.value.LessonId, selectedLesson.value['Lesson Name'], age);
  }
};

const promptNewSubject = async () => {
  const name = prompt("Enter Subject Name:");
  if (name) {
    const desc = prompt("Enter Description:");
    await dispatchAction('saveSubject', null, name, desc);
  }
};

const promptNewLesson = async (subject) => {
  const name = prompt(`New Lesson in ${subject['Subject Name']}:`);
  if (name) {
    const desc = prompt("Enter Description:");
    await dispatchAction('saveLesson', null, subject.SubjectId, subject['Subject Name'], name, desc, true);
  }
};

const addSchedule = async () => {
  const les = getLesson(scheduleForm.value.lessonId);
  if (!les) return;
  await dispatchAction('saveScheduleEntry', null, plannerDate.value, scheduleForm.value.start, scheduleForm.value.end,
    les.SubjectId, les.SubjectName, les.LessonId, les['Lesson Name'], scheduleForm.value.notes
  );
  scheduleForm.value.notes = '';
};

const deleteSchedule = async (id) => {
  if(confirm("Delete this schedule block?")) {
    await dispatchAction('deleteScheduleEntry', id);
  }
};
</script>

<style scoped>
/* Gorgeous Vue Transition Animations */

/* Simple Fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide Right for Page Changes */
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from { opacity: 0; transform: translateX(30px); }
.slide-right-leave-to { opacity: 0; transform: translateX(-30px); }

/* Slide Down */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0; transform: translateY(-20px);
}

/* Pop */
.pop-enter-active, .pop-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-enter-from, .pop-leave-to {
  opacity: 0; transform: scale(0.9);
}

/* List Groups (Tasks, Agenda) */
.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.98);
}
.list-leave-active {
  position: absolute; /* allows for smooth collapse */
  width: 100%;
}

/* Stagger Slide Up */
@keyframes slideUp {
  0% { opacity: 0; transform: translateY(15px) scale(0.99); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0; /* starts hidden before animation runs */
}

/* Continuous Subtle Scale */
@keyframes breathing {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.scale-animation {
  animation: breathing 3s infinite ease-in-out;
}

/* Hide Scrollbar helper for horizontal scrollers */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
