// src/middleware/auth.js
import { useAuthStore } from 'src/stores/auth'

export const requireAuth = async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Si on va vers une page auth et qu'on est déjà authentifié
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/home')
  }
  
  // Si on va vers une page protégée et qu'on n'est pas authentifié
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/phone')
  }

  next()
}

export const validateToken = async () => {
  const authStore = useAuthStore()
  if (!authStore.accessToken) return false
  
  try {
    // On teste si le token est valide en faisant un appel à l'API
    const response = await authStore.validateToken()
    return response.success
  } catch (error) {
    return false
  }
}