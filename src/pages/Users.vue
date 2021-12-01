<template>
  <q-page
    style="margin-top: 30px"
  >
    <div class="row justify-center">
      <q-btn
        icon="add"
        label="Add"
        color="accent"
        @click="addUser = true"
      />
      <q-dialog
        v-model="addUser"
        persistent
      >
        <q-card style="min-width: 350px">
          <q-form
            no-error-focus
            @submit="onSubmit"
            @reset="reset"
          >
            <q-card-section>
              <div class="text-h6">
                New user
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="email"
                autofocus
                label="Email"
                :rules="[required, noDuplicates]"
              />
              <q-select
                v-model="role"
                label="Role"
                :options="roles"
                emit-value
                map-options
                :rules="[required]"
              />
              <q-input
                v-model="password"
                type="password"
                autofocus
                label="Password"
                :rules="[required, min8]"
              />
              <q-input
                v-model="password2"
                type="password"
                autofocus
                label="Confirm password"
                :rules="[required, passwordsMatch]"
              />
            </q-card-section>

            <q-card-actions
              align="right"
              class="text-primary"
            >
              <q-btn
                flat
                label="Cancel"
                type="reset"
                v-close-popup
              />
              <q-btn
                flat
                type="submit"
                label="Add user"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
    <div class="row justify-center q-mt-md">
      <list-with-filter
        v-slot="props"
        :items="users"
        filter-key="email"
      >
        <q-item
          v-for="user in props.items"
          :key="user.id"
          v-ripple
          clickable
          :to="{ name: 'User', params: { userId: user.id }}"
        >
          <q-item-section>
            <q-item-label>{{ user.email }}</q-item-label>
            <q-item-label caption>
              {{ user.role }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </list-with-filter>
    </div>
  </q-page>
</template>

<script>
import ListWithFilter from '../components/ListWithFilter.vue'

export default {
  components: { ListWithFilter },
  data () {
    return {
      addUser: false,
      role: null,
      email: null,
      password: null,
      password2: null,
      roles: [
        { value: 'user', label: 'User' },
        { value: 'coordinator', label: 'Coordinator' },
        { value: 'admin', label: 'Administrator' }
      ]
    }
  },
  computed: {
    users () {
      return this.$store.state.members.users
    }
  },
  async created () {
    if (!this.users.length) {
      await this.$store.dispatch('members/getUsers')
    }
  },
  methods: {
    required (val) {
      return (val && val.length > 0) || 'Required'
    },
    noDuplicates (val) {
      return !this.users.some(u => u.username === this.username) || 'Username already taken'
    },
    min8 (val) {
      return (val && val.length >= 8) || 'Minimum length is 8'
    },
    passwordsMatch (val) {
      return (val && val === this.password) || 'Passwords don\'t match'
    },
    reset () {
      this.role = null
      this.email = null
      this.password = null
      this.password2 = null
    },
    async onSubmit () {
      console.log('user', this.email, 'role', this.role)
      try {
        await this.$store.dispatch('members/addUser', {
          email: this.email,
          password: this.password,
          role: this.role
        })
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'New user created'
        })
      } catch (err) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Failed to create new user'
        })
      }
      this.addUser = false
      this.reset()
    }
  }
}
</script>
