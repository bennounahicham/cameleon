// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useApi from 'src/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { post } = useApi()
  
  // State
  const appToken = ref(localStorage.getItem('auth_token'))
  const accessToken = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  const hasAppToken = computed(() => !!appToken.value)

  const verifyPhoneCode = async (phone, deviceId, code) => {
    try {
      isLoading.value = true
      error.value = null
      
      const formData = new FormData()
      formData.append('phone', phone)
      formData.append('device_id', deviceId)
      formData.append('code', code)

      const response = await post('check_code', formData)
      
      if (response.data.user) {
        // Si l'utilisateur existe, on récupère son token d'accès
        return await getUserToken(phone, deviceId)
      } else {
        // Sinon on redirige vers l'inscription
        router.push('/register')
        return false
      }
    } catch (err) {
      error.value = "Erreur lors de la vérification du code"
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getUserToken = async (phone, deviceId) => {
    try {
      isLoading.value = true
      error.value = null
      
      const formData = new FormData()
      formData.append('grant_type', 'password')
      formData.append('client_id', process.env.OAUTH_CLIENT_ID)
      formData.append('client_secret', process.env.OAUTH_CLIENT_SECRET)
      formData.append('username', phone)
      formData.append('password', deviceId)

      const data = await post('oauth/token', formData, { useApi: false, handleError: false })
      
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      return true
    } catch (err) {
      error.value = "Erreur lors de la récupération du token utilisateur"
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    appToken.value = null
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    
    router.push('/phone')
  }

  // Validation du token
  const validateToken = async () => {
    try {
      const { get } = useApi()
      const response = await get('fr/me')
      return response
    } catch (error) {
      logout()
      return { success: false }
    }
  }

  return {
    // State
    appToken,
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,
    
    // Validation
    validateToken,
    
    // Getters
    isAuthenticated,
    hasAppToken,

    verifyPhoneCode,
    getUserToken,
    logout
  }
})