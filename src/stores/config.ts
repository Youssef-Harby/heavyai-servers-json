import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { ServerConfig, NotebookCards, MapboxCustomStyle } from '@/types/config'

// Storage keys
const STORAGE_KEY = 'heavyai-config'
const HISTORY_KEY = 'heavyai-config-history'

// History entry type
interface HistoryEntry {
  timestamp: number
  config: ServerConfig
  description: string
}

export const useConfigStore = defineStore('config', () => {
  // State
  const config = ref<ServerConfig | null>(null)
  const notebookCards = ref<NotebookCards>({})
  const isLoaded = ref(false)
  const activeTab = ref('general')
  const history = ref<HistoryEntry[]>([])
  const isModified = ref(false)
  
  // Initialize from local storage if available
  const initFromStorage = () => {
    try {
      // Load current config
      const savedConfig = localStorage.getItem(STORAGE_KEY)
      if (savedConfig) {
        config.value = JSON.parse(savedConfig)
        isLoaded.value = true
      }
      
      // Load history
      const savedHistory = localStorage.getItem(HISTORY_KEY)
      if (savedHistory) {
        history.value = JSON.parse(savedHistory)
      }
    } catch (error) {
      console.error('Failed to load config from local storage:', error)
    }
  }
  
  // Call initialization
  initFromStorage()
  
  // Watch for changes to save to local storage
  watch(config, (newConfig) => {
    if (newConfig) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
    }
  }, { deep: true })
  
  watch(history, (newHistory) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }, { deep: true })

  // Computed property to check if configuration is loaded
  const isConfigLoaded = computed(() => config.value !== null)
  
  // Actions
  function loadConfig(newConfig: ServerConfig) {
    // Add current config to history if it exists
    if (config.value) {
      addToHistory('Auto-saved before loading new config')
    }
    
    config.value = newConfig
    isLoaded.value = true
    
    // Parse notebook cards from string to object
    if (newConfig.feature_flags && newConfig.feature_flags['dev/sql_notebook_cards']) {
      try {
        notebookCards.value = JSON.parse(newConfig.feature_flags['dev/sql_notebook_cards'] as string)
      } catch (e) {
        console.error('Failed to parse notebook cards JSON', e)
        notebookCards.value = {}
      }
    }
    
    // Add initial config to history if history is empty
    if (history.value.length === 0) {
      addToHistory('Initial configuration loaded')
    }
  }

  function updateConfig(newConfig: ServerConfig) {
    config.value = { ...newConfig }
    isModified.value = true
  }

  function updateFeatureFlags(flags: Record<string, any>) {
    if (config.value) {
      config.value.feature_flags = { ...flags }
      addToHistory('Updated feature flags')
      isModified.value = true
    }
  }

  function updateFeatureFlag(key: string, value: any, description?: string) {
    if (config.value && config.value.feature_flags) {
      config.value.feature_flags[key] = value
      addToHistory(description || `Updated feature flag: ${key}`)
      isModified.value = true
    }
  }

  function updateNotebookCards(cards: NotebookCards) {
    notebookCards.value = { ...cards }
    if (config.value && config.value.feature_flags) {
      config.value.feature_flags['dev/sql_notebook_cards'] = JSON.stringify(cards)
      addToHistory('Updated SQL notebook cards')
      isModified.value = true
    }
  }

  function updateMapboxStyles(styles: MapboxCustomStyle[]) {
    if (config.value) {
      config.value.mapboxCustomStyles = [...styles]
      addToHistory('Updated Mapbox styles')
      isModified.value = true
    }
  }
  
  function addToHistory(description: string) {
    if (!config.value) return
    
    const entry: HistoryEntry = {
      timestamp: Date.now(),
      config: JSON.parse(JSON.stringify(config.value)),
      description
    }
    
    // Add to history, keeping only the last 50 entries
    history.value = [entry, ...history.value].slice(0, 50)
  }
  
  function restoreFromHistory(index: number) {
    if (index >= 0 && index < history.value.length) {
      config.value = JSON.parse(JSON.stringify(history.value[index].config))
      addToHistory('Restored from history')
    }
  }
  
  function clearHistory() {
    history.value = []
  }

  function setActiveTab(tab: string) {
    activeTab.value = tab
  }
  
  function saveConfig(): ServerConfig | null {
    if (!config.value) return null
    
    // Create a deep copy of the config
    const savedConfig = JSON.parse(JSON.stringify(config.value))
    
    // Stringify notebook cards back to single-line JSON string
    if (Object.keys(notebookCards.value).length > 0) {
      savedConfig.feature_flags['dev/sql_notebook_cards'] = JSON.stringify(notebookCards.value)
    }
    
    isModified.value = false
    return savedConfig
  }

  return {
    config,
    notebookCards,
    isLoaded,
    activeTab,
    history,
    isModified,
    isConfigLoaded,
    loadConfig,
    updateConfig,
    updateFeatureFlags,
    updateFeatureFlag,
    updateNotebookCards,
    updateMapboxStyles,
    setActiveTab,
    addToHistory,
    restoreFromHistory,
    clearHistory,
    saveConfig
  }
})
