import { reactive, toRaw } from 'vue';
import { callApi } from '../api';
import { smartDispatch } from '../apiService';
import { cacheGlobalState, getCachedGlobalState, enforceStorageLimits, getSyncMeta, setSyncMeta } from '../services/offlineService';
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
  showLessonModal: false, // FIX: was missing — referenced by GoogleSheetApp.vue & CurriculumView.vue
  selectedSubjectForView: null
});

const mergeState = (incoming) => {
  const entityMap = {
    subjects: 'SubjectId',
    lessons: 'LessonId',
    tasks: 'LessonTaskId',
    schedule: 'ScheduleId', // Or auto-increment fallback
    calendarEvents: 'EventId'
  };

  Object.entries(incoming).forEach(([key, newItems]) => {
    if (!Array.isArray(newItems) || !entityMap[key]) return;

    // Strategy: Update properties on existing objects to avoid Vue re-render flicker
    const existing = dataStore.state[key] || [];
    
    newItems.forEach(newItem => {
      const nid = newItem[idField];
      if (!nid) return;

      const found = existing.find(ex => ex[idField] === nid || ex[idField] === `temp-${nid}`);
      if (found) {
        // Update properties on the existing reactive object
        Object.assign(found, newItem);
      } else {
        // It's a truly new item from server (rare case during merge unless first load)
        existing.push(newItem);
      }
    });

    // Remove any temp items that are now represented by real IDs (if any left)
    dataStore.state[key] = existing.filter(ex => {
      const idStr = ex[idField]?.toString() || '';
      if (!idStr.startsWith('temp-')) return true;
      // If a non-temp item with the same data exists, remove the temp one
      return !newItems.some(ni => ni[idField] === idStr.replace('temp-', ''));
    });
  });

  if (incoming.settings) {
    dataStore.state.settings = { ...dataStore.state.settings, ...incoming.settings };
  }
};

let loadingPromise = null;

