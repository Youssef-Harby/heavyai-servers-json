<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Feature Flags</h2>
      <button 
        @click="addFlag" 
        class="btn btn-primary text-sm flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Flag
      </button>
    </div>

    <!-- Search bar -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
      </div>
      <input 
        type="text" 
        v-model="searchQuery" 
        class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search feature flags..."
      />
    </div>

    <!-- Flag list -->
    <div class="grid gap-4">
      <div v-for="(value, key) in filteredFlags" :key="key" class="bg-white p-4 rounded-lg border shadow-sm">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-medium text-gray-900">{{ key }}</div>
            <div class="mt-1 text-sm text-gray-500">
              Type: {{ getValueType(value) }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="editFlag(key as string)" 
              class="text-blue-600 hover:text-blue-800 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              @click="removeFlag(key as string)" 
              class="text-red-600 hover:text-red-800 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Value display -->
        <div class="mt-2">
          <div v-if="typeof value === 'boolean'" class="flex items-center">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                :checked="value"
                @change="(e: Event) => updateBooleanFlag(key as string, e)"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div v-else-if="typeof value === 'number'" class="flex items-center space-x-2">
            <input 
              type="number" 
              :value="value"
              @change="(e: Event) => updateNumberFlag(key as string, e)"
              class="input w-32"
            />
          </div>
          <div v-else-if="Array.isArray(value)" class="text-sm">
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="(item, index) in value" 
                :key="index"
                class="bg-gray-100 px-2 py-1 rounded flex items-center"
              >
                {{ String(item) }}
                <button 
                  @click="() => removeArrayItem(key as string, index)"
                  class="ml-1 text-gray-500 hover:text-gray-700"
                >×</button>
              </div>
            </div>
          </div>
          <div v-else-if="key === 'dev/sql_notebook_cards'" class="text-sm">
            <button 
              @click="() => editNotebookCards(String(value))" 
              class="btn btn-secondary text-sm"
            >
              Edit Notebook Cards
            </button>
          </div>
          <div v-else class="text-sm">
            <input 
              type="text" 
              :value="String(value)"
              @change="(e: Event) => updateStringFlag(key as string, e)"
              class="input"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Flag editor modal -->
    <div v-if="showFlagModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-4 text-gray-900">
          {{ editingFlag ? 'Edit Flag' : 'Add Flag' }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-900">Flag Name</label>
            <input 
              v-model="flagName" 
              type="text" 
              class="input"
              :disabled="!!editingFlag"
              placeholder="e.g., dev/feature_name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-900">Value Type</label>
            <select 
              v-model="flagType" 
              class="input"
            >
              <option value="boolean">Boolean</option>
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="array">String Array</option>
              <option value="notebook">SQL Notebook Cards</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-900">Value</label>
            <!-- Boolean input -->
            <div v-if="flagType === 'boolean'" class="flex items-center space-x-2">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="flagValue" 
                  :value="true" 
                  class="form-radio"
                />
                <span class="ml-2 text-gray-900">True</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="flagValue" 
                  :value="false" 
                  class="form-radio"
                />
                <span class="ml-2 text-gray-900">False</span>
              </label>
            </div>
            
            <!-- Number input -->
            <input 
              v-else-if="flagType === 'number'"
              v-model.number="flagValue"
              type="number"
              class="input"
            />
            
            <!-- String input -->
            <input 
              v-else-if="flagType === 'string'"
              v-model="flagValue"
              type="text"
              class="input"
            />
            
            <!-- Array input -->
            <div v-else-if="flagType === 'array'" class="space-y-2">
              <div 
                v-for="(_, index) in Array.isArray(flagValue) ? flagValue : []" 
                :key="index"
                class="flex items-center space-x-2"
              >
                <input 
                  v-model="flagValue[index]"
                  type="text"
                  class="input flex-1"
                />
                <button 
                  @click="() => flagValue.splice(index, 1)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <button 
                @click="flagValue.push('')"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                Add Item
              </button>
            </div>
            
            <!-- Notebook cards input -->
            <div v-else-if="flagType === 'notebook'" class="space-y-2">
              <button 
                @click="editNotebookCards(flagValue || '{}')" 
                class="btn btn-secondary text-sm"
              >
                Configure Notebook Cards
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="cancelFlag" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="saveFlag" 
            class="btn btn-primary"
            :disabled="!isValidFlag"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    
    <!-- Notebook Cards Editor Modal -->
    <div v-if="showNotebookModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">SQL Notebook Cards Editor</h3>
          <button 
            @click="closeNotebookModal" 
            class="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <notebook-cards-editor 
          v-if="notebookCardsData" 
          v-model:notebook-cards="notebookCardsData" 
        />
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="closeNotebookModal" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="saveNotebookCards" 
            class="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FeatureFlags } from '@/types/config'
import NotebookCardsEditor from '@/components/notebook-cards/NotebookCardsEditor.vue'
import type { NotebookCards } from '@/types/config'

// Define props and emits
const props = defineProps<{
  featureFlags: FeatureFlags
}>()

const emit = defineEmits<{
  'update:feature-flags': [flags: FeatureFlags, flagName?: string, action?: string]
}>()

// Local copy of the flags
const localFlags = ref<FeatureFlags>({ ...props.featureFlags })

// UI state
const showFlagModal = ref(false)
const editingFlag = ref<string | null>(null)
const flagName = ref('')
const flagType = ref<'boolean' | 'number' | 'string' | 'array' | 'notebook'>('boolean')
const flagValue = ref<any>(false)
const searchQuery = ref('')

// Notebook cards modal state
const showNotebookModal = ref(false)
const notebookCardsData = ref<NotebookCards | null>(null)
const notebookCardsKey = ref<string | null>(null)

// Filter flags based on search query
const filteredFlags = computed(() => {
  if (!searchQuery.value) return localFlags.value
  
  const query = searchQuery.value.toLowerCase()
  const result: FeatureFlags = {}
  
  Object.entries(localFlags.value).forEach(([key, value]) => {
    if (key.toLowerCase().includes(query)) {
      result[key] = value
    }
  })
  
  return result
})

// Update local flags when props change
watch(() => props.featureFlags, (newFlags) => {
  localFlags.value = { ...newFlags }
}, { deep: true })

// Computed property to validate flag input
const isValidFlag = computed(() => {
  if (!flagName.value) return false
  
  switch (flagType.value) {
    case 'boolean':
      return typeof flagValue.value === 'boolean'
    case 'number':
      return !isNaN(flagValue.value)
    case 'string':
      return typeof flagValue.value === 'string'
    case 'array':
      return Array.isArray(flagValue.value) && flagValue.value.every((item: any) => typeof item === 'string')
    case 'notebook':
      return true // We'll validate this separately
    default:
      return false
  }
})

// Get the type of a value for display
const getValueType = (value: any): string => {
  if (Array.isArray(value)) return 'String Array'
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    try {
      JSON.parse(value)
      return 'JSON'
    } catch (e) {
      // Not valid JSON
    }
  }
  return typeof value
}

// Add a new flag
const addFlag = () => {
  editingFlag.value = null
  flagName.value = ''
  flagType.value = 'boolean'
  flagValue.value = false
  showFlagModal.value = true
}

// Edit an existing flag
const editFlag = (key: string) => {
  const value = localFlags.value[key]
  editingFlag.value = key
  flagName.value = key
  
  try {
    if (key === 'dev/sql_notebook_cards') {
      flagType.value = 'notebook'
      flagValue.value = typeof value === 'string' ? JSON.parse(value) : value
    } else if (typeof value === 'boolean') {
      flagType.value = 'boolean'
      flagValue.value = value
    } else if (typeof value === 'number') {
      flagType.value = 'number'
      flagValue.value = value
    } else if (Array.isArray(value)) {
      flagType.value = 'array'
      flagValue.value = value
    } else {
      flagType.value = 'string'
      flagValue.value = String(value)
    }
  } catch (error) {
    console.error(`Error parsing flag value for ${key}:`, error)
    flagType.value = 'string'
    flagValue.value = String(value)
  }
  
  showFlagModal.value = true
}

// Remove a flag
const removeFlag = (key: string) => {
  const newFlags = { ...localFlags.value }
  delete newFlags[key]
  localFlags.value = newFlags
  emitUpdate()
}

// Save flag changes
const saveFlag = () => {
  const newFlags = { ...localFlags.value }
  const key = editingFlag.value || flagName.value
  
  if (flagType.value === 'notebook' && typeof flagValue.value === 'object') {
    // Convert notebook cards to JSON string
    newFlags[key] = JSON.stringify(flagValue.value)
  } else {
    newFlags[key] = flagValue.value
  }
  
  localFlags.value = newFlags
  showFlagModal.value = false
  emitUpdate()
}

// Cancel flag editing
const cancelFlag = () => {
  showFlagModal.value = false
}

// Update handlers for different value types
const updateBooleanFlag = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  localFlags.value[key] = target.checked
  emitUpdate(key, target.checked ? 'enabled' : 'disabled')
}

