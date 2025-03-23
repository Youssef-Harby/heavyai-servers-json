<template>
  <div v-if="configStore.isLoaded">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Edit Configuration</h1>
      <div class="flex space-x-3">
        <button @click="downloadConfiguration" class="btn btn-primary">
          Download Configuration
        </button>
        <button @click="$router.push('/')" class="btn btn-secondary">
          Back to Home
        </button>
      </div>
    </div>

    <!-- Tabs navigation -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="flex -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 font-medium text-sm"
          :class="[
            activeTab === tab.id 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab content -->
    <div class="bg-white shadow rounded-lg p-6">
      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">General Settings</h2>
          <button 
            @click="saveGeneralSettings" 
            class="btn btn-primary text-sm"
            :disabled="!configStore.isModified"
          >
            Save Settings
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              v-model="config.username" 
              type="text" 
              class="input"
              @change="configStore.isModified = true"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Database</label>
            <input 
              v-model="config.database" 
              type="text" 
              class="input"
              @change="configStore.isModified = true"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              v-model="config.password" 
              type="password" 
              class="input"
              @change="configStore.isModified = true"
            />
          </div>
          
          <div class="flex items-center">
            <input 
              v-model="config.enableJupyter" 
              type="checkbox" 
              id="enableJupyter" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
              @change="configStore.isModified = true"
            />
            <label for="enableJupyter" class="ml-2 block text-sm text-gray-700">
              Enable Jupyter
            </label>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-800 mb-3">Custom Styles</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                v-model="config.customStyles.title" 
                type="text" 
                class="input"
                @change="configStore.isModified = true"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input 
                v-model="config.customStyles.logoURL" 
                type="text" 
                class="input"
                @change="configStore.isModified = true"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Feature Flags -->
      <div v-if="activeTab === 'feature-flags'">
        <feature-flags-editor 
          :feature-flags="config.feature_flags"
          @update:feature-flags="updateFeatureFlags"
        />
      </div>
      
      <!-- Mapbox Custom Styles -->
      <div v-if="activeTab === 'mapbox-styles'">
        <mapbox-styles-editor 
          :mapbox-styles="config.mapboxCustomStyles"
          @update:mapbox-styles="updateMapboxStyles"
        />
      </div>
      
      <!-- History View -->
      <div v-if="activeTab === 'history'">
        <history-view />
      </div>
      
      <!-- Advanced Editor -->
      <div v-if="activeTab === 'advanced-editor'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Advanced Editor</h2>
          <div class="flex space-x-2">
            <button 
              @click="saveAdvancedEditor" 
              class="btn btn-primary text-sm"
              :disabled="!advancedEditorModified"
            >
              Save Changes
            </button>
            <button @click="copyJsonToClipboard" class="btn btn-secondary text-sm">
              Copy to Clipboard
            </button>
          </div>
        </div>
        
        <div class="mt-4">
          <json-viewer 
            :value="formattedAdvancedEditorJson" 
            :read-only="false"
            @update:value="updateAdvancedEditor"
          />
        </div>
      </div>
    </div>
    
    <!-- Save confirmation -->
    <div v-if="saveSuccess" class="fixed bottom-4 right-4 bg-green-100 text-green-800 p-3 rounded-lg shadow-lg">
      Configuration saved successfully!
    </div>
  </div>
  <div v-else class="text-center p-12">
    <p class="text-lg">No configuration loaded. Please return home and load a configuration.</p>
    <button @click="$router.push('/')" class="mt-4 btn btn-primary">
      Go to Home
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { downloadFile, copyToClipboard } from '@/utils/file'
import FeatureFlagsEditor from '@/components/feature-flags/FeatureFlagsEditor.vue'
import MapboxStylesEditor from '@/components/mapbox-styles/MapboxStylesEditor.vue'
import JsonViewer from '@/components/common/JsonViewer.vue'
import HistoryView from '@/components/history/HistoryView.vue'
import type { MapboxCustomStyle, FeatureFlags } from '@/types/config'

