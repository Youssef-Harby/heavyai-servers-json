<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Edit History</h2>
      <button 
        @click="clearHistory" 
        class="btn btn-danger text-sm flex items-center"
        v-if="history.length > 0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Clear History
      </button>
    </div>

    <div v-if="history.length === 0" class="text-center py-8 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>No history entries yet. Changes to your configuration will be saved automatically.</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="(entry, index) in history" 
        :key="index"
        class="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="font-medium text-gray-900">{{ entry.description }}</div>
            <div class="text-sm text-gray-500">
              {{ formatDate(entry.timestamp) }}
            </div>
          </div>
          <button 
            @click="restoreVersion(index)" 
            class="btn btn-primary text-sm"
          >
            Restore
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-4 text-gray-900">Confirm Action</h3>
        
        <p class="mb-6 text-gray-700">{{ confirmMessage }}</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showConfirmModal = false" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmAction" 
            class="btn btn-primary"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config'

const configStore = useConfigStore()

// Get history from store
const history = computed(() => configStore.history)

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmCallback = ref<() => void>(() => {})

// Format timestamp to readable date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).format(date)
}

// Restore a version from history
const restoreVersion = (index: number) => {
  confirmMessage.value = 'Are you sure you want to restore this version? Your current changes will be saved to history before restoring.'
  confirmCallback.value = () => {
    configStore.restoreFromHistory(index)
    showConfirmModal.value = false
  }
  showConfirmModal.value = true
}

// Clear all history
const clearHistory = () => {
  confirmMessage.value = 'Are you sure you want to clear all history? This action cannot be undone.'
  confirmCallback.value = () => {
    configStore.clearHistory()
    showConfirmModal.value = false
  }
  showConfirmModal.value = true
}

// Execute the confirmed action
const confirmAction = () => {
  confirmCallback.value()
}
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.btn-primary {
  background-color: rgb(37, 99, 235);
  color: white;
}

.btn-primary:hover {
  background-color: rgb(29, 78, 216);
}

.btn-secondary {
  background-color: rgb(229, 231, 235);
  color: rgb(31, 41, 55);
}

.btn-secondary:hover {
  background-color: rgb(209, 213, 219);
}

.btn-danger {
  background-color: rgb(220, 38, 38);
  color: white;
}

.btn-danger:hover {
  background-color: rgb(185, 28, 28);
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-width: 1px;
  border-color: rgb(209, 213, 219);
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.input:focus {
  outline: none;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  --tw-ring-color: rgb(59, 130, 246);
  border-color: rgb(59, 130, 246);
}
</style>
