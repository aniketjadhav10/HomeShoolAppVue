// Subjects, Lessons, lesson doc content

function saveSubject(subjectId, name, description) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Subjects');
  if (!sheet) return getHomeschoolData();
  const data = sheet.getDataRange().getValues();

  const idIdx = data[0].indexOf('SubjectId') !== -1 ? data[0].indexOf('SubjectId') : 0;
  const isNew = !subjectId || subjectId.toString().startsWith('temp-');
  let createdId = null;

  if (isNew) {
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
    createdId = 'SUB' + nextIdNum.toString().padStart(3, '0');

    console.log(`[DB] Creating new Subject: ${createdId} - ${name}`);
    const updateIdx = data[0].indexOf('UpdatedAt') + 1;
    sheet.appendRow([createdId, name, description, new Date()]);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === subjectId.toString()) {
        console.log(`[DB] Updating Subject: ${subjectId} - ${name}`);
        const updateIdx = data[0].indexOf('UpdatedAt') + 1;
        sheet.getRange(i + 1, 2).setValue(name);
        sheet.getRange(i + 1, 3).setValue(description);
        if (updateIdx > 0) sheet.getRange(i + 1, updateIdx).setValue(new Date());
        break;
      }
    }
  }

  if (typeof clearDataCache === 'function') clearDataCache();
  const result = getHomeschoolData();
  if (isNew) result._newId = createdId;
  return result;
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
  if (typeof clearDataCache === 'function') clearDataCache();
  return getHomeschoolData();
}

function saveLesson(lessonId, subjectId, subjectName, lessonName, description, learnThisWeek, blockType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Lessons');
  if (!sheet) return getHomeschoolData();

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const lIdIdx = headers.indexOf('LessonId');
  const sIdIdx = headers.indexOf('SubjectId');
  const sNameIdx = headers.indexOf('SubjectName');
  const nameIdx = headers.indexOf('LessonName');
  const descIdx = headers.indexOf('Description');
  const blockIdx = headers.indexOf('BlockType');
  const statusIdx = headers.indexOf('Status');
  const createdIdx = headers.indexOf('CreatedDate');
  const weeklyIdx = headers.indexOf('LearnInThisWeek');
  const updateIdx = headers.indexOf('UpdatedAt');
  const lastPracIdx = headers.indexOf('LastPracticedDate');
  const nextDueIdx = headers.indexOf('NextDueDate');
  const intervalIdx = headers.indexOf('RepeatInterval');
  const interestIdx = headers.indexOf('InterestLevel');

  const isNew = !lessonId || lessonId.toString().startsWith('temp-');
  let createdId = null;

  if (isNew) {
    let maxId = 0;
    if (lIdIdx > -1) {
      for (let i = 1; i < data.length; i++) {
        const currentIdStr = data[i][lIdIdx] ? data[i][lIdIdx].toString() : '';
        const match = currentIdStr.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num < 1000000 && num > maxId) maxId = num;
        }
      }
    }
    const nextIdNum = maxId + 1;
    createdId = 'LES' + nextIdNum.toString().padStart(3, '0');

    console.log(`[DB] Creating new Lesson: ${createdId} - ${lessonName} (Subject: ${subjectId})`);
    
    const row = new Array(headers.length).fill('');
    if (sIdIdx > -1) row[sIdIdx] = subjectId;
    if (sNameIdx > -1) row[sNameIdx] = subjectName;
    if (lIdIdx > -1) row[lIdIdx] = createdId;
    if (nameIdx > -1) row[nameIdx] = lessonName;
    if (descIdx > -1) row[descIdx] = description;
    if (blockIdx > -1) row[blockIdx] = blockType || '';
    if (statusIdx > -1) row[statusIdx] = ''; // Default to Dormant (blank), not Pending
    if (createdIdx > -1) row[createdIdx] = new Date();
    if (weeklyIdx > -1) row[weeklyIdx] = learnThisWeek ? 'TRUE' : 'FALSE';
    
    // Explicitly initialize progress counts
    const learnedIdx = headers.indexOf('LearnedCount');
    const targetIdx = headers.indexOf('TargetCount');
    if (learnedIdx > -1) row[learnedIdx] = 0;
    if (targetIdx > -1) row[targetIdx] = 1;

    if (updateIdx > -1) row[updateIdx] = new Date();
    // New Learning Fields initialization
    if (lastPracIdx > -1) row[lastPracIdx] = '';
    if (nextDueIdx > -1) row[nextDueIdx] = '';
    if (intervalIdx > -1) row[intervalIdx] = 1; // Default 1 day
    if (interestIdx > -1) row[interestIdx] = 'Medium';

    sheet.appendRow(row);
  } else {
    for (let i = 1; i < data.length; i++) {
      if (data[i][lIdIdx].toString() === lessonId.toString()) {
        console.log(`[DB] Updating Lesson: ${lessonId} - ${lessonName}`);
        const rowNum = i + 1;
        if (nameIdx > -1) sheet.getRange(rowNum, nameIdx + 1).setValue(lessonName);
        if (descIdx > -1) sheet.getRange(rowNum, descIdx + 1).setValue(description);
        if (blockIdx > -1 && blockType !== undefined) sheet.getRange(rowNum, blockIdx + 1).setValue(blockType);
        if (weeklyIdx > -1) sheet.getRange(rowNum, weeklyIdx + 1).setValue(learnThisWeek ? 'TRUE' : 'FALSE');
        if (updateIdx > -1) sheet.getRange(rowNum, updateIdx + 1).setValue(new Date());
        break;
      }
    }
  }

  if (typeof clearDataCache === 'function') clearDataCache();
  const result = getHomeschoolData();
  if (isNew) result._newId = createdId;
  return result;
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
  if (typeof clearDataCache === 'function') clearDataCache();
  return getHomeschoolData();
}

