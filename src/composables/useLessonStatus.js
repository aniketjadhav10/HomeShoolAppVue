/**
 * useLessonStatus.js
 *
 * Support for the 2-5yo Cyclical Learning System.
 * Transitions: Introduced -> Practicing -> Familiar -> Mastered
 * Scheduling: Spaced repetition intervals (+1, +3, +7 days)
 */

export const STATUS_LEVELS = {
  INTRODUCED: 'Introduced',
  PRACTICING: 'Practicing',
  FAMILIAR: 'Familiar',
  MASTERED: 'Mastered',
  REVISIT: 'Revisit'
};

export const LESSON_BLOCKS = [
  { id: '🌞 Morning Energy (6 AM – 10 AM)',  emoji: '🌞', label: 'Morning Energy' },
  { id: '🧠 Deep Learning (10 AM – 2 PM)',   emoji: '🧠', label: 'Deep Learning' },
  { id: '😴 Rest & Creative (2 PM – 6 PM)',  emoji: '😴', label: 'Rest & Creative' },
  { id: '🌆 Life Learning (6 PM – 10 PM)',   emoji: '🌆', label: 'Life Learning' },
];

export const normalizeBool = (v) =>
  v === true || (typeof v === 'string' && v.trim().toUpperCase() === 'TRUE');

export const normalizeStatus = (v) => (v ?? '').toString().trim();

/**
 * Returns the next status in the pedagogical cycle.
 */
export const getNextStatus = (currentStatus) => {
  const s = normalizeStatus(currentStatus);
  switch (s) {
    case STATUS_LEVELS.INTRODUCED: return STATUS_LEVELS.PRACTICING;
    case STATUS_LEVELS.PRACTICING: return STATUS_LEVELS.FAMILIAR;
    case STATUS_LEVELS.FAMILIAR:   return STATUS_LEVELS.MASTERED;
    case STATUS_LEVELS.MASTERED:   return STATUS_LEVELS.MASTERED; // Stay Mastered, just reschedule
    case STATUS_LEVELS.REVISIT:    return STATUS_LEVELS.PRACTICING; // Back to practicing
    default: return STATUS_LEVELS.INTRODUCED;
  }
};

/**
 * Calculates the next due date based on the *new* status achieved.
 * @param {string} status 
 * @param {string} interestLevel - 'High' | 'Medium' | 'Low'
 * @returns {Date}
 */
export const calculateNextDueDate = (status, interestLevel = 'Medium') => {
  const s = normalizeStatus(status);
  const now = new Date();
  let daysToAdd = 1;

  switch (s) {
    case STATUS_LEVELS.INTRODUCED: daysToAdd = 1; break;
    case STATUS_LEVELS.PRACTICING: daysToAdd = 1; break;
    case STATUS_LEVELS.FAMILIAR:   daysToAdd = 3; break;
    case STATUS_LEVELS.MASTERED:   daysToAdd = 7; break;
    case STATUS_LEVELS.REVISIT:    daysToAdd = 1; break;
    default: daysToAdd = 1;
  }

  // Optional adjustment for Low Interest: reduce frequency (add more days between practices)
  // so the child isn't overwhelmed by topics they dislike immediately.
  if (interestLevel === 'Low' && (s === STATUS_LEVELS.FAMILIAR || s === STATUS_LEVELS.MASTERED)) {
    daysToAdd += 2; 
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysToAdd);
  nextDate.setHours(6, 0, 0, 0); // Default to 6 AM (Morning block)
  return nextDate;
};

/**
 * Tailwind Color Mapping for the new system.
 */
export const getStatusColorClasses = (status) => {
  const s = normalizeStatus(status);
  switch (s) {
    case STATUS_LEVELS.INTRODUCED: return 'bg-cyan-50 text-cyan-600 border-cyan-200';
    case STATUS_LEVELS.PRACTICING: return 'bg-amber-50 text-amber-600 border-amber-200';
    case STATUS_LEVELS.FAMILIAR:   return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case STATUS_LEVELS.MASTERED:   return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case STATUS_LEVELS.REVISIT:    return 'bg-purple-50 text-purple-600 border-purple-200';
    default: return 'bg-slate-50 text-slate-400 border-slate-200'; // Dormant/Pending
  }
};

export const normalizeStatusForSelect = (s) => {
  const norm = normalizeStatus(s);
  if (Object.values(STATUS_LEVELS).includes(norm)) return norm;
  return ''; // Default to blank (dormant)
};
