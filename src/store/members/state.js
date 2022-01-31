export default function () {
  return {
    members: [],
    memberships: [],
    users: [],
    signups: [],
    token: null,
    user: null,
    memberHistory: {},
    // This is now a table in the database. The same may eventually happen for
    // concession types.
    types: [],
    concessions: [
      { id: 'health', label: 'Heath Care' },
      { id: 'low_income', label: 'Low income' },
      { id: 'student', label: 'Student' },
      { id: 'pensioner', label: 'Pensioner' }
    ]
  }
}
