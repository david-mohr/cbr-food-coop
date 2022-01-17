<template>
  <q-page
    style="margin-top: 30px"
  >
    <div class="row justify-center">
      <q-btn
        icon="refresh"
        label="Refresh"
        color="accent"
        @click="getSignups"
      />
    </div>
    <div class="row justify-center q-mt-md">
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
    </div>
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
  created () {
    if (!this.signups.length) {
      this.getSignups()
    }
  },
  methods: {
    async getSignups () {
      await this.$store.dispatch('members/getSignups')
    }
  }
}
</script>
