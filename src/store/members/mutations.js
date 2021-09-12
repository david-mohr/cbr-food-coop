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
  member.status.MEMBERSHIPEXPIRES = new Date(member.status.MEMBERSHIPEXPIRES)
  member.status.DISCVALIDUNTIL = new Date(member.status.DISCVALIDUNTIL)
  state.memberStatus[member.id] = member.status
}
export function updateMembers (state, members) {
  if (members) members.sort(alphasort('NAME'))
  state.members = members
}
export function updateUsers (state, users) {
  if (users) users.sort(alphasort('username'))
  state.users = users
}
export function saveToken (state, token) {
  state.token = token
  state.user = parseJwt(token)
}
export function removeToken (state) {
  state.token = null
  state.user = null
}
