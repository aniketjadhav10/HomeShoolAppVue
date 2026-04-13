<template>
  <!-- Task Creator Dialog -->
  <transition name="pop">
    <div v-if="modelValue" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>
      <div class="bg-white rounded-[2rem] shadow-2xl relative w-full max-w-lg overflow-hidden flex flex-col pointer-events-auto border border-slate-200">
        <div class="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 class="font-black text-slate-800 text-xl flex items-center gap-2">
            <i class="fa-solid fa-list-check text-blue-600"></i> Add New Task
          </h3>
          <button
            @click.prevent="close"
            type="button"
            class="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center active:scale-90 transition-all"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form @submit.prevent="save" class="p-5 md:p-6 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">TaskName</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Read Chapter 1..."
              required
              ref="nameInputRef"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Target</label>
              <input
                v-model.number="form.targetCount"
                type="number"
                min="1"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold"
              />
            </div>
            <div class="flex flex-col justify-end">
              <p class="text-[10px] text-slate-400 font-medium pb-2 italic leading-tight">Sessions needed to complete this task.</p>
            </div>
          </div>
          <div>
            <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Notes (Optional)</label>
            <textarea
              v-model="form.notes"
              placeholder="Materials or hints..."
              rows="2"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-bold resize-none"
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="saving || !form.name.trim()"
            class="bg-blue-600 hover:bg-blue-500 text-white mt-2 px-6 py-4 rounded-xl font-black text-base shadow-lg shadow-blue-500/30 transition-all outline-none disabled:opacity-50 w-full flex items-center justify-center active:scale-95 gap-2"
          >
            <i v-if="saving" class="fa-solid fa-arrows-rotate animate-spin"></i>
            <i v-else class="fa-solid fa-plus"></i>
            {{ saving ? 'Creating...' : 'Create Task' }}
          </button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { taskRepository } from '../../repositories/taskRepository';

/**
 * TaskForm.vue
 *
 * Self-contained dialog for creating a new task within a lesson.
 * Extracted from LessonDetailView.vue for single responsibility.
 *
 * Props:
 *   modelValue (Boolean) — controls visibility (v-model)
 *   lesson (Object)      — the parent lesson this task belongs to
 *
 * Emits:
 *   update:modelValue — to close the dialog
 *   saved             — emitted after a task is successfully created
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  lesson: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const form = ref({ name: '', notes: '', targetCount: 1 });
const saving = ref(false);
const nameInputRef = ref(null);

// Reset form and focus input when dialog opens
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    form.value = { name: '', notes: '', targetCount: 1 };
    await nextTick();
    nameInputRef.value?.focus();
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const save = async () => {
  if (!form.value.name.trim() || !props.lesson || saving.value) return;
  saving.value = true;
  try {
    await taskRepository.saveTask(
      null,
      props.lesson.LessonId,
      form.value.name.trim(),
      form.value.notes.trim(),
      form.value.targetCount
    );
    emit('saved');
    close();
  } finally {
    saving.value = false;
  }
};
</script>
