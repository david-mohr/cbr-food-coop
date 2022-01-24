export function toBeApproved (state) {
  return state.members.filter(member => !member.approved)
}
