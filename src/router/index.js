// src/router/index.js
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { requireAuth, validateToken } from 'src/middleware/auth'

export default route(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE)
  })

  // Ajout du middleware d'authentification
  Router.beforeEach(requireAuth)

  // Vérification du token à chaque changement de route
  Router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
      const isValidToken = await validateToken()
      if (!isValidToken) {
        next('/phone')
        return
      }
    }
    next()
  })

  return Router
})