// Assessments + portfolio artifacts

function saveAssessment(assessmentId, dateStr, lessonId, lessonName, type, score, maxScore, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetWithHeaders_(ss, 'Assessments', [
    'AssessmentId',
    'Date',
    'LessonId',
    'LessonName',
    'Type',
    'Score',
    'MaxScore',
    'Notes',
    'CreatedAt',
    'UpdatedAt',
  ]);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('AssessmentId');
  const now = new Date();
  if (!assessmentId) {
    const newId = 'ASM' + sheet.getLastRow().toString().padStart(4, '0');
    sheet.appendRow([
      newId,
      dateStr,
      lessonId,
      lessonName,
      type,
      score,
      maxScore,
      notes || '',
      now,
      now,
    ]);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === assessmentId.toString()) {
        sheet.getRange(i + 1, headers.indexOf('Date') + 1).setValue(dateStr);
        sheet.getRange(i + 1, headers.indexOf('Type') + 1).setValue(type);
        sheet.getRange(i + 1, headers.indexOf('Score') + 1).setValue(score);
        sheet.getRange(i + 1, headers.indexOf('MaxScore') + 1).setValue(maxScore);
        sheet.getRange(i + 1, headers.indexOf('Notes') + 1).setValue(notes || '');
        sheet.getRange(i + 1, headers.indexOf('UpdatedAt') + 1).setValue(now);
        break;
      }
    }
  }
  return getHomeschoolData();
}

function savePortfolioItem(itemId, dateStr, lessonId, lessonName, title, url, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheetWithHeaders_(ss, 'Portfolio', [
    'PortfolioId',
    'Date',
    'LessonId',
    'LessonName',
    'Title',
    'URL',
    'Notes',
    'CreatedAt',
  ]);
  if (!itemId) {
    const newId = 'PF' + sheet.getLastRow().toString().padStart(5, '0');
    sheet.appendRow([newId, dateStr, lessonId, lessonName, title, url, notes || '', new Date()]);
  }
  return getHomeschoolData();
}
