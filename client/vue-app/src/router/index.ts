import { createWebHistory, createRouter } from 'vue-router'
import { authGuard } from './guards'

const routes = [
  {
    path: '/',
    component: () => import('@/views/home/HomePage.vue'),
    name: 'HomePage',
    meta: { isPublic: true }
  },
  {
    path: '/login',
    component: () => import('@/views/authentication/LoginPage.vue'),
    name: 'LoginPage',
    meta: { isPublic: true }
  },
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/DashboardPage.vue'),
    name: 'DashboardPage',
    meta: { isPublic: false }
  },
  {
    path: '/profile',
    component: () => import('@/views/profile/ProfilePage.vue'),
    name: 'ProfilePage',
    meta: { isPublic: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  authGuard(to, from, next)
})

export default router
