function alphasort (prop) {
  return (a, b) => a[prop].localeCompare(b[prop], 'en', { ignorePunctuation: true })
}

export function updateMembers (state, members) {
  if (members) members.sort(alphasort('NAME'))
  state.members = members
}
export function saveToken (state, token) {
  state.token = token
}
export function removeToken (state) {
  state.token = null
}
