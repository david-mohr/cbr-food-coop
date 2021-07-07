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
            <q-card-section>
              <q-input
                v-model="username"
                square
                filled
                type="text"
                label="username"
                color="grey-8"
              />
              <q-input
                v-model="password"
                square
                filled
                :type="isPwd ? 'password' : 'text'"
                label="password"
                color="grey-8"
              >
                <template v-slot:append>
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
                label="Login"
                type="submit"
                :loading="loading"
              />
            </q-card-actions>
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
      username: '',
      password: '',
      loading: false,
      isPwd: true
    }
  },
  methods: {
    async onSubmit () {
      this.loading = true
      try {
        await this.$store.dispatch('members/login', {
          username: this.username,
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