const router = useRouter()
const configStore = useConfigStore()

// Tabs configuration
const tabs = [
  { id: 'general', label: 'General' },
  { id: 'feature-flags', label: 'Feature Flags' },
  { id: 'mapbox-styles', label: 'Mapbox Styles' },
  { id: 'history', label: 'History' },
  { id: 'advanced-editor', label: 'Advanced Editor' }
]

const activeTab = ref('general')
const saveSuccess = ref(false)
const advancedEditorModified = ref(false)

// For easier template access
const config = computed(() => configStore.config!)

// JSON for advanced editor
const advancedEditorJson = ref(JSON.parse(JSON.stringify(configStore.config || {})))

// Formatted JSON for advanced editor
const formattedAdvancedEditorJson = computed(() => formatJson(advancedEditorJson.value))

// Format JSON object to string with proper indentation
function formatJson(json: any): string {
  try {
    return JSON.stringify(json, null, 2);
  } catch (error) {
    console.error('Error formatting JSON:', error);
    return '{}';
  }
}

// Watch for config changes to update advanced editor
watch(() => configStore.config, (newConfig) => {
  if (newConfig) {
    advancedEditorJson.value = JSON.parse(JSON.stringify(newConfig))
  }
}, { deep: true })

// Sync activeTab with store
watch(activeTab, (newTab) => {
  configStore.setActiveTab(newTab)
})

// Initialize activeTab from store if available
onMounted(() => {
  if (configStore.activeTab) {
    activeTab.value = configStore.activeTab
  }
})

// Update handlers for child components
function updateMapboxStyles(styles: MapboxCustomStyle[]) {
  configStore.updateMapboxStyles(styles)
}

function updateFeatureFlags(flags: FeatureFlags, flagName?: string, action?: string) {
  if (flagName) {
    // If a specific flag was updated, include its name and action in the history
    const actionText = action ? ` (${action})` : '';
    configStore.updateFeatureFlag(flagName, flags[flagName], `Updated flag: ${flagName}${actionText}`)
  } else {
    // Otherwise, update all flags
    configStore.updateFeatureFlags(flags)
  }
}

function updateAdvancedEditor(newValue: string) {
  try {
    // Parse the JSON string back to an object
    const parsedJson = JSON.parse(newValue);
    advancedEditorJson.value = parsedJson;
    advancedEditorModified.value = true;
  } catch (error) {
    console.error('Invalid JSON:', error);
    // Don't update if the JSON is invalid
  }
}

// Download configuration to file
function downloadConfiguration() {
  const savedConfig = configStore.saveConfig()
  if (savedConfig) {
    downloadFile(
      formatJson(savedConfig),
      'heavyai-config.json',
      'application/json'
    )
    
    // Show success message
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
    
    // Add to history
    configStore.addToHistory('Downloaded configuration to file')
  }
}

// Copy JSON to clipboard
function copyJsonToClipboard() {
  const savedConfig = configStore.saveConfig()
  if (savedConfig) {
    copyToClipboard(formatJson(savedConfig))
    
    // Show success message
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }
}

// Save general settings
function saveGeneralSettings() {
  // Add to history before saving
  configStore.addToHistory('Updated general settings')
  
  configStore.saveConfig()
  configStore.isModified = false
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

// Save advanced editor changes
function saveAdvancedEditor() {
  // Add to history before saving
  configStore.addToHistory('Updated configuration via Advanced Editor')
  
  // Update the config with the advanced editor content
  if (configStore.config) {
    // Type assertion to allow indexing with string
    const config = configStore.config as Record<string, any>;
    Object.keys(advancedEditorJson.value).forEach(key => {
      config[key] = advancedEditorJson.value[key];
    });
  }
  
  configStore.isModified = true
  advancedEditorModified.value = false
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

// Guard against no configuration loaded
onMounted(() => {
  if (!configStore.isLoaded) {
    router.push('/')
  }
})
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
