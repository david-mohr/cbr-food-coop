<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
    <q-card class="q-pa-lg" v-for="user in users" v-bind:key="user">
      {{ user }}
    </q-card>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      users: ['1', '2', '3']
    }
  },
  async created () {
    const res = await this.$api.get('/api/members')
    console.log(res.data)
    this.users = res.data
  }
}
</script>