/**
 * Updates lesson status, planning, or progress counts.
 */
function updateLesson(lessonId, status, learnInThisWeek, learnedCount, targetCount, blockType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Lessons');
  if (!sheet) return getHomeschoolData();

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('LessonId');

  if (idIdx === -1) return getHomeschoolData();

  const statusIdx = headers.indexOf('Status');
  const weeklyIdx = headers.indexOf('LearnInThisWeek');
  const learnedIdx = headers.indexOf('LearnedCount');
  const targetIdx = headers.indexOf('TargetCount');
  const blockIdx = headers.indexOf('BlockType');
  const updateIdx = headers.indexOf('UpdatedAt');
  const lastPracIdx = headers.indexOf('LastPracticedDate');
  const nextDueIdx = headers.indexOf('NextDueDate');
  const intervalIdx = headers.indexOf('RepeatInterval');
  const interestIdx = headers.indexOf('InterestLevel');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === lessonId.toString()) {
      const rowNum = i + 1;
      
      if (statusIdx > -1) {
        // If status is passed as null or undefined, don't update. 
        // If it's passed as "" (Dormant), value will be correctly cleared in the sheet.
        if (status !== undefined) {
          sheet.getRange(rowNum, statusIdx + 1).setValue(status);
        }
      }
      if (learnInThisWeek !== undefined && weeklyIdx > -1) {
        sheet.getRange(rowNum, weeklyIdx + 1).setValue(learnInThisWeek ? 'TRUE' : 'FALSE');
      }
      if (learnedCount !== undefined && learnedIdx > -1) {
        // Force numeric to prevent Google Sheets from misinterpreting small numbers as Dates (e.g. 1901)
        sheet.getRange(rowNum, learnedIdx + 1).setValue(Number(learnedCount) || 0);
      }
      if (targetCount !== undefined && targetIdx > -1) {
        sheet.getRange(rowNum, targetIdx + 1).setValue(Number(targetCount) || 1);
      }
      if (blockType !== undefined && blockIdx > -1) {
        sheet.getRange(rowNum, blockIdx + 1).setValue(blockType);
      }
      if (updateIdx > -1) {
        sheet.getRange(rowNum, updateIdx + 1).setValue(new Date());
      }
      
      // Handle extra fields if provided (for the new learning system)
      // These will be passed from the repository in the next turns.
      // Assuming lessonRepository.updateLesson signature is updated.
      if (arguments.length > 6) {
        const lastPrac = arguments[6];
        const nextDue = arguments[7];
        const interval = arguments[8];
        const interest = arguments[9];
        
        if (lastPrac !== undefined && lastPracIdx > -1) sheet.getRange(rowNum, lastPracIdx + 1).setValue(lastPrac);
        if (nextDue !== undefined && nextDueIdx > -1) sheet.getRange(rowNum, nextDueIdx + 1).setValue(nextDue);
        if (interval !== undefined && intervalIdx > -1) sheet.getRange(rowNum, intervalIdx + 1).setValue(interval);
        if (interest !== undefined && interestIdx > -1) sheet.getRange(rowNum, interestIdx + 1).setValue(interest);
      }
      break;
    }
  }

  if (typeof clearDataCache === 'function') clearDataCache();
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