const updateNumberFlag = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  localFlags.value[key] = Number(target.value)
  emitUpdate(key, 'updated')
}

const updateStringFlag = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  localFlags.value[key] = String(target.value)
  emitUpdate(key, 'updated')
}

const removeArrayItem = (key: string, index: number) => {
  if (Array.isArray(localFlags.value[key])) {
    const newArray = [...localFlags.value[key]]
    newArray.splice(index, 1)
    localFlags.value[key] = newArray
    emitUpdate(key, 'updated')
  }
}

// Helper function to emit update with specific flag info
const emitUpdate = (flagKey?: string, action?: string) => {
  if (flagKey) {
    // If we have specific flag info, include it in the event
    emit('update:feature-flags', { ...localFlags.value }, flagKey, action)
  } else if (editingFlag.value) {
    // If we're editing an existing flag, include the flag name in the event
    emit('update:feature-flags', { ...localFlags.value }, editingFlag.value as string)
  } else {
    // Otherwise, just emit the updated flags
    emit('update:feature-flags', { ...localFlags.value })
  }
}

// Notebook cards editing
const editNotebookCards = (value: string | object) => {
  try {
    // If it's a string, parse it as JSON
    if (typeof value === 'string') {
      notebookCardsData.value = JSON.parse(value)
    } else {
      notebookCardsData.value = value as NotebookCards
    }
    
    if (editingFlag.value) {
      notebookCardsKey.value = editingFlag.value
    } else {
      notebookCardsKey.value = flagName.value
    }
    
    showNotebookModal.value = true
  } catch (error) {
    console.error('Failed to parse notebook cards data:', error)
    notebookCardsData.value = {}
    showNotebookModal.value = true
  }
}

const closeNotebookModal = () => {
  showNotebookModal.value = false
}

const saveNotebookCards = () => {
  if (notebookCardsKey.value && notebookCardsData.value) {
    if (showFlagModal.value) {
      // We're in the flag editor modal
      flagValue.value = notebookCardsData.value
    } else {
      // Direct edit from the feature flags list
      localFlags.value[notebookCardsKey.value] = JSON.stringify(notebookCardsData.value)
      emitUpdate(notebookCardsKey.value, 'updated')
    }
  }
  
  showNotebookModal.value = false
}
</script>
