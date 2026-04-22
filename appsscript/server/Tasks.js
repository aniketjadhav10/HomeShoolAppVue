// LessonTask sheet: progress updates, CRUD, Gemini generation

function updateTask(taskId, lessonId, lessonName, status, learnedCount, targetCount, photo, blockType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const taskSheet = ss.getSheetByName('LessonTask');

  if (taskSheet) {
    const data = taskSheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx      = headers.indexOf('LessonTaskId');
    const statusIdx  = headers.indexOf('Status');
    const learnedIdx = headers.indexOf('LearnedCount');
    const targetIdx  = headers.indexOf('TargetCount');
    const photoIdx   = headers.indexOf('Photo');
    const blockIdx   = headers.indexOf('BlockType');
    const updateIdx  = headers.indexOf('UpdatedAt');

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx].toString() === taskId.toString()) {
        const rowNum = i + 1;
        if (statusIdx  > -1) taskSheet.getRange(rowNum, statusIdx  + 1).setValue(status);
        if (learnedIdx > -1) taskSheet.getRange(rowNum, learnedIdx + 1).setValue(learnedCount);
        if (targetIdx  > -1) taskSheet.getRange(rowNum, targetIdx  + 1).setValue(targetCount);
        if (photoIdx   > -1 && photo     !== undefined) taskSheet.getRange(rowNum, photoIdx   + 1).setValue(photo);
        if (blockIdx   > -1 && blockType !== undefined) taskSheet.getRange(rowNum, blockIdx   + 1).setValue(blockType);
        if (updateIdx  > -1) taskSheet.getRange(rowNum, updateIdx  + 1).setValue(new Date());
        console.log(`[Tasks] updateTask ${taskId}: status=${status}, block=${blockType}`);
        break;
      }
    }
  }

  // Log completion to Progress Tracker
  if (status === 'Completed') {
    const progSheet = ss.getSheetByName('Progress Tracker');
    if (progSheet) {
      const newId = progSheet.getLastRow();
      progSheet.appendRow([newId, taskId, lessonId, lessonName, new Date(), new Date()]);
    }
  }

  if (typeof clearDataCache === 'function') clearDataCache();
  return { success: true };
}

function saveLessonTask(taskId, lessonId, lessonName, notes, targetCount) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('LessonTask');
  if (!sheet) {
    throw new Error('LessonTask sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const lIdIdx = headers.indexOf('LessonId');
  const taskIdIdx = headers.indexOf('LessonTaskId');
  const nameIdx = headers.indexOf('TaskName');
  const notesIdx = headers.indexOf('Notes');
  const statusIdx = headers.indexOf('Status');
  const learnedIdx = headers.indexOf('LearnedCount');
  const targetIdx = headers.indexOf('TargetCount');
  const updateIdx = headers.indexOf('UpdatedAt');

  const safeTarget = parseInt(targetCount, 10) || 1;

  const isNew = !taskId || taskId.toString().startsWith('temp-');
  let createdId = null;

  if (isNew) {
    let maxId = 0;
    if (taskIdIdx > -1) {
      for (let i = 1; i < data.length; i++) {
        const current = data[i][taskIdIdx] ? data[i][taskIdIdx].toString() : '';
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
    createdId = 'TASK' + nextIdNum.toString().padStart(3, '0');

    console.log(`[DB] Creating new Task: ${createdId} - ${lessonName} (Lesson: ${lessonId})`);
    const row = new Array(headers.length).fill('');

    if (lIdIdx > -1) row[lIdIdx] = lessonId;
    if (taskIdIdx > -1) row[taskIdIdx] = createdId;
    if (nameIdx > -1) row[nameIdx] = lessonName;
    if (notesIdx > -1) row[notesIdx] = notes || '';
    if (statusIdx > -1) row[statusIdx] = 'Pending';
    if (learnedIdx > -1) row[learnedIdx] = 0;
    if (targetIdx > -1) row[targetIdx] = safeTarget;
    if (updateIdx > -1) row[updateIdx] = new Date();

    sheet.appendRow(row);
  } else {
    if (taskIdIdx === -1) {
      throw new Error('LessonTaskId column not found in LessonTask sheet');
    }
    for (let i = 1; i < data.length; i++) {
      if (data[i][taskIdIdx].toString() === taskId.toString()) {
        console.log(`[DB] Updating Task: ${taskId} - ${lessonName}`);
        if (nameIdx > -1) sheet.getRange(i + 1, nameIdx + 1).setValue(lessonName);
        if (notesIdx > -1) sheet.getRange(i + 1, notesIdx + 1).setValue(notes || '');
        if (targetIdx > -1) sheet.getRange(i + 1, targetIdx + 1).setValue(safeTarget);
        if (updateIdx > -1) sheet.getRange(i + 1, updateIdx + 1).setValue(new Date());
        break;
      }
    }
  }

  if (typeof clearDataCache === 'function') clearDataCache();
  return { _newId: isNew ? createdId : null };
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

  if (typeof clearDataCache === 'function') clearDataCache();
  return { success: true };
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
  const lIdIdx = headers.indexOf('LessonId');
  const taskIdIdx = headers.indexOf('LessonTaskId');
  const nameIdx = headers.indexOf('TaskName');
  const notesIdx = headers.indexOf('Notes');
  const statusIdx = headers.indexOf('Status');
  const learnedIdx = headers.indexOf('LearnedCount');
  const targetIdx = headers.indexOf('TargetCount');
  const updateIdx = headers.indexOf('UpdatedAt');

  let maxId = 0;
  if (taskIdIdx > -1) {
    for (let i = 1; i < data.length; i++) {
      const current = data[i][taskIdIdx] ? data[i][taskIdIdx].toString() : '';
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
    if (lIdIdx > -1) row[lIdIdx] = lessonId;
    if (taskIdIdx > -1) row[taskIdIdx] = newId;
    if (nameIdx > -1) row[nameIdx] = title;
    if (notesIdx > -1) row[notesIdx] = notes;
    if (statusIdx > -1) row[statusIdx] = 'Pending';
    if (learnedIdx > -1) row[learnedIdx] = 0;
    if (targetIdx > -1) row[targetIdx] = 1;
    if (updateIdx > -1) row[updateIdx] = new Date();

    newRows.push(row);
  });

  if (newRows.length) {
    console.log(`[AI] Appending ${newRows.length} tasks generated by Gemini to LessonTask sheet.`);
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  } else {
    console.warn('[AI] Gemini returned data but no valid task rows were constructed.');
  }

  if (typeof clearDataCache === 'function') clearDataCache();
  return { success: true };
}

/**
 * Uses Gemini to suggest a creative alternative for a lesson with low interest.
 */
function getAlternativeActivityWithAi(lessonName, childAge) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not set.');

  const prompt = `Yug is a ${childAge} year old child. The lesson "${lessonName}" currently has low interest. 
  Suggest 3 short, creative, and highly engaging alternative ways to teach this same topic. 
  Focus on play-based learning, sensory activities, or storytelling. 
  Keep suggestions very brief (1-2 sentences each).`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });

  const json = JSON.parse(response.getContentText());
  const text = json.candidates[0].content.parts[0].text;
  
  return {
    status: 'success',
    suggestion: text
  };
}
