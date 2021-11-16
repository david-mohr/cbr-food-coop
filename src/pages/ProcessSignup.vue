<template>
  <q-page
    class="flex justify-center"
    style="margin-top: 30px"
  >
    <pre>{{ signup }}</pre>
  </q-page>
</template>

<script>
export default {
  computed: {
    signupId () {
      return parseInt(this.$route.params.signupId, 10)
    },
    signup () {
      console.log(this.$store.state.members.signups.find(s => s.id === this.signupId))
      return this.$store.state.members.signups.find(s => s.id === this.signupId)
    }
  },
  async created () {
    if (!this.$store.state.members.signups.length) {
      await this.$store.dispatch('members/getSignups')
    }
  }
}
</script>
