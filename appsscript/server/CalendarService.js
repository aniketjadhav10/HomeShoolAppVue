/**
 * CalendarService.js
 * Handles synchronization between the Homeschool Plan and Google Calendar.
 */

/**
 * Syncs the current weekly plan to a dedicated Google Calendar.
 */
function syncWeeklyPlanToCalendar() {
  const settings = getAppSettings();
  let calendarId = settings['homeschool_calendar_id'];
  let calendar;

  // 1. Find or Create the "Yug Homeschool" Calendar
  if (calendarId) {
    try {
      calendar = CalendarApp.getCalendarById(calendarId);
    } catch (e) {
      console.warn(`[Calendar] Calendar ID ${calendarId} not found. Creating new one.`);
    }
  }

  if (!calendar) {
    calendar = CalendarApp.getCalendarsByName('Yug Homeschool')[0];
    if (!calendar) {
      calendar = CalendarApp.createCalendar('Yug Homeschool', {
        summary: 'Daily schedule and lessons for Yug Homeschooling.',
        color: '#2563eb'
      });
      console.log(`[Calendar] Created new calendar: ${calendar.getId()}`);
    }
    calendarId = calendar.getId();
    saveAppSettings({ 'homeschool_calendar_id': calendarId });
  }

  // 2. Determine the date range (Current Week)
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  console.log(`[Calendar] Syncing week: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);

  // 3. Clear existing events for this week to avoid duplicates
  const existingEvents = calendar.getEvents(weekStart, weekEnd);
  console.log(`[Calendar] Clearing ${existingEvents.length} existing events.`);
  existingEvents.forEach(e => e.deleteEvent());

  // 4. Fetch Lessons for the week
  const lessons = getHomeschoolData().lessons.filter(l => (l.LearnInThisWeek === 'TRUE' || l.LearnInThisWeek === true));
  
  // 5. Block Definitions (Matching DashboardView.vue)
  const blocks = [
    { id: '🌞 Morning Energy (6 AM – 10 AM)', name: 'Morning Energy', start: 6, end: 10, color: CalendarApp.EventColor.YELLOW },
    { id: '🧠 Deep Learning (10 AM – 2 PM)',  name: 'Deep Learning',  start: 10, end: 14, color: CalendarApp.EventColor.PALE_BLUE },
    { id: '😴 Rest & Creative (2 PM – 6 PM)', name: 'Rest & Creative', start: 14, end: 18, color: CalendarApp.EventColor.MAUVE },
    { id: '🌆 Life Learning (6 PM – 10 PM)',  name: 'Life Learning',  start: 18, end: 22, color: CalendarApp.EventColor.PALE_GREEN }
  ];

  // 6. Create events for each day (Mon-Sun)
  for (let d = 0; d < 7; d++) {
    const currentDayDate = new Date(weekStart);
    currentDayDate.setDate(weekStart.getDate() + d);

    blocks.forEach(block => {
      // Find lessons assigned to this block for any day (currently lessons are weekly, not daily assigned)
      // If the lesson.BlockType matches the block.id, we include it.
      const assignedLessons = lessons.filter(l => l.BlockType === block.id);
      
      if (assignedLessons.length > 0) {
        const startTime = new Date(currentDayDate);
        startTime.setHours(block.start, 0, 0, 0);
        
        const endTime = new Date(currentDayDate);
        endTime.setHours(block.end, 0, 0, 0);

        const title = `📖 ${block.name}`;
        const description = "Today's Lessons:\n\n" + assignedLessons.map(l => `• ${l.LessonName}`).join('\n');

        const event = calendar.createEvent(title, startTime, endTime, {
          description: description
        });
        
        event.setColor(block.color);
        console.log(`[Calendar] Created event: ${title} on ${currentDayDate.toDateString()}`);
      }
    });
  }

  return {
    status: 'success',
    message: `Plan synced to Google Calendar (${calendar.getName()})`,
    calendarId: calendarId
  };
}
