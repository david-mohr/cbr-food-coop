<template>
  <q-page padding class="row justify-center">
    <q-form
      @submit="onSubmit"
      style="width: 100%; max-width: 500px; height: fit-content"
    >
      <q-card>
        <q-card-section>
          <q-input
            v-model="name"
            autofocus
            label="Name"
            :rules="[required]"
          />
          <q-input
            v-model="password"
            type="password"
            label="Password"
            :rules="[required, min8]"
          />
          <q-input
            v-model="password2"
            type="password"
            label="Confirm password"
            :rules="[required, passwordsMatch]"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="primary"
            type="submit"
            label="Create account"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      name: null,
      password: null,
      password2: null
    }
  },
  methods: {
    required (val) {
      return (val && val.length > 0) || 'Required'
    },
    min8 (val) {
      return (val && val.length >= 8) || 'Minimum length is 8'
    },
    passwordsMatch (val) {
      return (val && val === this.password) || 'Passwords don\'t match'
    },
    async onSubmit () {
      // accept the invite
      const body = {
        name: this.name,
        password: this.password
      }
      try {
        const res = await this.$api.post(`/api/invites/${this.$route.params.token}/accept`, body)
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Account created'
        })
        // auto-login
        console.log(res)
        this.$q.sessionStorage.set('token', res.data.token)
        this.$store.commit('members/saveToken', res.data.token)
        this.$router.push({ path: '/' })
      } catch (err) {
        console.log(err)
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Failed to accept invitation'
        })
      }
    }
  }
}
</script>
