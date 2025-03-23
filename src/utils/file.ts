import type { ServerConfig } from '@/types/config'

/**
 * Read a file and parse as JSON
 */
export const readJsonFile = (file: File): Promise<ServerConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const json = JSON.parse(content)
        resolve(json[0] || json) // Handle array format like in servers.json
      } catch (e) {
        reject(new Error('Failed to parse JSON file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Format JSON with proper indentation
 */
export const formatJson = (json: any, spaces = 2): string => {
  return JSON.stringify(json, null, spaces)
}

/**
 * Download content as a file
 */
export const downloadFile = (content: string, filename: string, type = 'application/json') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  
  URL.revokeObjectURL(url)
}

/**
 * Copy content to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (e) {
    console.error('Failed to copy text', e)
    return false
  }
}
