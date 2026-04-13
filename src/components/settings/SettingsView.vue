<template>
  <section class="space-y-6 md:space-y-8 animate-slide-up pb-6">

    <!-- Page Header -->
    <header class="hidden md:block">
      <h2 class="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Settings</h2>
      <p class="text-slate-500 mt-2 font-medium text-lg">Customize your homeschool experience.</p>
    </header>

    <!-- Save Success Toast -->
    <transition name="slide-down">
      <div v-if="saveSuccess" class="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3 text-sm">
        <i class="fa-solid fa-check-circle text-lg"></i> Settings saved successfully!
      </div>
    </transition>

    <!-- Student Profile Settings -->
    <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
      <div class="p-5 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
          <i class="fa-solid fa-user-graduate text-blue-500 text-lg"></i>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800">Student Profile</h3>
          <p class="text-xs text-slate-400 font-medium">Used for AI-powered lesson planning.</p>
        </div>
      </div>
      <div class="p-5 md:p-6 space-y-5">
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-2">Child's Name</label>
          <input
            v-model="form.childName"
            type="text"
            placeholder="e.g. Yug"
            class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-2">Child's Age</label>
          <p class="text-xs text-slate-400 mb-2 font-medium">This is sent to the Gemini AI when generating lesson tasks.</p>
          <input
            v-model="form.childAge"
            type="number"
            min="1"
            max="25"
            placeholder="e.g. 10"
            class="w-full md:w-40 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>
    </div>

    <!-- Curriculum Settings -->
    <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
      <div class="p-5 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
          <i class="fa-solid fa-book-open text-purple-500 text-lg"></i>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800">Curriculum</h3>
          <p class="text-xs text-slate-400 font-medium">Manage how your week and content are structured.</p>
        </div>
      </div>
      <div class="p-5 md:p-6 space-y-5">
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-2">Week Start Day</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="day in ['MONDAY', 'SUNDAY']"
              :key="day"
              @click="form.weekStartDay = day"
              :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all border active:scale-95', form.weekStartDay === day ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300']"
            >
              {{ day.charAt(0) + day.slice(1).toLowerCase() }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-2">Lesson Document ID</label>
          <p class="text-xs text-slate-400 mb-2 font-medium">The Google Doc ID that contains your lesson content (readable from the Lesson Detail view).</p>
          <input
            v-model="form.lessonDocId"
            type="text"
            placeholder="Paste your Google Doc ID here..."
            class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-mono text-sm"
          />
        </div>
      </div>
    </div>

    <!-- App Info -->
    <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
      <div class="p-5 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="p-2.5 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl">
          <i class="fa-solid fa-circle-info text-slate-500 text-lg"></i>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800">About</h3>
          <p class="text-xs text-slate-400 font-medium">App information and version.</p>
        </div>
      </div>
      <div class="p-5 md:p-6 space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="font-bold text-slate-600">App Name</span>
          <span class="text-slate-500 font-medium">Yug Homeschool</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="font-bold text-slate-600">Version</span>
          <span class="text-slate-500 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">v1.0.0</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="font-bold text-slate-600">Backend</span>
          <span class="text-slate-500 font-medium">Google Apps Script</span>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-2">
      <button
        @click="saveSettings"
        :disabled="saving"
        class="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-base"
      >
        <i v-if="saving" class="fa-solid fa-arrows-rotate animate-spin"></i>
        <i v-else class="fa-solid fa-floppy-disk"></i>
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { settingsRepository } from '../../repositories/settingsRepository';

/**
 * SettingsView.vue
 *
 * A dedicated settings page for the app. Previously, the Settings tab
 * showed a placeholder "Backend Node" message. This replaces it with
 * a functional settings form.
 *
 * Settings managed:
 *   - childName  : Student's name (for display)
 *   - childAge   : Used by Gemini AI for task generation
 *   - weekStartDay: Monday or Sunday
 *   - lessonDocId : The Google Doc linked to lesson content
 */

const form = ref({
  childName: '',
  childAge: '',
  weekStartDay: 'MONDAY',
  lessonDocId: ''
});

const saving = ref(false);
const saveSuccess = ref(false);

onMounted(() => {
  const settings = settingsRepository.getSettings();
  form.value = {
    childName: settings.childName || 'Yug',
    childAge: settings.childAge || '',
    weekStartDay: settings.weekStartDay || 'MONDAY',
    lessonDocId: settings.lessonDocId || ''
  };
});

const saveSettings = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await settingsRepository.saveSettings({
      childName: form.value.childName.trim(),
      childAge: form.value.childAge,
      weekStartDay: form.value.weekStartDay,
      lessonDocId: form.value.lessonDocId.trim()
    });
    saveSuccess.value = true;
    setTimeout(() => { saveSuccess.value = false; }, 3000);
  } finally {
    saving.value = false;
  }
};
</script>
