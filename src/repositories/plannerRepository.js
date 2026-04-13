import { dataStore, dispatchAction } from '../stores/dataStore';

/**
 * plannerRepository.js
 * Handles Schedules and Calendar Events.
 */
export const plannerRepository = {
  // --- Schedules ---
  getSchedules() {
    return dataStore.state.schedule || [];
  },

  getSchedulesByDate(date) {
    return (dataStore.state.schedule || []).filter(s => s.Date === date);
  },

  async saveScheduleEntry(id, date, start, end, subjectId, subjectName, lessonId, lessonName, notes) {
    console.log(`[Repo] saveScheduleEntry called. Date: ${date}, Lesson: ${lessonName}`);
    return await dispatchAction('saveScheduleEntry', id, date, start, end, subjectId, subjectName, lessonId, lessonName, notes);
  },

  // --- Calendar Events ---
  getCalendarEvents() {
    return dataStore.state.calendarEvents || [];
  },

  getEventsByDate(date) {
    return (dataStore.state.calendarEvents || []).filter(e => e.Date === date);
  },

  async saveCalendarEvent(id, date, title, type, notes) {
    console.log(`[Repo] saveCalendarEvent called. Date: ${date}, Title: ${title}`);
    return await dispatchAction('saveCalendarEvent', id, date, title, type, notes);
  }
};
