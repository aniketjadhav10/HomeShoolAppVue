// Subjects, Lessons, lesson doc content

function saveSubject(subjectId, name, description) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subjects');
  const data = sheet.getDataRange().getValues();

  const idIdx = data[0].indexOf('SubjectId') !== -1 ? data[0].indexOf('SubjectId') : 0;

  if (!subjectId) {
    let maxId = 0;

    for (let i = 1; i < data.length; i++) {
      const currentIdStr = data[i][idIdx] ? data[i][idIdx].toString() : '';
      const match = currentIdStr.match(/\d+/);

      if (match) {
        const num = parseInt(match[0], 10);
        if (num < 1000000 && num > maxId) {
          maxId = num;
        }
      }
    }

    const nextIdNum = maxId + 1;
    const newId = 'SUB' + nextIdNum.toString().padStart(3, '0');

    sheet.appendRow([newId, name, description]);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === subjectId.toString()) {
        sheet.getRange(i + 1, 2).setValue(name);
        sheet.getRange(i + 1, 3).setValue(description);
        break;
      }
    }
  }

  return getHomeschoolData();
}

function deleteSubject(subjectId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subjects');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('SubjectId');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === subjectId.toString()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return getHomeschoolData();
}

function saveLesson(lessonId, subjectId, subjectName, lessonName, description, learnThisWeek) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Lessons');

  const data = sheet.getDataRange().getValues();

  const idIdx = data[0].indexOf('LessonId') !== -1 ? data[0].indexOf('LessonId') : 2;

  if (!lessonId) {
    let maxId = 0;

    for (let i = 1; i < data.length; i++) {
      const currentIdStr = data[i][idIdx] ? data[i][idIdx].toString() : '';
      const match = currentIdStr.match(/\d+/);

      if (match) {
        const num = parseInt(match[0], 10);
        if (num < 1000000 && num > maxId) {
          maxId = num;
        }
      }
    }

    const nextIdNum = maxId + 1;
    const newId = 'LES' + nextIdNum.toString().padStart(3, '0');

    sheet.appendRow([
      subjectId,
      subjectName,
      newId,
      lessonName,
      description,
      '',
      'Pending',
      new Date(),
      '',
      learnThisWeek ? 'TRUE' : 'FALSE',
    ]);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === lessonId.toString()) {
        sheet.getRange(i + 1, 4).setValue(lessonName);
        sheet.getRange(i + 1, 5).setValue(description);
        sheet.getRange(i + 1, 10).setValue(learnThisWeek ? 'TRUE' : 'FALSE');
        break;
      }
    }
  }

  return getHomeschoolData();
}

function deleteLesson(lessonId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Lessons');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('LessonId');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === lessonId.toString()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return getHomeschoolData();
}

function getLessonDocContent(lessonName) {
  console.log('Lesson requested:', lessonName);
  const DOC_ID =
    getAppSettings().lessonDocId || '1N9Ihq2mvLv82NDOBVPeRKTX67W3FKSWTO3wM676O0J4';

  const doc = DocumentApp.openById(DOC_ID);
  const body = doc.getBody();
  const paragraphs = body.getParagraphs();

  let capture = false;
  const lines = [];

  paragraphs.forEach(p => {
    const text = p.getText();

    if (text.trim() === lessonName) {
      capture = true;
      return;
    }

    if (capture && p.getHeading() == DocumentApp.ParagraphHeading.HEADING1) {
      capture = false;
    }

    if (capture) {
      lines.push(text);
    }
  });

  return lines.join('\n\n');
}