export const loadData = async () => {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    dataStore.loading = true;
    dataStore.error = null;
    try {
      // 1. Optimistic Cache Hydration
      const cachedData = await getCachedGlobalState();
      if (cachedData) {
        dataStore.state = { ...dataStore.state, ...cachedData };
        dataStore.loading = false;
      }

      // 2. Fetch Fresh Data
      if (navigator.onLine) {
        const lastSync = await getSyncMeta('global');
        const data = await callApi('getHomeschoolData', lastSync);

        if (data) {
          mergeState(data);
          // FIX: use toRaw() to avoid DataCloneError
          await cacheGlobalState(JSON.parse(JSON.stringify(toRaw(dataStore.state))));
          if (data.serverTime) {
            await setSyncMeta('global', data.serverTime);
          }
        }
      }
      enforceStorageLimits().catch(e => console.warn('[DB TTL] failed:', e));
    } catch (e) {
      console.warn("Load Error:", e);
    } finally {
      dataStore.loading = false;
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

// --- OPTIMISTIC UI PARSER ---
// Safely injects temporary records so the UI feels 0-latency and works completely offline
const applyOptimisticState = (action, args) => {
  try {
    if (action === 'saveLessonTask') {
      const [taskId, lessonId, taskName, notes, targetCount] = args;
      if (!taskId || taskId.toString().startsWith('temp-')) { // It's a new task
        dataStore.state.tasks.push({
          LessonTaskId: taskId || ('temp-' + Date.now()),
          LessonId: lessonId,
          ['TaskName']: taskName,
          Notes: notes,
          Status: 'Pending',
          LearnedCount: 0,
          TargetCount: parseInt(targetCount) || 1
        });
      }
    } else if (action === 'updateTask') {
      const [id, lessonId, lessonName, status, learnedCount, targetCount, photo] = args;
      const task = dataStore.state.tasks.find(t => t.LessonTaskId === id);
      if (task) {
        if (status !== undefined) task.Status = status;
        if (learnedCount !== undefined) task.LearnedCount = learnedCount;
        if (targetCount !== undefined) task.TargetCount = targetCount;
        if (photo !== undefined) task.Photo = photo;
      }
    } else if (action === 'saveSubject') {
      const [id, name, desc] = args;
      if (!id) {
        dataStore.state.subjects.push({
          SubjectId: 'temp-' + Date.now(),
          ['SubjectName']: name,
          Description: desc
        });
      } else {
        const sub = dataStore.state.subjects.find(s => s.SubjectId === id);
        if (sub) {
          sub.SubjectName = name;
          sub.Description = desc;
        }
      }
    } else if (action === 'saveLesson') {
      const [id, sId, sName, name, desc, inWeek, blockType] = args;
      if (!id || id.toString().startsWith('temp-')) {
        dataStore.state.lessons.push({
          LessonId: id || ('temp-less-' + Date.now()),
          SubjectId: sId,
          ['SubjectName']: sName,
          ['LessonName']: name,
          Description: desc,
          BlockType: blockType || '',
          Status: 'Pending',
          LearnedCount: 0,
          TargetCount: 1,
          LearnInThisWeek: inWeek ? 'TRUE' : 'FALSE'
        });
      } else {
        const lesson = dataStore.state.lessons.find(l => l.LessonId === id);
        if (lesson) {
          lesson.LessonName = name;
          lesson.Description = desc;
          lesson.LearnInThisWeek = inWeek ? 'TRUE' : 'FALSE';
          lesson.BlockType = blockType || '';
        }
      }
    } else if (action === 'updateLesson') {
      const [id, status, learnInThisWeek, learnedCount, targetCount, blockType, lastPrac, nextDue, interval, interest] = args;
      const lesson = dataStore.state.lessons.find(l => l.LessonId === id);
      if (lesson) {
        if (status !== undefined) lesson.Status = status;
        if (learnInThisWeek !== undefined) {
           // Ensure normalization to TRUE/FALSE strings for Google Sheets and UI consistency
           lesson.LearnInThisWeek = (learnInThisWeek === true || learnInThisWeek === 'TRUE') ? 'TRUE' : 'FALSE';
        }
        if (learnedCount !== undefined) lesson.LearnedCount = learnedCount;
        if (targetCount !== undefined) lesson.TargetCount = targetCount;
        if (blockType !== undefined) lesson.BlockType = blockType;
        if (lastPrac !== undefined) lesson.LastPracticedDate = lastPrac;
        if (nextDue !== undefined) lesson.NextDueDate = nextDue;
        if (interval !== undefined) lesson.RepeatInterval = interval;
        if (interest !== undefined) lesson.InterestLevel = interest;
        lesson.UpdatedAt = new Date().toISOString();
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
  console.log(`[Store] dispatchAction START: ${action}`, args);
  try {
    // 1. INSTANT OPTIMISTIC UI UPDATE
    applyOptimisticState(action, args);
    // Flush local optimistic state down to IndexedDB so offline reload shows the new item
    // FIX: use toRaw() to avoid DataCloneError in IndexedDB (Proxies cannot be cloned)
    await cacheGlobalState(JSON.parse(JSON.stringify(toRaw(dataStore.state))));
    console.log(`[Store] ✅ Optimistic + IndexedDB write done for: ${action}`);

    // 2. NETWORK CALL / BACKGROUND SYNC
    const freshData = await smartDispatch(action, ...args);
    console.log(`[Store] smartDispatch result for ${action}:`, freshData?._offlineQueued ? '📴 Queued offline' : '✅ Server responded');

    // 3. SERVER RECONCILIATION
    // Once the server returns real IDs, overwrite our temporary ones.
    // Guard: only reconcile if we got a full data snapshot back (has subjects array).
    if (freshData && freshData.subjects && !freshData._offlineQueued) {
      // Use mergeState so we don't clobber unrelated state keys
      mergeState(freshData);
      // FIX: use toRaw() to avoid DataCloneError in IndexedDB
      await cacheGlobalState(JSON.parse(JSON.stringify(toRaw(dataStore.state))));
      console.log(`[Store] ✅ Server reconciliation done for: ${action}`);
    }
    return freshData;
  } catch (e) {
    dataStore.error = e.message;
    console.error(`[Store] ❌ Action ${action} ERROR:`, e);
    return null;
  } finally {
    dataStore.saving = false;
  }
};
