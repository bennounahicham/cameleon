// src/router/routes.js
import { requireAuth } from 'src/middleware/auth'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresGuest: true }
      },
      { 
        path: 'langs', 
        component: () => import('pages/Langues.vue'),
        meta: { requiresGuest: true }
      },
      { 
        path: 'phone', 
        component: () => import('src/pages/phone.vue'),
        meta: { requiresGuest: true }
      },
      { 
        path: 'home', 
        component: () => import('src/pages/Home.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes