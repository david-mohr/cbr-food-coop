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
                v-model="name"
                square
                filled
                type="text"
                label="Name"
                color="grey-8"
              />
              <q-input
                v-model="email"
                square
                filled
                type="email"
                label="Email"
                color="grey-8"
              />
              <q-input
                v-model="phone"
                square
                filled
                type="text"
                label="Phone"
                color="grey-8"
              />
            </q-card-section>
            <q-card-actions class="q-px-md">
              <q-btn
                unelevated
                color="primary"
                size="lg"
                class="full-width text-ardexa-black"
                label="Sign up"
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
      name: '',
      email: '',
      phone: '',
      loading: false,
      isPwd: true
    }
  },
  methods: {
    async onSubmit () {
      this.loading = true
      try {
        await this.$api.post('/api/signup', {
          name: this.name,
          email: this.email,
          phone: this.phone
        })
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Signup complete',
          caption: 'Thanks'
        })
        this.$router.push({ name: 'Thanks' })
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
