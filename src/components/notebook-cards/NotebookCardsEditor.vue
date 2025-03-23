<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">SQL Notebook Cards</h2>
      <div class="flex items-center space-x-2">
        <button 
          @click="addDatabase" 
          class="btn btn-primary text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Database
        </button>
      </div>
    </div>
    
    <p class="text-sm text-gray-500 dark:text-gray-400 italic">
      Note: Notebook cards are stored as a single-line JSON string in the configuration.
    </p>
    
    <!-- Database selector -->
    <div v-if="Object.keys(localCards).length > 0" class="border-b border-gray-200 mb-4">
      <div class="flex space-x-2 overflow-x-auto">
        <button
          v-for="db in Object.keys(localCards)"
          :key="db"
          @click="activeDatabase = db"
          class="px-4 py-2 whitespace-nowrap font-medium text-sm flex items-center"
          :class="[
            activeDatabase === db 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ db }}
          <div class="ml-2 flex items-center" v-if="activeDatabase === db">
            <button @click.stop="editDatabaseName(db)" class="text-gray-500 hover:text-blue-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click.stop="removeDatabase(db)" class="text-gray-500 hover:text-red-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </button>
      </div>
    </div>
    
    <!-- No databases yet -->
    <div v-if="Object.keys(localCards).length === 0" class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
      <p class="text-gray-600 dark:text-gray-300">No databases configured yet.</p>
      <button @click="addDatabase" class="mt-3 btn btn-primary text-sm">
        Add Your First Database
      </button>
    </div>
    
    <!-- Active database cards -->
    <div v-else-if="activeDatabase && localCards[activeDatabase]" class="space-y-4">
      <div
        v-for="(card, index) in localCards[activeDatabase]"
        :key="index"
        class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm"
        draggable="true"
        @dragstart="dragStart(index, $event)"
        @dragover.prevent
        @dragenter.prevent="dragEnter(index, $event)"
        @dragleave="dragLeave($event)"
        @drop="drop(index, $event)"
        @dragend="dragEnd()"
      >
        <div class="flex justify-between mb-3">
          <h3 class="font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400 cursor-move drag-handle" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            Card {{ index + 1 }}
          </h3>
          <button 
            @click="removeCard(index)" 
            class="text-red-500 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="mb-3">
          <label class="block text-sm font-medium mb-1">Question Text</label>
          <textarea
            v-model="card.text"
            rows="3"
            class="input"
            placeholder="Enter question text..."
            @input="emitUpdate"
          ></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Data Sources</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <div
              v-for="source in card.dataSources"
              :key="source"
              class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-md text-sm flex items-center"
            >
              {{ source }}
              <button 
                @click="removeDataSource(card, source)" 
                class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="relative">
              <input
                v-model="cardDataSources[index]"
                @keydown.enter.prevent="addDataSource(card, index)"
                placeholder="Add source..."
                class="border px-2 py-1 rounded text-sm w-32"
              />
              <button 
                @click="addDataSource(card, index)" 
                class="absolute inset-y-0 right-0 px-2 text-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        @click="addCard" 
        class="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Question Card
      </button>
    </div>
    
    <!-- Database management modal -->
    <div v-if="showDatabaseModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-4">
          {{ editingDatabase ? 'Edit Database' : 'Add Database' }}
        </h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Database Name</label>
          <input 
            v-model="newDatabaseName" 
            type="text" 
            class="input"
            placeholder="e.g., heavyai, mda"
          />
          <p v-if="databaseError" class="mt-1 text-sm text-red-600">
            {{ databaseError }}
          </p>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDatabaseModal" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmDatabase" 
            class="btn btn-primary"
            :disabled="!newDatabaseName"
          >
            {{ editingDatabase ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete confirmation modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-4">Delete Database Confirmation</h3>
        
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to delete the database {{ databaseToDelete }}?
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDeleteDatabase" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmDeleteDatabase" 
            class="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NotebookCards, NotebookCard } from '@/types/config'

// Define props and emits
const props = defineProps<{
  notebookCards: NotebookCards
}>()

const emit = defineEmits<{
  'update:notebook-cards': [cards: NotebookCards]
}>()

// Local copy of the cards that we'll modify
const localCards = ref<NotebookCards>(JSON.parse(JSON.stringify(props.notebookCards || {})))

// UI state
const activeDatabase = ref<string>('')
const cardDataSources = ref<string[]>([])
localCards.value[activeDatabase.value]?.forEach(() => {
  cardDataSources.value.push('')
})
const showDatabaseModal = ref(false)
const newDatabaseName = ref('')
const editingDatabase = ref(false)
const databaseError = ref('')
const showDeleteConfirmation = ref(false)
const databaseToDelete = ref('')
const draggedCardIndex = ref<number | null>(null)

// Set active database to first one if available
watch(() => Object.keys(localCards.value), (keys) => {
  if (keys.length > 0 && !activeDatabase.value) {
    activeDatabase.value = keys[0]
  }
}, { immediate: true })

// Update local cards when props change
watch(() => props.notebookCards, (newCards) => {
  localCards.value = JSON.parse(JSON.stringify(newCards || {}))
  cardDataSources.value = []
  localCards.value[activeDatabase.value]?.forEach(() => {
    cardDataSources.value.push('')
  })
}, { deep: true })

// Watch for active database changes to update card data sources
watch(() => activeDatabase.value, (newDb) => {
  if (newDb) {
    cardDataSources.value = []
    localCards.value[newDb]?.forEach(() => {
      cardDataSources.value.push('')
    })
  }
})

// Add a new database
const addDatabase = () => {
  showDatabaseModal.value = true
  editingDatabase.value = false
  newDatabaseName.value = ''
  databaseError.value = ''
}

// Confirm database addition/edit
const confirmDatabase = () => {
  if (!newDatabaseName.value.trim()) {
    databaseError.value = 'Database name cannot be empty'
    return
  }
  
  if (!editingDatabase.value && localCards.value[newDatabaseName.value]) {
    databaseError.value = 'Database with this name already exists'
    return
  }
  
  // If editing, we need to create a new object with renamed key
  if (editingDatabase.value && activeDatabase.value !== newDatabaseName.value) {
    const updatedCards: NotebookCards = {}
    
    // Copy all databases except the one being edited
    Object.entries(localCards.value).forEach(([key, value]) => {
      if (key !== activeDatabase.value) {
        updatedCards[key] = value
      }
    })
    
    // Add the renamed database
    updatedCards[newDatabaseName.value] = localCards.value[activeDatabase.value]
    
    // Update local state
    localCards.value = updatedCards
    activeDatabase.value = newDatabaseName.value
  } else if (!editingDatabase.value) {
    // Add new empty database
    localCards.value[newDatabaseName.value] = []
    activeDatabase.value = newDatabaseName.value
  }
  
  // Emit update
  emitUpdate()
  
  // Close modal
  showDatabaseModal.value = false
}

// Cancel database modal
const cancelDatabaseModal = () => {
  showDatabaseModal.value = false
}

// Add a new card to the active database
const addCard = () => {
  if (!activeDatabase.value) return
  
  const newCard: NotebookCard = {
    text: '',
    dataSources: []
  }
  
  localCards.value[activeDatabase.value].push(newCard)
  cardDataSources.value.push('')
  emitUpdate()
}

// Remove a card from the active database
const removeCard = (index: number) => {
  if (!activeDatabase.value) return
  
  localCards.value[activeDatabase.value].splice(index, 1)
  cardDataSources.value.splice(index, 1)
  emitUpdate()
}

// Add a data source to a card
const addDataSource = (card: NotebookCard, index: number) => {
  if (!cardDataSources.value[index].trim()) return
  
  if (!card.dataSources.includes(cardDataSources.value[index])) {
    card.dataSources.push(cardDataSources.value[index])
    cardDataSources.value[index] = ''
    emitUpdate()
  }
}

// Remove a data source from a card
const removeDataSource = (card: NotebookCard, source: string) => {
  const index = card.dataSources.indexOf(source)
  if (index !== -1) {
    card.dataSources.splice(index, 1)
    emitUpdate()
  }
}

// Edit database name
const editDatabaseName = (db: string) => {
  showDatabaseModal.value = true
  editingDatabase.value = true
  newDatabaseName.value = db
  databaseError.value = ''
}

// Remove database
const removeDatabase = (db: string) => {
  databaseToDelete.value = db
  showDeleteConfirmation.value = true
}

// Cancel delete database
const cancelDeleteDatabase = () => {
  showDeleteConfirmation.value = false
}

// Confirm delete database
const confirmDeleteDatabase = () => {
  delete localCards.value[databaseToDelete.value]
  if (activeDatabase.value === databaseToDelete.value) {
    activeDatabase.value = Object.keys(localCards.value)[0] || ''
  }
  emitUpdate()
  showDeleteConfirmation.value = false
}

// Emit update event
const emitUpdate = () => {
  emit('update:notebook-cards', JSON.parse(JSON.stringify(localCards.value)))
}

// Drag and drop functionality
const dragStart = (index: number, event: DragEvent) => {
  draggedCardIndex.value = index
  event.dataTransfer?.setData('text', '')
}

const dragEnter = (index: number, event: DragEvent) => {
  event.preventDefault()
  if (draggedCardIndex.value !== null && draggedCardIndex.value !== index) {
    // Add visual feedback for drop target
    const target = event.currentTarget as HTMLElement
    target.classList.add('bg-blue-50', 'dark:bg-blue-900/20')
  }
}

const dragLeave = (event: DragEvent) => {
  event.preventDefault()
  // Remove visual feedback
  const target = event.currentTarget as HTMLElement
  target.classList.remove('bg-blue-50', 'dark:bg-blue-900/20')
}

const drop = (index: number, event: DragEvent) => {
  event.preventDefault()
  if (draggedCardIndex.value !== null && draggedCardIndex.value !== index) {
    const cards = localCards.value[activeDatabase.value]
    const draggedCard = cards.splice(draggedCardIndex.value, 1)[0]
    cards.splice(index, 0, draggedCard)
    cardDataSources.value.splice(index, 0, cardDataSources.value.splice(draggedCardIndex.value, 1)[0])
    emitUpdate()
  }
  draggedCardIndex.value = null
}

const dragEnd = () => {
  draggedCardIndex.value = null
}
</script>
