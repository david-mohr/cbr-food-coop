
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/members', component: () => import('pages/Index.vue') },
      { path: 'login', name: 'Login', component: () => import('pages/Login.vue') },
      { path: 'members/:memberId', name: 'Member', component: () => import('pages/Member.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
