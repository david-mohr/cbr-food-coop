<template>
  <q-page padding>
    <template v-if="user">
      <div class="row">
        <div class="col-3">
          <label>Username</label>
        </div>
        <div class="col-9">
          {{ user.username }}
        </div>
      </div>
      <div class="row">
        <div class="col-3">
          <label>Role</label>
        </div>
        <div class="col-9">
          {{ user.role }}
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
export default {
  computed: {
    userId () {
      return parseInt(this.$route.params.userId, 10)
    },
    user () {
      return this.$store.state.members.users.find(user => user.id === this.userId)
    }
  }
}
</script>
