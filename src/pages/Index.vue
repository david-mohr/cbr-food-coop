<template>
  <q-page
    class="flex justify-center"
    style="margin-top: 30px"
  >
    <list-with-filter
      v-slot="props"
      :items="members"
    >
      <q-item
        v-for="member in props.items"
        :key="member.id"
        v-ripple
        clickable
        :to="{ name: 'Member', params: { memberId: member.id }}"
      >
        <q-item-section>{{ member.name }}</q-item-section>
      </q-item>
    </list-with-filter>
  </q-page>
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
