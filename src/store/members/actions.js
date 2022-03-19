import { Notify, SessionStorage } from 'quasar'
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
    console.log(err)
    // Co-ordinators won't be able to see users
  }
}

export async function getSignups (context) {
  try {
    const res = await api.get('/api/signups', {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateSignups', res.data)
  } catch (err) {
    console.log(err)
  }
}

export async function getMembershipTypes (context) {
  try {
    const res = await api.get('/api/membership-types', {
    })
    context.commit('updateMembershipTypes', res.data)
  } catch (err) {
    console.log(err)
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
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load member history'
    })
  }
}

export async function updateHistory ({ dispatch, getters, state }, { activity, memberId }) {
  await api.post(`/api/members/${memberId}/history`, activity, {
    headers: {
      authorization: 'Bearer ' + state.token
    }
  })
  await dispatch('getHistory', memberId)
  await dispatch('getMembership', getters.memberLookup[memberId].membership_id)
}

export async function getMembership (context, membershipId) {
  try {
    const res = await api.get(`/api/memberships/${membershipId}`, {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateMembership', res.data)
  } catch (err) {
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load memberships'
    })
  }
}

export async function getMemberships (context) {
  try {
    const res = await api.get('/api/memberships', {
      headers: {
        authorization: 'Bearer ' + context.state.token
      }
    })
    context.commit('updateMemberships', res.data)
  } catch (err) {
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load memberships'
    })
  }
}

export async function updateMemberDetails (context, member) {
  await api.put(`/api/members/${member.id}`, member, {
    headers: {
      authorization: 'Bearer ' + context.state.token
    }
  })
  context.commit('updateMemberDetails', member)
}

export async function setFirstShop (context, member) {
  await api.put(`/api/memberships/${member.membership_id}`, member, {
    headers: {
      authorization: 'Bearer ' + context.state.token
    }
  })
  context.commit('updateMemberDetails', member)
}

export async function fetchAll ({ dispatch }) {
  await Promise.all([
    dispatch('getMembers'),
    dispatch('getMemberships'),
    dispatch('getMembershipTypes')
  ])
}

export async function login ({ commit, dispatch }, creds) {
  const res = await api.post('/api/login', creds)
  SessionStorage.set('token', res.data.token)
  commit('saveToken', res.data.token)
  await dispatch('fetchAll')
}

export async function loadToken ({ commit, dispatch }, creds) {
  const token = SessionStorage.getItem('token')
  if (!token) return
  commit('saveToken', token)
  await dispatch('fetchAll')
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
export async function submitApprovalSheet (context, approvalSheet) {
  await api.put('/api/approvals/', approvalSheet, {
    headers: {
      authorization: 'Bearer ' + context.state.token
    }
  })
  // context.commit... when there is a way to display approval sheets // TODO
}
