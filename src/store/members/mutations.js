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
export function updateMembershipTypes (state, types) {
  state.types = types.sort((a, b) => a.membership_type_id - b.membership_type_id)
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
  state.signups = signups.map(s => Object.defineProperty(s, 'name', {
    get: function () {
      return Array.isArray(this.members) && this.members.length
        ? this.members.map(m => m.firstname + ' ' + m.lastname).join(', ')
        : '-- empty --'
    }
  }))
}

export function addVendId (state, { signupId, vendids }) {
  console.log(vendids)
  const signup = state.signups.find(s => s.id === signupId)
  if (!signup) return
  for (const member of signup.members) {
    member.vendid = vendids[member.id]
  }
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
