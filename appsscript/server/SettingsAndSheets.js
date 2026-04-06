// Settings tab + shared sheet utilities

function getAppSettings() {
  const defaults = {
    weekStartDay: 'MONDAY',
    lessonDocId: '1N9Ihq2mvLv82NDOBVPeRKTX67W3FKSWTO3wM676O0J4',
    childAge: '2',
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) return defaults;

  const rows = sheet.getDataRange().getDisplayValues();
  if (rows.length < 2) return defaults;

  const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase());
  const keyIdx = headers.indexOf('key');
  const valIdx = headers.indexOf('value');
  if (keyIdx === -1 || valIdx === -1) return defaults;

  const out = Object.assign({}, defaults);
  for (let i = 1; i < rows.length; i++) {
    const k = (rows[i][keyIdx] || '').toString().trim();
    const v = (rows[i][valIdx] || '').toString().trim();
    if (!k) continue;
    out[k] = v;
  }
  return out;
}

function saveAppSettings(settingsObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Settings');
  if (!sheet) {
    sheet = ss.insertSheet('Settings');
    sheet.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
  }

  const entries = Object.entries(settingsObj || {});
  if (!entries.length) return getAppSettings();

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase());
  let keyIdx = headers.indexOf('key');
  let valIdx = headers.indexOf('value');
  if (keyIdx === -1 || valIdx === -1) {
    sheet.clear();
    sheet.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
  }

  const cur = sheet.getDataRange().getValues();
  const curMap = {};
  for (let i = 1; i < cur.length; i++) {
    const k = (cur[i][0] || '').toString().trim();
    if (k) curMap[k] = i + 1;
  }

  entries.forEach(([k, v]) => {
    const key = (k || '').toString().trim();
    if (!key) return;
    const rowNum = curMap[key];
    if (rowNum) {
      sheet.getRange(rowNum, 2).setValue(v);
    } else {
      sheet.appendRow([key, v]);
    }
  });

  return getAppSettings();
}

function ensureSheetWithHeaders_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }
  const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0] || [];
  const existingSet = new Set(existing.map(h => (h || '').toString().trim()));
  const missing = headers.filter(h => !existingSet.has(h));
  if (missing.length) {
    sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
  }
  return sheet;
}
