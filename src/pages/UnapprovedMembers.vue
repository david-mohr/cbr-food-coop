<template>
  <q-page>
    <div class="text-h4 text-center">
      Unapproved Members
    </div>
    <div class="q-pa-md">
      <ul>
        <li
          v-for="member in memberList"
          :key="member.id"
        >
          {{ member.id }}: {{ member.name }}
        </li>
      </ul>
    </div>
  </q-page>
</template>

<script>

export default {
  data () {
    return { memberList: {} }
  },
  mounted () {
    this.getMembers()
  },
  methods: {
    async getMembers () {
      try {
        const res = await this.$api.get('/api/unapproved-members', {
          headers: {
            authorization: 'Bearer ' + this.$store.state.members.token
          }
        })
        this.memberList = res.data
      } catch (err) {
        console.log(err)
      }
    }
  }
}

</script>
