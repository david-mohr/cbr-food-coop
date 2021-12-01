
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'login', name: 'Login', component: () => import('pages/Login.vue') },
      { path: 'signup', component: () => import('pages/Signup.vue') },
      { path: 'thanks', name: 'Thanks', component: () => import('pages/Thanks.vue') },
      { path: 'members', component: () => import('pages/Index.vue') },
      { path: 'members/:memberId', name: 'Member', component: () => import('pages/Member.vue') },
      { path: 'users', component: () => import('pages/Users.vue') },
      { path: 'users/:userId', name: 'User', component: () => import('pages/User.vue') },
      { path: 'accept-invite/:token', name: 'Accept invite', component: () => import('pages/AcceptInvite.vue') },
      { path: 'view-signups', name: 'View signups', component: () => import('pages/ViewSignups.vue') },
      { path: 'process-signups/:signupId', name: 'Process signup', component: () => import('pages/ProcessSignup.vue') },
      { path: 'unapproved-members', name: 'Unapproved Members', component: () => import('pages/UnapprovedMembers.vue') },
      { path: 'about', name: 'About', component: () => import('pages/About.vue') }
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
