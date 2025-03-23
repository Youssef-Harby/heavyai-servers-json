<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Mapbox Custom Styles</h2>
      <button 
        @click="addStyle" 
        class="btn btn-primary text-sm flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Style
      </button>
    </div>
    
    <p class="text-sm text-gray-500 dark:text-gray-400 italic">
      Supports both URL-based styles and full JSON style objects.
    </p>
    
    <!-- Styles list -->
    <div class="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div v-if="localStyles.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>No custom styles added yet.</p>
      </div>
      
      <div v-else class="divide-y dark:divide-gray-700">
        <div 
          v-for="(style, index) in localStyles" 
          :key="index"
          class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-medium">{{ style.label }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ isStyleUrl(style.value) ? 'URL Style' : 'JSON Style' }}
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                @click="editStyle(index)" 
                class="text-blue-600 hover:text-blue-800 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                @click="removeStyle(index)" 
                class="text-red-600 hover:text-red-800 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="mt-2 text-sm">
            <div v-if="isStyleUrl(style.value)" class="text-gray-600 dark:text-gray-300 font-mono break-all">
              {{ style.value }}
            </div>
            <div v-else class="text-gray-600 dark:text-gray-300">
              <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <span class="font-mono">JSON style object</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Style editor modal -->
    <div v-if="showStyleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-medium">
            {{ editingStyleIndex !== null ? 'Edit Style' : 'Add Style' }}
          </h3>
          <button @click="cancelStyleModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Style Name</label>
            <input 
              v-model="editingStyle.label" 
              type="text" 
              class="input" 
              placeholder="e.g., Google Maps Satellite"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Style Type</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="styleType" 
                  value="url" 
                  class="form-radio"
                />
                <span class="ml-2">Remote URL</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="styleType" 
                  value="json" 
                  class="form-radio"
                />
                <span class="ml-2">JSON Style Object</span>
              </label>
            </div>
          </div>
          
          <!-- URL input -->
          <div v-if="styleType === 'url'" class="mb-6">
            <label class="block text-sm font-medium mb-1">Style URL</label>
            <input 
              v-model="styleUrl" 
              type="text" 
              class="input" 
              placeholder="https://example.com/style.json"
            />
            <p class="mt-1 text-xs text-gray-500">
              Enter the full URL to the Mapbox style JSON file.
            </p>
          </div>
          
          <!-- JSON editor -->
          <div v-else class="mb-6">
            <label class="block text-sm font-medium mb-1">Style JSON</label>
            <div class="border dark:border-gray-700 rounded-lg overflow-hidden" style="height: 400px;">
              <JsonViewer
                v-model:value="styleJsonText"
                :read-only="false"
              />
            </div>
            <div v-if="jsonError" class="mt-1 text-sm text-red-600">
              {{ jsonError }}
            </div>
            <div class="mt-2">
              <button 
                @click="formatJson" 
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                Format JSON
              </button>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <button 
              @click="cancelStyleModal" 
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              @click="saveStyle" 
              class="btn btn-primary"
              :disabled="!isFormValid"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MapboxCustomStyle, MapboxStyleValue } from '@/types/config'
import JsonViewer from '@/components/common/JsonViewer.vue'

// Define props and emits
const props = defineProps<{
  mapboxStyles: MapboxCustomStyle[]
}>()

const emit = defineEmits<{
  'update:mapbox-styles': [styles: MapboxCustomStyle[]]
}>()

// Local copy of the styles that we'll modify
const localStyles = ref<MapboxCustomStyle[]>(JSON.parse(JSON.stringify(props.mapboxStyles || [])))

// UI state
const showStyleModal = ref(false)
const editingStyleIndex = ref<number | null>(null)
const editingStyle = ref<MapboxCustomStyle>({ label: '', value: '' })
const styleType = ref<'url' | 'json'>('url')
const styleUrl = ref('')
const styleJsonText = ref('')
const jsonError = ref('')

// Computed property to determine if form is valid
const isFormValid = computed(() => {
  if (!editingStyle.value.label) return false
  
  if (styleType.value === 'url') {
    return !!styleUrl.value && isValidUrl(styleUrl.value)
  } else {
    try {
      // Make sure JSON is valid
      JSON.parse(styleJsonText.value)
      return !!styleJsonText.value
    } catch (e) {
      return false
    }
  }
})

// Update local styles when props change
watch(() => props.mapboxStyles, (newStyles) => {
  localStyles.value = JSON.parse(JSON.stringify(newStyles || []))
}, { deep: true })

// Helper to determine if a style value is a URL
const isStyleUrl = (value: string | MapboxStyleValue): boolean => {
  return typeof value === 'string' && isValidUrl(value)
}

// Validate if a string is a URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Add a new style
const addStyle = () => {
  editingStyleIndex.value = null
  editingStyle.value = { label: '', value: '' }
  styleType.value = 'url'
  styleUrl.value = ''
  styleJsonText.value = ''
  jsonError.value = ''
  showStyleModal.value = true
}

// Edit an existing style
const editStyle = (index: number) => {
  const style = localStyles.value[index]
  editingStyleIndex.value = index
  editingStyle.value = { ...style }
  
  if (isStyleUrl(style.value)) {
    styleType.value = 'url'
    styleUrl.value = style.value as string
    styleJsonText.value = ''
  } else {
    styleType.value = 'json'
    styleUrl.value = ''
    styleJsonText.value = JSON.stringify(style.value, null, 2)
  }
  
  jsonError.value = ''
  showStyleModal.value = true
}

// Remove a style
const removeStyle = (index: number) => {
  localStyles.value.splice(index, 1)
  emitUpdate()
}

// Format JSON in the editor
const formatJson = () => {
  try {
    const parsed = JSON.parse(styleJsonText.value)
    styleJsonText.value = JSON.stringify(parsed, null, 2)
    jsonError.value = ''
  } catch (e) {
    jsonError.value = 'Invalid JSON format'
  }
}

// Save the current style
const saveStyle = () => {
  // Create the new style object
  const newStyle: MapboxCustomStyle = {
    label: editingStyle.value.label,
    value: styleType.value === 'url' ? styleUrl.value : JSON.parse(styleJsonText.value)
  }
  
  // Update the styles array
  if (editingStyleIndex.value !== null) {
    localStyles.value[editingStyleIndex.value] = newStyle
  } else {
    localStyles.value.push(newStyle)
  }
  
  // Emit the update
  emitUpdate()
  
  // Close the modal
  showStyleModal.value = false
}

// Cancel the style modal
const cancelStyleModal = () => {
  showStyleModal.value = false
}

// Emit update event
const emitUpdate = () => {
  emit('update:mapbox-styles', JSON.parse(JSON.stringify(localStyles.value)))
}
</script>
