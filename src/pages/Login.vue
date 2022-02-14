<template>
  <q-page class="row justify-center items-center q-pa-md">
    <div class="row">
      <div class="col">
        <q-form
          class="q-gutter-md"
          @submit="onSubmit"
        >
          <q-card
            square
            bordered
            class="q-pa-lg shadow-1"
          >
            <template v-if="forgotComplete">
              Request sent, please check your email for next steps
            </template>
            <template v-else>
              <q-card-section>
                <q-input
                  v-model="email"
                  square
                  filled
                  type="text"
                  label="Email"
                  color="grey-8"
                />
                <q-input
                  v-if="!forgot"
                  v-model="password"
                  square
                  filled
                  :type="isPwd ? 'password' : 'text'"
                  label="Password"
                  color="grey-8"
                >
                  <template #append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn
                  unelevated
                  color="primary"
                  size="lg"
                  class="full-width text-ardexa-black"
                  :label="forgot ? 'Reset password' : 'Login'"
                  type="submit"
                  :loading="loading"
                />
              </q-card-actions>
              <q-card-actions class="q-px-md row justify-end">
                <q-btn
                  flat
                  size="sm"
                  :label="forgot ? 'Back to login' : 'Forgot password'"
                  @click="forgot = !forgot"
                />
              </q-card-actions>
            </template>
          </q-card>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      forgot: false,
      forgotComplete: false,
      email: '',
      password: '',
      loading: false,
      isPwd: true
    }
  },
  methods: {
    async onSubmit () {
      this.loading = true
      if (this.forgot) {
        try {
          await this.$api.post('/api/forgot', { email: this.email })
          this.forgotComplete = true
        } catch (err) {
          console.log(err)
          console.log(err.response.data.error)
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'error',
            message: err.response.data.error
          })
        }
        this.loading = false
        return
      }
      try {
        await this.$store.dispatch('members/login', {
          email: this.email,
          password: this.password
        })
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Logged in'
        })
        this.$router.push({ path: '/' })
      } catch (err) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Login failed'
        })
      }
      this.loading = false
    }
  }
}
</script>

<style>
.q-card {
  width: 360px;
}
</style>
