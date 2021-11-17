<template>
  <q-spinner v-if="!signup" size="40px" />
  <q-page
    v-else
    class="q-pa-md"
    style="margin-top: 30px"
  >
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-input
          v-model="signup.firstname"
          label="First name"
          :readonly="true"
        />
        <q-input
          v-model="signup.phone"
          label="Phone"
          :readonly="true"
        />
        <q-input
          v-model="signup.suburb"
          label="Suburb"
          :readonly="true"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model="signup.lastname"
          label="Last name"
          :readonly="true"
        />
        <q-input
          v-model="signup.email"
          label="Email"
          :readonly="true"
        />
        <q-input
          v-model="signup.postcode"
          label="Postcode"
          :readonly="true"
        />
      </div>
    </div>
    <div class="row q-col-gutter-md q-pt-lg">
      <div class="col row justify-end">
        <q-btn
          label="Create Vend account"
          @click="createVend"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  computed: {
    signupId () {
      return parseInt(this.$route.params.signupId, 10)
    },
    signup () {
      return this.$store.state.members.signups.find(s => s.id === this.signupId)
    }
  },
  async created () {
    if (!this.$store.state.members.signups.length) {
      await this.$store.dispatch('members/getSignups')
    }
  },
  methods: {
    async createVend () {
      try {
        const res = await this.$api.post(`/api/signups/${this.signup.id}/vend`, {}, {
          headers: {
            authorization: 'Bearer ' + this.$store.state.members.token
          }
        })
        this.$store.commit('members/addVendId', {
          signupId: this.signup.id,
          vendid: res.data.vendid
        })
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>
