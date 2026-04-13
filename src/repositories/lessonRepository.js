import { dataStore, dispatchAction } from '../stores/dataStore';
import { processQueue } from '../services/syncService';

/**
 * lessonRepository.js
 * 
 * Provides a clean abstraction for lesson data operations.
 * UI components should use this repository instead of calling the Store or API directly.
 */
export const lessonRepository = {
  /**
   * Returns reactive list of all lessons from the store.
   */
  getLessons() {
    return dataStore.state.lessons || [];
  },

  /**
   * Finds a specific lesson by its ID.
   */
  getLessonById(lessonId) {
    return (dataStore.state.lessons || []).find(l => l.LessonId === lessonId);
  },

  /**
   * Filters lessons for a specific subject.
   */
  getLessonsBySubject(subjectId) {
    return (dataStore.state.lessons || []).filter(l => l.SubjectId === subjectId);
  },

  /**
   * Saves or creates a new lesson.
   * Logic: calls dispatchAction which handles optimistic UI + IndexedDB + API/Queueing.
   */
  async saveLesson(id, sId, sName, name, desc, inWeek, blockType) {
    console.log(`[Repo] saveLesson: ${name}, Block: ${blockType}`);
    return await dispatchAction('saveLesson', id, sId, sName, name, desc, inWeek, blockType);
  },

  /**
   * Updates lesson status, progress, or planning.
   */
  async updateLesson(id, status, learnInThisWeek, learnedCount, targetCount, blockType, lastPrac, nextDue, interval, interest) {
    console.log(`[Repo] updateLesson. ID: ${id}, Status: ${status}, Interest: ${interest}`);
    return await dispatchAction('updateLesson', id, status, learnInThisWeek, learnedCount, targetCount, blockType, lastPrac, nextDue, interval, interest);
  },

  /**
   * NEW: Pedagogical transition logic for the cyclical system.
   * Increments LearnedCount and only advances status when TargetCount is reached.
   */
  async markLessonPracticed(lesson) {
    const { getNextStatus, calculateNextDueDate, normalizeBool } = await import('../composables/useLessonStatus');
    
    const target = parseInt(lesson.TargetCount) || 1;
    const currentLearned = (parseInt(lesson.LearnedCount) || 0) + 1;
    
    let nextStatus = lesson.Status;
    let nextLearned = currentLearned;
    let nextDue;

    if (currentLearned >= target) {
      // 🏆 Stage Completed! Move to next pedagogical level
      nextStatus = getNextStatus(lesson.Status);
      nextLearned = 0; // Reset for the next cycle
      nextDue = calculateNextDueDate(nextStatus, lesson.InterestLevel || 'Medium');
      console.log(`[Repo] 🎯 Target Reached! ${lesson.LessonName} -> ${nextStatus}. Next: ${nextDue.toLocaleDateString()}`);
    } else {
      // ⏳ Session Finished. Continue in current stage.
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0); // Morning Energy block
      nextDue = tomorrow;
      console.log(`[Repo] Session ${currentLearned}/${target} done for ${lesson.LessonName}. Status stays ${nextStatus}.`);
    }

    if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);

    return await this.updateLesson(
      lesson.LessonId,
      nextStatus,
      normalizeBool(lesson.LearnInThisWeek),
      nextLearned,
      target,
      lesson.BlockType,
      new Date().toISOString(),
      nextDue.toISOString(),
      lesson.RepeatInterval || 1,
      lesson.InterestLevel || 'Medium'
    );
  },

  /**
   * Deletes a lesson.
   */
  async deleteLesson(id) {
    console.log(`[Repo] deleteLesson called. ID: ${id}`);
    return await dispatchAction('deleteLesson', id);
  },

  /**
   * Triggers a sync of all pending changes, ensuring lessons are up to date with the server.
   */
  async syncLessons() {
    return await processQueue();
  }
};
