// Central data load for the React app

function getHomeschoolData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    subjects: getSheetDataAsObjects(ss, 'Subjects'),
    lessons: getSheetDataAsObjects(ss, 'Lessons'),
    tasks: getSheetDataAsObjects(ss, 'LessonTask'),
    progress: getSheetDataAsObjects(ss, 'Progress Tracker'),
    improvements: getSheetDataAsObjects(ss, 'Improvements'),
    resources: getSheetDataAsObjects(ss, 'Resources'),
    settings: getAppSettings(),
    schedule: getSheetDataAsObjects(ss, 'Schedule'),
    attendance: getSheetDataAsObjects(ss, 'Attendance'),
    timeLogs: getSheetDataAsObjects(ss, 'TimeLogs'),
    assessments: getSheetDataAsObjects(ss, 'Assessments'),
    portfolio: getSheetDataAsObjects(ss, 'Portfolio'),
  };
}

function getSheetDataAsObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}
