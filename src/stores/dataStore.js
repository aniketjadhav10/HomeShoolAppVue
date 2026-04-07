import { reactive } from 'vue';
import { callApi } from '../api';
import { smartDispatch } from '../apiService';
import { cacheGlobalState, getCachedGlobalState } from '../services/offlineService';
import { addToQueue, syncState } from '../services/syncService';

export const dataStore = reactive({
  state: {
    subjects: [], lessons: [], tasks: [], progress: [],
    improvements: [], resources: [], schedule: [],
    attendance: [], timeLogs: [], assessments: [], portfolio: [], calendarEvents: []
  },
  loading: true,
  saving: false,
  error: null,
});

export const uiState = reactive({
  showSubjectModal: false,
  selectedSubjectForView: null
});

export const loadData = async () => {
  dataStore.loading = true;
  dataStore.error = null;
  try {
    // 1. Optimistic Cache Hydration
    const cachedData = await getCachedGlobalState();
    if (cachedData) {
      dataStore.state = { ...dataStore.state, ...cachedData };
      dataStore.loading = false; // Render immediately on offline hit
    }

    // 2. Fetch Fresh Data (if online)
    if (navigator.onLine) {
      const data = await callApi('getHomeschoolData');
      dataStore.state = { ...dataStore.state, ...data };
      await cacheGlobalState(dataStore.state);
    }
  } catch (e) {
    console.warn("Load Error (likely offline): using cached data", e);
  } finally {
    dataStore.loading = false;
  }
};

// --- OPTIMISTIC UI PARSER ---
// Safely injects temporary records so the UI feels 0-latency and works completely offline
const applyOptimisticState = (action, args) => {
  try {
    if (action === 'saveLessonTask') {
      const [taskId, lessonId, taskName, notes, progress] = args;
      if (!taskId) { // It's a new task
        dataStore.state.tasks.push({
          LessonTaskId: 'temp-' + Date.now(),
          LessonId: lessonId,
          ['Task Name']: taskName,
          Notes: notes,
          Progress: progress || 0,
          LearnedToday: "FALSE"
        });
      }
    } else if (action === 'saveSubject') {
      const [id, name, desc] = args;
      if (!id) {
        dataStore.state.subjects.push({
          SubjectId: 'temp-' + Date.now(),
          ['Subject Name']: name,
          Description: desc
        });
      }
    } else if (action === 'saveLesson') {
      const [id, sId, name, desc] = args;
      if (!id) {
        dataStore.state.lessons.push({
          LessonId: 'temp-less-' + Date.now(),
          SubjectId: sId,
          ['Lesson Name']: name,
          Description: desc,
          Status: 'Pending',
          LearnedCount: 0,
          TargetCount: 1,
          LearnInThisWeek: 'FALSE'
        });
      }
    } else if (action === 'updateLesson') {
      const [id, status, learnInThisWeek, learnedCount, targetCount] = args;
      const lesson = dataStore.state.lessons.find(l => l.LessonId === id);
      if (lesson) {
        if (status !== undefined) lesson.Status = status;
        if (learnInThisWeek !== undefined) lesson.LearnInThisWeek = learnInThisWeek;
        if (learnedCount !== undefined) lesson.LearnedCount = learnedCount;
        if (targetCount !== undefined) lesson.TargetCount = targetCount;
      }
    }
    // Note: Edit and Checkbox toggles (Progress updates) are typically already handled seamlessly 
    // by Vue's 2-way binding v-model within the components directly before dispatchAction runs.
  } catch (e) {
    console.error("Optimistic parsing failed natively", e);
  }
};

export const dispatchAction = async (action, ...args) => {
  dataStore.saving = true;
  dataStore.error = null;
  try {
    // 1. INSTANT OPTIMISTIC UI UPDATE
    applyOptimisticState(action, args);
    // Flush local optimistic state down to IndexedDB explicitly so if they reload offline, it persists!
    await cacheGlobalState(dataStore.state);

    // 2. NETWORK CALL / BACKGROUND SYNC
    const freshData = await smartDispatch(action, ...args);

    // 3. SERVER RECONCILIATION
    // Once the server returns real IDs, overwrite our temporary ones
    if (freshData && freshData.subjects && !freshData._offlineQueued) {
      dataStore.state = { ...dataStore.state, ...freshData };
      await cacheGlobalState(dataStore.state); // Store authoritative truth
    }
    return freshData;
  } catch (e) {
    dataStore.error = e.message;
    console.error(`Action ${action} Error:`, e);
    return null;
  } finally {
    dataStore.saving = false;
  }
};
