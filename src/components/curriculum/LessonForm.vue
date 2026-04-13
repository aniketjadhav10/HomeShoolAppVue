<template>
  <!-- Lesson Bottom Sheet / Modal -->
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 font-sans animate-fade-in"
    @click.self="close"
  >
    <div class="bg-white rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 max-w-md w-full animate-slide-up pb-24 md:pb-0">
      <!-- Mobile drag handle -->
      <div class="w-12 h-1.5 bg-slate-200 hover:bg-slate-300 transition-colors rounded-full mx-auto mt-4 mb-2 md:hidden cursor-pointer"></div>

      <div class="p-6 md:p-8 pt-2 md:pt-8">
        <h3 class="text-2xl font-black text-slate-800 mb-2">
          {{ editingLesson ? 'Edit Lesson' : 'New Lesson' }}
        </h3>
        <p v-if="subject" class="text-slate-500 text-sm mb-6 font-medium">
          in <span class="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-md">{{ subject['SubjectName'] }}</span>
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">Lesson Name</label>
            <input
              v-model="form.name"
              type="text"
              id="lessonNameInput"
              class="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Algebra Basics"
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
              placeholder="What will be covered in this lesson..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">Lesson Block</label>
            <div class="relative">
              <select
                v-model="form.blockType"
                class="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition-all cursor-pointer font-medium"
              >
                <option value="">No specific block</option>
                <option v-for="b in LESSON_BLOCKS" :key="b.id" :value="b.id">
                  {{ b.emoji }} {{ b.label }}
                </option>
              </select>
              <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>
          <div>
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative">
                <input type="checkbox" v-model="form.learnThisWeek" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors shadow-inner"></div>
                <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span class="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                Add to Weekly Plan
              </span>
            </label>
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
            {{ saving ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Save Lesson') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { lessonRepository } from '../../repositories/lessonRepository';
import { LESSON_BLOCKS } from '../../composables/useLessonStatus';

/**
 * LessonForm.vue
 *
 * Self-contained bottom-sheet modal for creating or editing a Lesson.
 * Extracted from CurriculumView.vue for single responsibility.
 *
 * Props:
 *   modelValue (Boolean)  — controls visibility (v-model)
 *   subject (Object)      — the parent subject this lesson belongs to
 *   editingLesson (Object|null) — pass a lesson to enter edit mode
 *
 * Emits:
 *   update:modelValue — to close the modal
 *   saved — emitted after a successful save
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  subject: {
    type: Object,
    default: null
  },
  editingLesson: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const form = ref({ name: '', description: '', learnThisWeek: false, blockType: '' });
const saving = ref(false);
const nameInputRef = ref(null);

// Reset or populate form when modal opens
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    if (props.editingLesson) {
      form.value = {
        name: props.editingLesson.LessonName || '',
        description: props.editingLesson.Description || '',
        learnThisWeek: props.editingLesson.LearnInThisWeek === 'TRUE' || props.editingLesson.LearnInThisWeek === true,
        blockType: props.editingLesson.BlockType || ''
      };
    } else {
      form.value = { name: '', description: '', learnThisWeek: false, blockType: '' };
    }
    await nextTick();
    nameInputRef.value?.focus();
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const save = async () => {
  if (!form.value.name.trim() || !props.subject || saving.value) return;
  saving.value = true;
  try {
    const id = props.editingLesson?.LessonId || null;
    await lessonRepository.saveLesson(
      id,
      props.subject.SubjectId,
      props.subject['SubjectName'],
      form.value.name.trim(),
      form.value.description.trim(),
      form.value.learnThisWeek,
      form.value.blockType
    );
    emit('saved');
    close();
  } finally {
    saving.value = false;
  }
};
</script>
