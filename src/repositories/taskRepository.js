import { dataStore, dispatchAction } from '../stores/dataStore';

/**
 * taskRepository.js
 */
export const taskRepository = {
  getTasks() {
    return dataStore.state.tasks || [];
  },

  getTasksByLesson(lessonId) {
    return (dataStore.state.tasks || []).filter(t => t.LessonId === lessonId);
  },

  async saveTask(id, lessonId, lessonName, notes, targetCount) {
    console.log(`[Repo] saveTask called. ID: ${id || 'NEW'}, Lesson: ${lessonName}`);
    return await dispatchAction('saveLessonTask', id, lessonId, lessonName, notes, targetCount);
  },

  async updateTask(id, lessonId, lessonName, status, learnedCount, targetCount, photo, blockType) {
    console.log(`[Repo] updateTask called. ID: ${id}, Status: ${status}, Count: ${learnedCount}/${targetCount}, Block: ${blockType ?? '-'}`);
    return await dispatchAction('updateTask', id, lessonId, lessonName, status, learnedCount, targetCount, photo, blockType);
  },

  async setTaskBlock(task, blockId) {
    // Toggle off if same block is clicked again
    const newBlock = task.BlockType === blockId ? '' : blockId;
    console.log(`[Repo] setTaskBlock. ID: ${task.LessonTaskId}, Block: ${newBlock || 'CLEARED'}`);
    task.BlockType = newBlock; // optimistic local update
    return await dispatchAction('updateTask',
      task.LessonTaskId, task.LessonId, task.TaskName,
      task.Status, task.LearnedCount, task.TargetCount,
      task.Photo, newBlock
    );
  },

  async uploadTaskPhoto(file) {
    console.log(`[Repo] uploadTaskPhoto processing file: ${file.name}`);
    
    // 1. Compress the image before sending to GAS (Max 1MB for speed/safety)
    const compressedBase64 = await this.compressImage_(file);
    
    // 2. Dispatch to GAS DriveService
    // We return the result which contains the thumbnailUrl
    return await dispatchAction('uploadFileToDrive', compressedBase64, file.name);
  },

  async compressImage_(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  },

  async deleteTask(id) {
    console.log(`[Repo] deleteTask called. ID: ${id}`);
    return await dispatchAction('deleteLessonTask', id);
  },

  async generateTasksWithAi(lessonId, lessonName, childAge) {
    console.log(`[Repo] generateTasksWithAi called for: ${lessonName}`);
    return await dispatchAction('generateLessonTasksWithGemini', lessonId, lessonName, childAge);
  }
};
