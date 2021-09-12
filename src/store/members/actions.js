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
  }
}

export async function getUsers (context) {
  try {
    const res = await api.get('/api/users', {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateUsers', res.data)
  } catch (err) {
    // Co-ordinators won't be able to see users
  }
}

export async function getHistory (context, memberId) {
  try {
    const res = await api.get(`/api/members/${memberId}/history`, {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateMemberHistory', {
      id: memberId,
      history: res.data
    })
  } catch (err) {
    if (err.response.status === 401) {
      Router.replace({ name: 'Login' })
    }
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load member history'
    })
  }
}

export async function getStatus (context, memberId) {
  try {
    const res = await api.get(`/api/members/${memberId}/status`, {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateMemberStatus', {
      id: memberId,
      status: res.data
    })
  } catch (err) {
    if (err.response.status === 401) {
      Router.replace({ name: 'Login' })
    }
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load member status'
    })
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

export async function addUser (context, user) {
  try {
    await api.post('/api/users', user, {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    await context.dispatch('getUsers')
  } catch (err) {
    console.error(err)
    throw new Error('Failed to create new user')
  }
}
