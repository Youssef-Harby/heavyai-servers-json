<template>
  <div class="w-full h-96 border border-gray-300 rounded-lg overflow-hidden relative">
    <div ref="monacoContainer" class="w-full h-full"></div>
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// Define props
const props = defineProps<{
  value: string
  readOnly?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const monacoContainer = ref<HTMLElement | null>(null)
let editor: any = null
const loading = ref(true)

onMounted(async () => {
  // Dynamically import Monaco to avoid SSR issues
  const monaco = await import('monaco-editor')
  
  // Fix for moduleIdToUrl undefined error
  // @ts-ignore
  window.MonacoEnvironment = {
    getWorkerUrl: function(_moduleId: string, label: string) {
      if (label === 'json') {
        return './monaco-editor/esm/vs/language/json/json.worker.js'
      }
      return './monaco-editor/esm/vs/editor/editor.worker.js'
    }
  }

  // Create editor if container exists
  if (monacoContainer.value) {
    editor = monaco.editor.create(monacoContainer.value, {
      value: props.value,
      language: 'json',
      automaticLayout: true,
      theme: 'vs',
      readOnly: props.readOnly !== undefined ? props.readOnly : true,
      scrollBeyondLastLine: false,
      minimap: { enabled: true },
      lineNumbers: 'on',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto'
      },
      formatOnPaste: true
    })
    
    // Add change event listener
    if (!props.readOnly) {
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue()
        emit('update:value', value)
      })
    }
    
    loading.value = false
  }
})

// Update the editor when the value changes
watch(() => props.value, (newValue) => {
  if (editor) {
    // Only update if the content is different
    if (editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  }
})

// Clean up the editor on component unmount
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>
