// Calendar Events (Holidays, Breaks, Monthly/Weekly Tasks)

function saveCalendarEvent(eventId, dateStr, title, type, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetWithHeaders_(ss, 'CalendarEvents', [
    'EventId',
    'Date',
    'Title',
    'Type', // "Holiday", "Break", "Task", etc.
    'Notes',
    'CreatedAt'
  ]);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('EventId');
  const now = new Date();
  
  if (!eventId) {
    const newId = 'EVT' + sheet.getLastRow().toString().padStart(4, '0');
    sheet.appendRow([newId, dateStr, title, type, notes || '', now]);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === eventId.toString()) {
        sheet.getRange(i + 1, headers.indexOf('Date') + 1).setValue(dateStr);
        sheet.getRange(i + 1, headers.indexOf('Title') + 1).setValue(title);
        sheet.getRange(i + 1, headers.indexOf('Type') + 1).setValue(type);
        sheet.getRange(i + 1, headers.indexOf('Notes') + 1).setValue(notes || '');
        break;
      }
    }
  }
  return getHomeschoolData();
}

function deleteCalendarEvent(eventId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CalendarEvents');
  if (!sheet) return getHomeschoolData();
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('EventId');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === eventId.toString()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return getHomeschoolData();
}
