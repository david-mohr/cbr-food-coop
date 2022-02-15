<template>
  <q-page padding class="row justify-center">
    <q-form
      @submit="onSubmit"
      style="width: 100%; max-width: 500px; height: fit-content"
    >
      <q-card>
        <q-card-section>
          <div class="text-h3 q-py-md">
            New password
          </div>
        </q-card-section>
        <q-card-section>
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
            label="Save new password"
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
      const body = { password: this.password }
      try {
        await this.$api.post(`/api/forgot/${this.$route.params.token}`, body)
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Password reset'
        })
        this.$router.push({ name: 'Login' })
      } catch (err) {
        console.log(err)
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: err?.response.data?.error || 'Password reset failed'
        })
      }
    }
  }
}
</script>
