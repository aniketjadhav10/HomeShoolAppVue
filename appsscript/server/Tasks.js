// LessonTask sheet: progress updates, CRUD, Gemini generation

function updateTask(taskId, lessonId, lessonName, progressVal, isLearnedToday) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const taskSheet = ss.getSheetByName('LessonTask');

  if (taskSheet) {
    const data = taskSheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf('LessonTaskId');
    const progIdx = headers.indexOf('Progress');
    const learnedIdx = headers.indexOf('LearnedToday');
    const lastLearnedIdx = headers.indexOf('LastLearned');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === taskId.toString()) {
        if (progIdx > -1) taskSheet.getRange(i + 1, progIdx + 1).setValue(progressVal);
        if (learnedIdx > -1) taskSheet.getRange(i + 1, learnedIdx + 1).setValue(isLearnedToday ? 'TRUE' : 'FALSE');
        if (isLearnedToday && lastLearnedIdx > -1) {
          taskSheet.getRange(i + 1, lastLearnedIdx + 1).setValue(new Date());
        }
        break;
      }
    }
  }

  if (isLearnedToday) {
    const progSheet = ss.getSheetByName('Progress Tracker');
    if (progSheet) {
      const newId = progSheet.getLastRow();
      progSheet.appendRow([newId, taskId, lessonId, lessonName, new Date()]);
    }
  }

  return getHomeschoolData();
}

function saveLessonTask(taskId, lessonId, lessonName, notes, initialProgress) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('LessonTask');
  if (!sheet) {
    throw new Error('LessonTask sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx = headers.indexOf('LessonTaskId');
  const lessonIdIdx = headers.indexOf('LessonId');
  const nameIdx = headers.indexOf('Task Name');
  const notesIdx = headers.indexOf('Notes');
  const progressIdx = headers.indexOf('Progress');
  const learnedIdx = headers.indexOf('LearnedToday');

  const safeProgress =
    typeof initialProgress === 'number' ? initialProgress : parseInt(initialProgress, 10) || 0;

  if (!taskId) {
    let maxId = 0;
    if (idIdx > -1) {
      for (let i = 1; i < data.length; i++) {
        const current = data[i][idIdx] ? data[i][idIdx].toString() : '';
        const match = current.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num < 1000000 && num > maxId) {
            maxId = num;
          }
        }
      }
    }
    const nextIdNum = maxId + 1;
    const newId = 'TASK' + nextIdNum.toString().padStart(3, '0');

    const row = new Array(headers.length).fill('');

    if (idIdx > -1) row[idIdx] = newId;
    if (lessonIdIdx > -1) row[lessonIdIdx] = lessonId;
    if (nameIdx > -1) row[nameIdx] = lessonName;
    if (notesIdx > -1) row[notesIdx] = notes || '';
    if (progressIdx > -1) row[progressIdx] = safeProgress;
    if (learnedIdx > -1) row[learnedIdx] = safeProgress === 100 ? 'TRUE' : 'FALSE';

    sheet.appendRow(row);
  } else {
    if (idIdx === -1) {
      throw new Error('LessonTaskId column not found in LessonTask sheet');
    }
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === taskId.toString()) {
        if (nameIdx > -1) sheet.getRange(i + 1, nameIdx + 1).setValue(lessonName);
        if (notesIdx > -1) sheet.getRange(i + 1, notesIdx + 1).setValue(notes || '');
        break;
      }
    }
  }

  return getHomeschoolData();
}

function deleteLessonTask(taskId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('LessonTask');
  if (!sheet) {
    throw new Error('LessonTask sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('LessonTaskId');

  if (idIdx === -1) {
    throw new Error('LessonTaskId column not found in LessonTask sheet');
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === taskId.toString()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return getHomeschoolData();
}

function generateLessonTasksWithGemini(lessonId, lessonName, childAge) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY script property is not set. Add it in Apps Script Project Settings.');
  }

  const prompt = [
    'You are helping a homeschooling parent create concrete lesson tasks.',
    'Return ONLY valid JSON, no markdown and no explanation.',
    'The JSON must be an array of objects with these fields:',
    '  - "taskName": short actionable task title',
    '  - "notes": short hint/materials/what to do',
    '',
    'Constraints:',
    '- Child age: ' + childAge,
    '- Lesson title: "' + lessonName + '"',
    '- 3 to 6 tasks, ordered from easiest to hardest.',
    '',
    'Example output format (structure only):',
    '[{"taskName":"...","notes":"..."},{"taskName":"...","notes":"..."}]',
  ].join('\n');

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
    apiKey;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const json = JSON.parse(response.getContentText());
  const candidates = json.candidates || [];
  if (
    !candidates.length ||
    !candidates[0].content ||
    !candidates[0].content.parts ||
    !candidates[0].content.parts.length
  ) {
    throw new Error('No response from Gemini when generating tasks.');
  }

  let text = candidates[0].content.parts.map(p => p.text || '').join('\n');

  text = text.replace(/```json/gi, '```').trim();
  if (text.indexOf('```') === 0) {
    text = text.replace(/^```/, '');
  }
  if (text.lastIndexOf('```') !== -1) {
    text = text.substring(0, text.lastIndexOf('```'));
  }

  let tasksFromAi;
  try {
    tasksFromAi = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse Gemini JSON: ' + e);
  }

  if (!Array.isArray(tasksFromAi) || tasksFromAi.length === 0) {
    throw new Error('Gemini returned no tasks.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('LessonTask');
  if (!sheet) {
    throw new Error('LessonTask sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx = headers.indexOf('LessonTaskId');
  const lessonIdIdx = headers.indexOf('LessonId');
  const nameIdx = headers.indexOf('Task Name');
  const notesIdx = headers.indexOf('Notes');
  const progressIdx = headers.indexOf('Progress');
  const learnedIdx = headers.indexOf('LearnedToday');

  let maxId = 0;
  if (idIdx > -1) {
    for (let i = 1; i < data.length; i++) {
      const current = data[i][idIdx] ? data[i][idIdx].toString() : '';
      const match = current.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num < 1000000 && num > maxId) {
          maxId = num;
        }
      }
    }
  }

  const newRows = [];
  tasksFromAi.forEach(t => {
    const title = (t.taskName || '').toString().trim();
    const notes = (t.notes || '').toString().trim();
    if (!title) return;
    maxId += 1;
    const newId = 'TASK' + maxId.toString().padStart(3, '0');

    const row = new Array(headers.length).fill('');
    if (idIdx > -1) row[idIdx] = newId;
    if (lessonIdIdx > -1) row[lessonIdIdx] = lessonId;
    if (nameIdx > -1) row[nameIdx] = title;
    if (notesIdx > -1) row[notesIdx] = notes;
    if (progressIdx > -1) row[progressIdx] = 0;
    if (learnedIdx > -1) row[learnedIdx] = 'FALSE';

    newRows.push(row);
  });

  if (newRows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }

  return getHomeschoolData();
}
