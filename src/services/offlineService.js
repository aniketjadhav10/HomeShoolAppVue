/**
 * offlineService.js — IndexedDB layer for Yug Homeschool
 *
 * DB: homeschool_db  (idb library, NOT Dexie)
 *
 * Schema History:
 *   v1 — app_data (blob store), sync_queue
 *   v2 — offline_assets (unused, kept for compat)
 *   v3 — subjects, lessons, tasks, sync_meta  ← current
 *
 * Design:
 *   - Entity stores replace the single-blob 'global_cache' anti-pattern.
 *     Each entity type has its own store with a natural keyPath and relevant
 *     indexes so queries (e.g. get lessons for a subject) are O(log n) not O(n).
 *   - app_data is kept for backward compat (e.g. other keys that may be stored).
 *   - sync_meta tracks per-entity last-sync timestamps for future partial sync.
 *   - The v2→v3 migration reads the existing global_cache blob and populates
 *     the new entity stores automatically with zero data loss.
 */

import { openDB } from 'idb';

const DB_NAME = 'homeschool_db';
const DB_VERSION = 3; // IMPORTANT: keep in sync with sw.js DB_VERSION constant

// ─── SCHEMA ─────────────────────────────────────────────────────────────────
// subjects   : { SubjectId (PK), 'SubjectName', Description, ... }
// lessons    : { LessonId (PK), SubjectId (idx), 'LessonName', Status,
//                LearnInThisWeek, LearnedCount, TargetCount, ... }
// tasks      : { LessonTaskId (PK), LessonId (idx), 'TaskName', Notes,
//                Progress, LearnedToday, ... }
// sync_meta  : { entity (PK: 'subjects'|'lessons'|'tasks'|'global'),
//                lastSyncTime (ms timestamp) }
// app_data   : { id (PK), payload, lastUpdated } — legacy blob store, kept
// sync_queue : { id (autoIncrement PK), endpoint, payload, method, timestamp }
// offline_assets: { url (PK) } — reserved, not yet used
// ─────────────────────────────────────────────────────────────────────────────

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, transaction) {

      // ── v1 base schema ────────────────────────────────────────────────────
      if (oldVersion < 1) {
        db.createObjectStore('app_data', { keyPath: 'id' });
        const syncQ = db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        // Index for TTL cleanup (enforceStorageLimits queries by timestamp)
        syncQ.createIndex('timestamp_idx', 'timestamp');
      }

      // ── v2 offline_assets (unused but created for compat) ─────────────────
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('offline_assets')) {
          db.createObjectStore('offline_assets', { keyPath: 'url' });
        }
      }

      // ── v3 entity stores — replaces single-blob global_cache pattern ──────
      if (oldVersion < 3) {
        // Subjects — primary key is SubjectId
        if (!db.objectStoreNames.contains('subjects')) {
          db.createObjectStore('subjects', { keyPath: 'SubjectId' });
        }

        // Lessons — primary key LessonId, indexed by SubjectId for fast filtering
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'LessonId' });
          lessonStore.createIndex('by_subject', 'SubjectId', { unique: false });
          lessonStore.createIndex('by_weekly', 'LearnInThisWeek', { unique: false });
          lessonStore.createIndex('by_status', 'Status', { unique: false });
        }

        // Tasks — primary key LessonTaskId, indexed by LessonId for fast filtering
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'LessonTaskId' });
          taskStore.createIndex('by_lesson', 'LessonId', { unique: false });
        }

        // Sync metadata — tracks last sync time per entity type
        if (!db.objectStoreNames.contains('sync_meta')) {
          db.createObjectStore('sync_meta', { keyPath: 'entity' });
        }

        // ── Migration: v2 → v3 data backfill ─────────────────────────────
        // Attempt to hydrate the new entity stores from the existing global_cache
        // blob so existing users don't lose their offline data on upgrade.
        try {
          const appDataStore = transaction.objectStore('app_data');
          const cached = await appDataStore.get('global_cache');
          if (cached && cached.payload) {
            const payload = cached.payload;
            const subjectStore = transaction.objectStore('subjects');
            const lessonStore = transaction.objectStore('lessons');
            const taskStore = transaction.objectStore('tasks');

            if (Array.isArray(payload.subjects)) {
              for (const s of payload.subjects) {
                if (s.SubjectId) subjectStore.put(s);
              }
            }
            if (Array.isArray(payload.lessons)) {
              for (const l of payload.lessons) {
                if (l.LessonId) lessonStore.put(l);
              }
            }
            if (Array.isArray(payload.tasks)) {
              for (const t of payload.tasks) {
                if (t.LessonTaskId) taskStore.put(t);
              }
            }
            console.log('[DB v3 Migration] Entity stores hydrated from global_cache.');
          }
        } catch (migrationErr) {
          // Non-fatal — app will refetch from server on next load
          console.warn('[DB v3 Migration] Could not backfill entity stores:', migrationErr);
        }
      }
    },
  });
}

