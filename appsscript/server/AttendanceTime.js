// Daily attendance + time logs

function markAttendance(dateStr, status, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetWithHeaders_(ss, 'Attendance', ['Date', 'Status', 'Notes', 'UpdatedAt']);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dateIdx = headers.indexOf('Date');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  const updatedIdx = headers.indexOf('UpdatedAt');
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    if ((data[i][dateIdx] || '').toString() === dateStr.toString()) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(status);
      sheet.getRange(i + 1, notesIdx + 1).setValue(notes || '');
      sheet.getRange(i + 1, updatedIdx + 1).setValue(now);
      return getHomeschoolData();
    }
  }
  sheet.appendRow([dateStr, status, notes || '', now]);
  return getHomeschoolData();
}

function logTime(dateStr, subjectId, subjectName, lessonId, lessonName, minutes, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetWithHeaders_(ss, 'TimeLogs', [
    'TimeLogId',
    'Date',
    'Minutes',
    'SubjectId',
    'SubjectName',
    'LessonId',
    'LessonName',
    'Notes',
    'CreatedAt',
  ]);
  const newId = 'TL' + sheet.getLastRow().toString().padStart(5, '0');
  sheet.appendRow([
    newId,
    dateStr,
    minutes,
    subjectId,
    subjectName,
    lessonId,
    lessonName,
    notes || '',
    new Date(),
  ]);
  return getHomeschoolData();
}
