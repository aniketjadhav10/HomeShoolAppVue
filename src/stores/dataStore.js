import { reactive } from 'vue';
import { callApi } from '../api';

export const dataStore = reactive({
  state: {
    subjects: [], lessons: [], tasks: [], progress: [],
    improvements: [], resources: [], schedule: [],
    attendance: [], timeLogs: [], assessments: [], portfolio: []
  },
  loading: true,
  saving: false,
  error: null,
});

export const loadData = async () => {
  dataStore.loading = true;
  dataStore.error = null;
  try {
    const data = await callApi('getHomeschoolData');
    dataStore.state = { ...dataStore.state, ...data };
  } catch(e) {
    dataStore.error = e.message;
    console.error("Load Error:", e);
  } finally {
    dataStore.loading = false;
  }
};

export const dispatchAction = async (action, ...args) => {
  dataStore.saving = true;
  dataStore.error = null;
  try {
    const freshData = await callApi(action, ...args);
    if(freshData && freshData.subjects) {
      // Assuming most edit actions return getHomeschoolData()
      dataStore.state = { ...dataStore.state, ...freshData };
    }
    return freshData;
  } catch (e) {
    dataStore.error = e.message;
    console.error(`Action ${action} Error:`, e);
    return null;
  } finally {
    dataStore.saving = false;
  }
};
