// Weekly schedule (time blocks)

function saveScheduleEntry(
  entryId,
  dateStr,
  startTime,
  endTime,
  subjectId,
  subjectName,
  lessonId,
  lessonName,
  notes
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetWithHeaders_(ss, 'Schedule', [
    'ScheduleId',
    'Date',
    'StartTime',
    'EndTime',
    'SubjectId',
    'SubjectName',
    'LessonId',
    'LessonName',
    'Notes',
    'CreatedAt',
    'UpdatedAt',
  ]);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('ScheduleId');

  const now = new Date();
  if (!entryId) {
    const newId = 'SCH' + sheet.getLastRow().toString().padStart(4, '0');
    sheet.appendRow([
      newId,
      dateStr,
      startTime,
      endTime,
      subjectId,
      subjectName,
      lessonId,
      lessonName,
      notes || '',
      now,
      now,
    ]);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === entryId.toString()) {
        sheet.getRange(i + 1, headers.indexOf('Date') + 1).setValue(dateStr);
        sheet.getRange(i + 1, headers.indexOf('StartTime') + 1).setValue(startTime);
        sheet.getRange(i + 1, headers.indexOf('EndTime') + 1).setValue(endTime);
        sheet.getRange(i + 1, headers.indexOf('SubjectId') + 1).setValue(subjectId);
        sheet.getRange(i + 1, headers.indexOf('SubjectName') + 1).setValue(subjectName);
        sheet.getRange(i + 1, headers.indexOf('LessonId') + 1).setValue(lessonId);
        sheet.getRange(i + 1, headers.indexOf('LessonName') + 1).setValue(lessonName);
        sheet.getRange(i + 1, headers.indexOf('Notes') + 1).setValue(notes || '');
        sheet.getRange(i + 1, headers.indexOf('UpdatedAt') + 1).setValue(now);
        break;
      }
    }
  }

  return getHomeschoolData();
}

function deleteScheduleEntry(entryId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Schedule');
  if (!sheet) return getHomeschoolData();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('ScheduleId');
  if (idIdx === -1) return getHomeschoolData();
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === entryId.toString()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return getHomeschoolData();
}
