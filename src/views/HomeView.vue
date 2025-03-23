<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">HeavyAI Configuration Editor</h2>
      
      <div class="mb-8">
        <p class="text-lg text-gray-700 dark:text-gray-300 text-center mb-4">
          Edit your HeavyAI server configuration with a friendly UI.
        </p>
      </div>
      
      <!-- File loader -->
      <div 
        class="border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 rounded-lg mb-6 text-center"
        :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/10': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
      >
        <div v-if="!isLoading">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            JSON files only
          </p>
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept=".json" 
            @change="handleFileSelected" 
          />
          <button 
            @click="() => { if ($refs.fileInput) ($refs.fileInput as HTMLInputElement).click() }" 
            class="mt-4 btn btn-primary"
          >
            Select File
          </button>
        </div>
        <div v-else class="flex justify-center items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading configuration...</span>
        </div>
      </div>
      
      <!-- Remote URL input -->
      <div class="mb-6">
        <div class="flex items-center space-x-2">
          <input 
            type="text" 
            v-model="remoteUrl" 
            placeholder="Enter remote JSON URL" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            @click="loadRemoteConfig" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            Load
          </button>
        </div>
      </div>
      
      <!-- Load sample data -->
      <div class="text-center">
        <button 
          @click="loadSampleData" 
          class="btn btn-secondary"
        >
          Load Sample Configuration
        </button>
      </div>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { readJsonFile } from '@/utils/file'

const router = useRouter()
const configStore = useConfigStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const remoteUrl = ref('')

// Handle file selection from browse dialog
const handleFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  await processFile(input.files[0])
}

// Handle file drop
const handleFileDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return
  
  const file = event.dataTransfer.files[0]
  if (file.type !== 'application/json') {
    errorMessage.value = 'Please upload a JSON file'
    return
  }
  
  await processFile(file)
}

// Process the uploaded file
const processFile = async (file: File) => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const configData = await readJsonFile(file)
    configStore.loadConfig(configData)
    router.push('/editor')
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unknown error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

// Load remote configuration
const loadRemoteConfig = async () => {
  if (!remoteUrl.value) {
    errorMessage.value = 'Please enter a URL'
    return
  }

  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const response = await fetch(remoteUrl.value, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to load configuration from ${remoteUrl.value}`)
    }
    
    const configData = await response.json()
    configStore.loadConfig(Array.isArray(configData) ? configData[0] : configData)
    router.push('/editor')
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unknown error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

// Load the sample configuration
const loadSampleData = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    // Use import.meta.env.BASE_URL to get the correct path with the base URL
    const sampleUrl = `${import.meta.env.BASE_URL}servers.json`
    
    // Fetch the servers.json file
    const response = await fetch(sampleUrl)
    if (!response.ok) {
      throw new Error('Failed to load sample configuration')
    }
    
    const configData = await response.json()
    configStore.loadConfig(Array.isArray(configData) ? configData[0] : configData)
    router.push('/editor')
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unknown error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

// Check for URL config parameter
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const urlConfig = urlParams.get('urlConfig')
  
  if (urlConfig) {
    remoteUrl.value = urlConfig
    loadRemoteConfig()
  }
})
</script>
