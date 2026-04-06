// CSV exports / report builders

function exportWeeklyReportCsv(startDateStr, endDateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schedule = getSheetDataAsObjects(ss, 'Schedule');
  const timeLogs = getSheetDataAsObjects(ss, 'TimeLogs');
  const tasks = getSheetDataAsObjects(ss, 'LessonTask');

  const inRange = d => d >= startDateStr && d <= endDateStr;

  const completedTasks = tasks.filter(t => {
    const progress = parseInt(t.Progress) || 0;
    return progress === 100 || t.LearnedToday === 'TRUE';
  }).length;

  const minutesTotal = timeLogs
    .filter(t => inRange(t.Date))
    .reduce((acc, t) => acc + (parseInt(t.Minutes) || 0), 0);
  const scheduledCount = schedule.filter(s => inRange(s.Date)).length;

  const rows = [
    ['Metric', 'Value'],
    ['StartDate', startDateStr],
    ['EndDate', endDateStr],
    ['ScheduledBlocks', scheduledCount],
    ['TimeMinutes', minutesTotal],
    ['CompletedTasksTotal', completedTasks],
  ];

  return rows
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
