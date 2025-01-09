// src/composables/useApi.js
import { ref } from 'vue'
import { LocalStorage } from 'quasar'

export default function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const token = ref(null)

  const getHeaders = async (customHeaders = {}) => {
    // First try to get access_token
    token.value = LocalStorage.getItem('access_token')
    
    // If no access token, try to get auth token
    if (!token.value || token.value === 'undefined') {
      try {
        token.value = await window.getAuthToken()
      } catch (err) {
        console.error('Error getting auth token:', err)
        throw new Error('No authentication token found')
      }
    }

    console.log('Token:', token.value);
    

    // Verify we have a valid token
    if (!token.value || token.value === 'undefined') {
      throw new Error('No authentication token found')
    }

    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token.value}`,
      ...customHeaders
    }
  }

  const api = async (url, options = {}) => {
    const {
      method = 'GET',
      body = null,
      useApi = true,
      headers = {},
      handleError = true
    } = options

    loading.value = true
    error.value = null

    try {
      // Get headers first - important to await this
      const finalHeaders = await getHeaders(headers)
      
      const config = {
        method,
        headers: finalHeaders,
        credentials: 'include'
      }

      // Add body if needed
      if (method !== 'GET' && method !== 'HEAD' && body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body)
      }

      // Build full URL
      const fullUrl = useApi ? `${process.env.API_URL}/api/${url}` : `${process.env.API_URL}/${url}`


      const response = await fetch(fullUrl, config)
      
      // Handle non-OK responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('API Response:', data)

      if (!data.success && handleError) {
        throw new Error(data.message || 'Une erreur est survenue')
      }

      return data
    } catch (err) {
      console.error('API Error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const get = (url, options = {}) => api(url, { ...options, method: 'GET' })
  const post = (url, body, options = {}) => api(url, { ...options, body, method: 'POST' })
  const put = (url, body, options = {}) => api(url, { ...options, body, method: 'PUT' })
  const del = (url, options = {}) => api(url, { ...options, method: 'DELETE' })

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del
  }
}