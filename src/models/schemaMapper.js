/**
 * schemaMapper.js
 * 
 * Centralized mapping for Application Model Properties to Database Column Names.
 * 
 * CURRENT STATE:
 * The application properties exactly match the Google Sheet column headers.
 * 
 * FUTURE SUPABASE MIGRATION:
 * When migrating to Supabase (where columns might be snake_case like 'lesson_id'),
 * simply update the values (right side) in these schema objects. 
 * The keys (left side) are used throughout the Vue application.
 */

export const Schemas = {
  Subject: {
    SubjectId: 'SubjectId',
    SubjectName: 'SubjectName',
    Description: 'Description',
    UpdatedAt: 'UpdatedAt'
  },
  
  Lesson: {
    LessonId: 'LessonId',
    SubjectId: 'SubjectId',
    SubjectName: 'SubjectName',
    LessonName: 'LessonName',
    Description: 'Description',
    BlockType: 'BlockType',
    Status: 'Status',
    LearnedCount: 'LearnedCount',
    TargetCount: 'TargetCount',
    LearnInThisWeek: 'LearnInThisWeek',
    LastPracticedDate: 'LastPracticedDate',
    NextDueDate: 'NextDueDate',
    RepeatInterval: 'RepeatInterval',
    InterestLevel: 'InterestLevel',
    UpdatedAt: 'UpdatedAt',
    CreatedDate: 'CreatedDate'
  },
  
  Task: {
    LessonTaskId: 'LessonTaskId',
    LessonId: 'LessonId',
    TaskName: 'TaskName',
    Notes: 'Notes',
    Status: 'Status',
    LearnedCount: 'LearnedCount',
    TargetCount: 'TargetCount',
    Photo: 'Photo'
  },

  Progress: {
    Id: 'Id',
    Date: 'Date',
    TotalTarget: 'TotalTarget',
    TotalLearned: 'TotalLearned',
    UpdatedAt: 'UpdatedAt'
  }
};

/**
 * Transforms a raw database record into an Application Model
 * based on the provided schema.
 * 
 * @param {Object} dbRecord - The raw object from the database (e.g. from Supabase)
 * @param {Object} schema - The specific schema definition (e.g. Schemas.Lesson)
 * @returns {Object} A clean Application Model
 */
export function mapToAppModel(dbRecord, schema) {
  if (!dbRecord) return null;
  
  const appModel = {};
  for (const [appKey, dbColumn] of Object.entries(schema)) {
    if (dbRecord[dbColumn] !== undefined) {
      appModel[appKey] = dbRecord[dbColumn];
    }
  }
  
  // Optionally preserve internal offline fields that aren't mapped
  if (dbRecord._offlineQueued !== undefined) {
      appModel._offlineQueued = dbRecord._offlineQueued;
  }
  
  return appModel;
}

/**
 * Transforms an Application Model into a Database Record
 * ready for insertion or update.
 * 
 * @param {Object} appModel - The application model state
 * @param {Object} schema - The specific schema definition
 * @returns {Object} Database ready record
 */
export function mapToDbRecord(appModel, schema) {
  if (!appModel) return null;
  
  const dbRecord = {};
  for (const [appKey, dbColumn] of Object.entries(schema)) {
    if (appModel[appKey] !== undefined) {
      dbRecord[dbColumn] = appModel[appKey];
    }
  }
  return dbRecord;
}

/**
 * Utility to map an entire array of records.
 */
export function mapArrayToAppModels(dbRecordsArray, schema) {
  if (!Array.isArray(dbRecordsArray)) return [];
  return dbRecordsArray.map(record => mapToAppModel(record, schema));
}
