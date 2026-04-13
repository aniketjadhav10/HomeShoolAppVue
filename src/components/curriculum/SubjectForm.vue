<template>
  <!-- Subject Bottom Sheet / Modal -->
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 font-sans animate-fade-in"
    @click.self="close"
  >
    <!-- Bottom Sheet Container -->
    <div class="bg-white rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 max-w-md w-full animate-slide-up pb-24 md:pb-0">
      <!-- Mobile drag handle -->
      <div class="w-12 h-1.5 bg-slate-200 hover:bg-slate-300 transition-colors rounded-full mx-auto mt-4 mb-2 md:hidden cursor-pointer"></div>

      <div class="p-6 md:p-8 pt-2 md:pt-8">
        <h3 class="text-2xl font-black text-slate-800 mb-6">
          {{ editingSubject ? 'Edit Subject' : 'New Subject' }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">Subject Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Mathematics"
              @keyup.enter="save"
              ref="nameInputRef"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">
              Description <span class="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              v-model="form.description"
              class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all resize-none placeholder:text-slate-400"
              rows="3"
              placeholder="Brief description of what you'll study..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="close" class="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors hidden md:block">
            Cancel
          </button>
          <button
            @click="save"
            class="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 md:py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!form.name.trim() || saving"
          >
            <i v-if="saving" class="fa-solid fa-arrows-rotate animate-spin mr-2"></i>
            {{ saving ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Save Subject') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { subjectRepository } from '../../repositories/subjectRepository';

/**
 * SubjectForm.vue
 *
 * Self-contained bottom-sheet modal for creating or editing a Subject.
 * Extracted from CurriculumView.vue for single responsibility.
 *
 * Props:
 *   modelValue (Boolean) — controls visibility (v-model)
 *   editingSubject (Object|null) — pass a subject object to enter edit mode
 *
 * Emits:
 *   update:modelValue — to close the modal
 *   saved — emitted after a successful save, with the new/updated subject name
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editingSubject: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const form = ref({ name: '', description: '' });
const saving = ref(false);
const nameInputRef = ref(null);

// Reset or populate form when modal opens
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    if (props.editingSubject) {
      form.value = {
        name: props.editingSubject.SubjectName || '',
        description: props.editingSubject.Description || ''
      };
    } else {
      form.value = { name: '', description: '' };
    }
    // Auto-focus the input after the DOM updates
    await nextTick();
    nameInputRef.value?.focus();
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const save = async () => {
  if (!form.value.name.trim() || saving.value) return;
  saving.value = true;
  try {
    const id = props.editingSubject?.SubjectId || null;
    await subjectRepository.saveSubject(id, form.value.name.trim(), form.value.description.trim());
    emit('saved', form.value.name.trim());
    close();
  } finally {
    saving.value = false;
  }
};
</script>
