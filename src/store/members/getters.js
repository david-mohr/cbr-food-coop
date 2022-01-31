export function toBeApproved (state) {
  return state.members.filter(member => !member.approved)
}

export function memberLookup (state) {
  return state.members.reduce((acc, member) => ({ ...acc, [member.id]: member }), {})
}

export function membershipLookup (state) {
  return state.memberships.reduce((acc, ms) => ({ ...acc, [ms.membership_id]: ms }), {})
}
