import { Notify, SessionStorage } from 'quasar'
import Router from '../../router'
import { api } from 'boot/axios'

export async function getMembers (context) {
  try {
    const res = await api.get('/api/members', {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateMembers', res.data)
  } catch (err) {
    if (err.response.status === 401) {
      Router.replace({ name: 'Login' })
    }
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load members'
    })
    // throw err
  }
}

export async function login (context, creds) {
  const res = await api.post('/api/login', creds)
  SessionStorage.set('token', res.data.token)
  context.commit('saveToken', res.data.token)
}

export async function loadToken (context, creds) {
  const token = SessionStorage.getItem('token')
  if (token) context.commit('saveToken', token)
}

export async function logout (context) {
  SessionStorage.remove('token')
  context.commit('removeToken')
}
