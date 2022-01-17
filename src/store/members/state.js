export default function () {
  return {
    members: [],
    users: [],
    signups: [],
    token: null,
    user: null,
    memberHistory: {},
    memberStatus: {},
    // I would like to have this as a table in the database, as I think this is
    // likely to change in the future. The same may go for concession types.
    types: [],
    concessions: [
      { id: 'health', label: 'Heath Care' },
      { id: 'low_income', label: 'Low income' },
      { id: 'student', label: 'Student' },
      { id: 'pensioner', label: 'Pensioner' }
    ]
  }
}