// ─── ENTITY STORES — SUBJECTS ────────────────────────────────────────────────

/** Replace all subjects in the store (full sync snapshot). */
export async function saveSubjects(subjects) {
  const db = await initDB();
  const tx = db.transaction('subjects', 'readwrite');
  await tx.store.clear();
  for (const s of subjects) {
    if (s.SubjectId) tx.store.put(s);
  }
  await tx.done;
}

/** Upsert a single subject record (optimistic local write). */
export async function upsertSubject(subject) {
  if (!subject?.SubjectId) return;
  const db = await initDB();
  await db.put('subjects', subject);
}

/** Get all subjects. */
export async function getSubjects() {
  const db = await initDB();
  return db.getAll('subjects');
}

// ─── ENTITY STORES — LESSONS ─────────────────────────────────────────────────

/** Replace all lessons in the store (full sync snapshot). */
export async function saveLessons(lessons) {
  const db = await initDB();
  const tx = db.transaction('lessons', 'readwrite');
  await tx.store.clear();
  for (const l of lessons) {
    if (l.LessonId) tx.store.put(l);
  }
  await tx.done;
}

/** Upsert a single lesson record (optimistic local write). */
export async function upsertLesson(lesson) {
  if (!lesson?.LessonId) return;
  const db = await initDB();
  await db.put('lessons', lesson);
}

/** Get all lessons. */
export async function getLessons() {
  const db = await initDB();
  return db.getAll('lessons');
}

/** Get lessons for a specific subject using the SubjectId index. */
export async function getLessonsBySubject(subjectId) {
  const db = await initDB();
  return db.getAllFromIndex('lessons', 'by_subject', subjectId);
}

/** Get all lessons flagged for this week. */
export async function getWeeklyLessons() {
  const db = await initDB();
  // Note: LearnInThisWeek can be 'TRUE' string or boolean true
  const all = await db.getAll('lessons');
  return all.filter(l =>
    l.LearnInThisWeek === true ||
    (typeof l.LearnInThisWeek === 'string' && l.LearnInThisWeek.trim().toUpperCase() === 'TRUE')
  );
}

// ─── ENTITY STORES — TASKS ───────────────────────────────────────────────────

/** Replace all tasks (full sync snapshot). */
export async function saveTasks(tasks) {
  const db = await initDB();
  const tx = db.transaction('tasks', 'readwrite');
  await tx.store.clear();
  for (const t of tasks) {
    if (t.LessonTaskId) tx.store.put(t);
  }
  await tx.done;
}

/** Upsert a single task record. */
export async function upsertTask(task) {
  if (!task?.LessonTaskId) return;
  const db = await initDB();
  await db.put('tasks', task);
}

/** Get all tasks for a lesson using the LessonId index. */
export async function getTasksByLesson(lessonId) {
  const db = await initDB();
  return db.getAllFromIndex('tasks', 'by_lesson', lessonId);
}

