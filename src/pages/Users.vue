<template>
  <list-with-filter v-slot="props" :items="users" filter-key="username">
    <q-item
      v-for="user in props.items"
      :key="user.id"
      v-ripple
      clickable
      :to="{ name: 'User', params: { userId: user.id }}"
    >
      <q-item-section>
        <q-item-label>{{ user.username }}</q-item-label>
        <q-item-label caption>{{ user.role }}</q-item-label>
      </q-item-section>
    </q-item>
  </list-with-filter>
</template>

<script>
import ListWithFilter from '../components/ListWithFilter.vue'

export default {
  components: { ListWithFilter },
  computed: {
    users () {
      return this.$store.state.members.users
    }
  },
  async created () {
    if (!this.users.length) {
      await this.$store.dispatch('members/getUsers')
    }
  }
}
</script>
