<template>
  <list-with-filter v-slot="props" :items="members">
    <q-item
      v-for="member in props.items"
      :key="member.ID"
      v-ripple
      clickable
      :to="{ name: 'Member', params: { memberId: member.ID }}"
    >
      <q-item-section>{{ member.NAME }}</q-item-section>
    </q-item>
  </list-with-filter>
</template>

<script>
import ListWithFilter from '../components/ListWithFilter.vue'

export default {
  components: { ListWithFilter },
  computed: {
    members () {
      return this.$store.state.members.members
    }
  },
  async created () {
    if (!this.members.length) {
      await this.$store.dispatch('members/getMembers')
    }
  }
}
</script>
