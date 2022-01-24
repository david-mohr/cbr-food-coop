<template>
  <q-page>
    <div class="text-h4 text-center">
      Members to be approved
    </div>
    <div class="q-pa-md">
      <q-table
        title="Members to be Approved"
        :rows="memberList"
        :columns="columns"
        selection="multiple"
        :pagination="pagination"
      />
    </div>
  </q-page>
</template>

<script>

export default {
  computed: {
    memberList () {
      return this.$store.getters['members/toBeApproved']
    },
    pagination () {
      return {
        rowsPerPage: 30
      }
    },
    columns () {
      return [
        {
          name: 'name',
          required: true,
          label: 'Name',
          field: row => row.name,
          sortable: true,
          align: 'left'
        },
        {
          name: 'city',
          label: 'Suburb',
          field: row => row.city,
          sortable: true,
          align: 'left'
        },
        {
          name: 'email',
          label: 'Email',
          field: row => row.email,
          sortable: true,
          align: 'left'
        }
      ]
    }
  }
}

</script>
