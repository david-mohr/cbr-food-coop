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
        <q-item-section avatar>
          <q-avatar
            rounded
            :color="discColour(member)"
            text-color="white"
            font-size="small"
          >
            {{ discStatus(member) }}%
          </q-avatar>
        </q-item-section>
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
    },
    now () {
      return new Date()
    }
  },
  methods: {
    membership: function (id) {
      return this.$store.getters['members/membershipLookup'][id]
    },
    discStatus: function (member) {
      const now = new Date()
      const membershipExp = new Date(member?.expires)
      const volDiscExp = new Date(member?.discvaliduntil)
      return ((now < membershipExp) ? ((now < volDiscExp) ? 20 : 5) : 0)
    },
    discColour: function (id) {
      return this.discStatus(id) > 5 ? 'green' : this.discStatus(id) > 0 ? 'orange' : 'red'
    }
  },
  async created () {
    if (!this.members.length) {
      await this.$store.dispatch('members/getMembers')
    }
  }
}
</script>
