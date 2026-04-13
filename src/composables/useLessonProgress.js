/**
 * useLessonProgress.js
 *
 * Shared composable for calculating lesson completion progress.
 * Previously copy-pasted across DashboardView, CurriculumView, and ProfileView.
 * Import this composable wherever a lesson progress % is needed.
 */

/**
 * Calculates the completion percentage of a lesson based on LearnedCount vs TargetCount.
 * @param {Object} lesson - Lesson object with LearnedCount and TargetCount fields.
 * @returns {number} A value from 0 to 100.
 */
export const getLessonProgress = (lesson) => {
  const target = Math.max(1, parseInt(lesson.TargetCount) || 1);
  const learned = parseInt(lesson.LearnedCount) || 0;
  return Math.min(100, Math.round((learned / target) * 100));
};

/**
 * Checks if a lesson has already been practiced (marked done) today.
 * @param {Object} lesson 
 * @returns {boolean}
 */
export const isPracticedToday = (lesson) => {
  if (!lesson.LastPracticedDate) return false;
  try {
    const lastDate = new Date(lesson.LastPracticedDate).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if a lesson is scheduled for today.
 * @param {Object} lesson 
 * @returns {boolean}
 */
export const isDueToday = (lesson) => {
  if (!lesson.NextDueDate) return false;
  try {
    const dueDate = new Date(lesson.NextDueDate).toDateString();
    const today = new Date().toDateString();
    return dueDate === today;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if a lesson's scheduled practice date has passed.
 * @param {Object} lesson 
 * @returns {boolean}
 */
export const isOverdue = (lesson) => {
  if (!lesson.NextDueDate) return false;
  try {
    const d = new Date(lesson.NextDueDate);
    d.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today;
  } catch (e) {
    return false;
  }
};
