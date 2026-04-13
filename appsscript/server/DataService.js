// Optimization: Use CacheService to reduce repeated sheet reads.
// GAS Cache limit is 100KB per entry, so we use chunking for larger datasets.
var CACHE_PREFIX = 'h_data_';
var CACHE_EXP = 600; // 10 mins

function getHomeschoolData(since) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'global_full';

  let allData = null;
  const cachedStr = getCacheChunked_(cache, cacheKey);

  if (cachedStr) {
    try {
      allData = JSON.parse(cachedStr);
    } catch (e) {
      console.warn('Cache parse failed', e);
    }
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!allData) {
    console.log('[Cache] Miss: Reading all sheets from SpreadsheetApp');
    allData = {
      subjects: getSheetDataAsObjects_(ss, 'Subjects'),
      lessons: getSheetDataAsObjects_(ss, 'Lessons'),
      tasks: getSheetDataAsObjects_(ss, 'LessonTask'),
      progress: getSheetDataAsObjects_(ss, 'Progress Tracker'),
      improvements: getSheetDataAsObjects_(ss, 'Improvements'),
      resources: getSheetDataAsObjects_(ss, 'Resources'),
      schedule: getSheetDataAsObjects_(ss, 'Schedule'),
      attendance: getSheetDataAsObjects_(ss, 'Attendance'),
      timeLogs: getSheetDataAsObjects_(ss, 'TimeLogs'),
      assessments: getSheetDataAsObjects_(ss, 'Assessments'),
      portfolio: getSheetDataAsObjects_(ss, 'Portfolio'),
      calendarEvents: getSheetDataAsObjects_(ss, 'CalendarEvents'),
    };

    // Background cache fill
    putCacheChunked_(cache, cacheKey, JSON.stringify(allData));
  } else {
    console.log('[Cache] Hit: Global data loaded from ScriptCache');
  }

  const settings = getAppSettings();
  const sinceDate = since ? new Date(parseInt(since) - 5000) : null;
  console.log(`[Sync] filtering data since: ${sinceDate ? sinceDate.toISOString() : 'EPOCH'}`);

  const result = {
    settings: settings,
    serverTime: new Date().getTime()
  };

  // Perform memory filtering for incremental sync
  Object.keys(allData).forEach(key => {
    if (!sinceDate) {
      result[key] = allData[key];
    } else {
      result[key] = allData[key].filter(row => {
        const u = row.UpdatedAt;
        if (!u) return true;
        const d = u instanceof Date ? u : new Date(u);
        return d > sinceDate;
      });
      console.log(`[Filter] ${key}: ${result[key].length}/${allData[key].length} newer items`);
    }
  });

  return result;
}

/** Internal helper for optimized sheet reads */
function getSheetDataAsObjects_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function clearDataCache() {
  const cache = CacheService.getScriptCache();
  const manifestRaw = cache.get('global_full_chunks');
  if (manifestRaw) {
    try {
      const manifest = JSON.parse(manifestRaw);
      for (let i = 0; i < manifest.count; i++) {
        cache.remove('global_full_chunk_' + i);
      }
    } catch (e) {}
  }
  cache.remove('global_full_chunks');
}

// ─── CHUNKED CACHE HELPERS ───────────────────────────────────────────────────

function putCacheChunked_(cache, key, value) {
  const chunkSize = 90 * 1024; // ~90KB
  const chunks = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.substring(i, i + chunkSize));
  }

  const manifest = { key: key, count: chunks.length, lastUpdated: new Date().getTime() };
  cache.put(key + '_chunks', JSON.stringify(manifest), CACHE_EXP);

  chunks.forEach((chunk, i) => {
    cache.put(key + '_chunk_' + i, chunk, CACHE_EXP);
  });
}

function getCacheChunked_(cache, key) {
  const manifestRaw = cache.get(key + '_chunks');
  if (!manifestRaw) return null;

  const manifest = JSON.parse(manifestRaw);
  let value = "";
  for (let i = 0; i < manifest.count; i++) {
    const chunk = cache.get(key + '_chunk_' + i);
    if (chunk === null) return null; // Incomplete cache
    value += chunk;
  }
  return value;
}