// ─── SYNC META ───────────────────────────────────────────────────────────────

/** Record the last successful sync time for an entity type. */
export async function setSyncMeta(entity, timestamp = Date.now()) {
  const db = await initDB();
  await db.put('sync_meta', { entity, lastSyncTime: timestamp });
}

/** Get last sync time for an entity (returns null if never synced). */
export async function getSyncMeta(entity) {
  const db = await initDB();
  const row = await db.get('sync_meta', entity);
  return row ? row.lastSyncTime : null;
}

// ─── LEGACY BLOB API (kept for backward compat) ──────────────────────────────
// dataStore.js still uses cacheGlobalState/getCachedGlobalState as the primary
// read/write path. These functions now ALSO write to entity stores in parallel,
// gradually making the entity stores authoritative without breaking anything.

export async function saveData(id, payload) {
  const db = await initDB();
  await db.put('app_data', { id, payload, lastUpdated: Date.now() });
}

export async function getData(id) {
  const db = await initDB();
  const result = await db.get('app_data', id);
  return result ? result.payload : null;
}

export async function updateData(id, payload) {
  return saveData(id, payload);
}

export async function deleteData(id) {
  const db = await initDB();
  await db.delete('app_data', id);
}

/**
 * cacheGlobalState — main write path called by dataStore.js
 *
 * Improvement over the old version:
 * In addition to updating the legacy blob, we now also write each entity
 * into its dedicated store. This makes the entity stores progressively
 * authoritative and enables future indexed queries without a data migration.
 */
export async function cacheGlobalState(data) {
  // 1. Keep writing the blob so existing read paths don't break
  await saveData('global_cache', data);

  // 2. Progressively hydrate entity stores in parallel (non-blocking)
  const writes = [];
  if (Array.isArray(data.subjects) && data.subjects.length) {
    writes.push(saveSubjects(data.subjects));
  }
  if (Array.isArray(data.lessons) && data.lessons.length) {
    writes.push(saveLessons(data.lessons));
  }
  if (Array.isArray(data.tasks) && data.tasks.length) {
    writes.push(saveTasks(data.tasks));
  }

  // Update global sync meta timestamp
  writes.push(setSyncMeta('global', Date.now()));

  // Run all entity saves in parallel, non-fatal if any fail
  await Promise.allSettled(writes);
}

/**
 * getCachedGlobalState — main read path called by dataStore.js
 *
 * Priority: entity stores (richer, indexed) → legacy blob fallback.
 * Falls back to the blob so nothing breaks during the transition period.
 */
export async function getCachedGlobalState() {
  try {
    const db = await initDB();
    const [subjects, lessons, tasks] = await Promise.all([
      db.getAll('subjects'),
      db.getAll('lessons'),
      db.getAll('tasks'),
    ]);

    // If entity stores are populated use them — they're always more up to date
    if (subjects.length || lessons.length) {
      console.log(`[IDB] Cache Hit: Loaded ${subjects.length} subjects, ${lessons.length} lessons from entity stores.`);
      return { subjects, lessons, tasks };
    }
  } catch (e) {
    console.warn('[IDB] Entity store read failed, falling back to blob:', e);
  }

  // Fallback to legacy single-blob cache
  console.log('[IDB] Cache Fallback: Loading from legacy global_cache blob.');
  return getData('global_cache');
}

// ─── STORAGE LIMITS ──────────────────────────────────────────────────────────

/** Purge sync_queue entries older than 30 days to prevent IndexedDB bloat. */
export async function enforceStorageLimits() {
  const db = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');

  if (store.indexNames.contains('timestamp_idx')) {
    const index = store.index('timestamp_idx');
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    const range = IDBKeyRange.upperBound(cutoff);

    let cursor = await index.openCursor(range);
    while (cursor) {
      console.warn('[DB TTL] Purging stale sync entry:', cursor.value.endpoint);
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
  await tx.done;
}
