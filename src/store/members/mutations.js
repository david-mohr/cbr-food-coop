function alphasort (prop) {
  return (a, b) => a[prop].localeCompare(b[prop], 'en', { ignorePunctuation: true })
}
function parseJwt (token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''))

  return JSON.parse(jsonPayload)
}
export function updateMemberHistory (state, member) {
  state.memberHistory[member.id] = member.history
}
export function updateMemberStatus (state, member) {
  member.status.membershipexpires = new Date(member.status.membershipexpires)
  member.status.discvaliduntil = new Date(member.status.discvaliduntil)
  state.memberStatus[member.id] = member.status
}
export function updateMembers (state, members) {
  if (members) members.sort(alphasort('name'))
  state.members = members
}
export function updateUsers (state, users) {
  if (users) users.sort(alphasort('username'))
  state.users = users
}
export function updateSignups (state, signups) {
  if (signups) signups.sort(alphasort('firstname'))
  state.signups = signups.map(s => Object.defineProperty(s, 'name', {
    get: function () {
      return this.firstname + ' ' + this.lastname
    }
  }))
}
export function saveToken (state, token) {
  state.token = token
  state.user = parseJwt(token)
}
export function removeToken (state) {
  state.token = null
  state.user = null
}
export function updateMemberDetails (state, member) {
  const index = state.members.findIndex(m => m.id === member.id)
  if (index >= 0) state.members.splice(index, 1, member)
  else state.members.push(member)
}
