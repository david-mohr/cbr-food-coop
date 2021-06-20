import { Notify } from 'quasar'
import { api } from 'boot/axios'

export async function getMembers (context) {
  try {
    const res = await api.get('/api/members')
    context.commit('updateMembers', res.data)
  } catch (err) {
    // context.dispatch('handle401', err)
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Failed to load members'
    })
    // throw err
  }
}
