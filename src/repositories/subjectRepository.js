import { dataStore, dispatchAction } from '../stores/dataStore';

/**
 * subjectRepository.js
 */
export const subjectRepository = {
  getSubjects() {
    return dataStore.state.subjects || [];
  },

  getSubjectById(id) {
    return (dataStore.state.subjects || []).find(s => s.SubjectId === id);
  },

  async saveSubject(id, name, description) {
    console.log(`[Repo] saveSubject called. ID: ${id || 'NEW'}, Name: ${name}`);
    return await dispatchAction('saveSubject', id, name, description);
  },

  async deleteSubject(id) {
    console.log(`[Repo] deleteSubject called. ID: ${id}`);
    return await dispatchAction('deleteSubject', id);
  }
};
