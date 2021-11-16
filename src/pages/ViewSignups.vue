<template>
  <q-page
    class="flex justify-center"
    style="margin-top: 30px"
  >
    <list-with-filter
      v-slot="props"
      :items="signups"
    >
      <q-item
        v-for="signup in props.items"
        :key="signup.id"
        v-ripple
        clickable
        :to="{ name: 'Process signup', params: { signupId: signup.id }}"
      >
        <q-item-section>{{ signup.name }}</q-item-section>
      </q-item>
    </list-with-filter>
  </q-page>
</template>

<script>
import ListWithFilter from '../components/ListWithFilter.vue'

export default {
  components: { ListWithFilter },
  computed: {
    signups () {
      return this.$store.state.members.signups
    }
  },
  async created () {
    if (!this.signups.length) {
      await this.$store.dispatch('members/getSignups')
    }
  }
}
</script>
