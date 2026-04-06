import { ref } from 'vue';

// IMPORTANT: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrmGSQHclLHRtmh1p4m0oMutpxsgBYEw98DG0M-45WYIkWA6Xcf-ko10fih5M-INe6/exec';

export const callApi = async (action, ...args) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('YOUR_SCRIPT_URL_HERE')) {
    throw new Error('Please configure SCRIPT_URL in src/api.js!');
  }

  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({ action, args })
  });

  const result = await response.json();
  if (result.status === 'success') {
    return result.data;
  } else {
    throw new Error(result.message);
  }
};
