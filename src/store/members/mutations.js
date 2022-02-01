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

function processMembership (ms) {
  return {
    ...ms,
    expires: new Date(ms.expires),
    discvaliduntil: new Date(ms.discvaliduntil)
  }
}

export function updateMemberships (state, memberships) {
  state.memberships = memberships.map(processMembership)
}

export function updateMembership (state, membership) {
  const processed = processMembership(membership)
  // find the membership in the array and replace it
  const index = state.memberships.findIndex(ms => ms.membership_id === membership.id)
  if (index < 0) state.memberships.push(processed)
  else state.memberships.splice(index, 1, processed)
}

export function updateMembershipTypes (state, types) {
  state.types = types
    .map(t => ({ ...t, price: parseFloat(t.price), concession: parseFloat(t.concession) }))
    .sort((a, b) => a.membership_type_id - b.membership_type_id)
}
export function updateMembers (state, members) {
  if (members) members.sort(alphasort('name'))
  state.members = members
}
export function updateUsers (state, users) {
  if (users) users.sort(alphasort('name'))
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

export function addVendId (state, { signupId, vendIds }) {
  console.log(vendIds)
  const signup = state.signups.find(s => s.id === signupId)
  if (!signup) return
  for (const member of signup.members) {
    member.vend_id = vendIds[member.id]
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
