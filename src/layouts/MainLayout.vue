<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="loggedIn"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          The Food Co-op
        </q-toolbar-title>

        <q-btn
          dense
          flat
          no-wrap
        >
          <q-avatar
            rounded
            size="36px"
            icon="account_circle"
          />
          <q-icon
            name="arrow_drop_down"
            size="16px"
          />
          <q-menu auto-close>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <div>Signed in as <strong>{{ name }}</strong></div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                @click="logout"
              >
                <q-item-section>Sign out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="loggedIn"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Members',
    caption: 'Status, details and history',
    icon: 'people',
    link: '/members'
  },
  {
    title: 'Users',
    caption: 'Coordinators and admins',
    icon: 'badge',
    link: '/users'
  },
  {
    title: 'About',
    caption: 'Info about this software',
    icon: 'info',
    link: '/about'
  }
]

export default {
  components: {
    EssentialLink
  },
  data () {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksList
    }
  },
  computed: {
    loggedIn () {
      return !!this.$store.state.members.user
    },
    name () {
      if (!this.$store.state.members.user) return null
      return this.$store.state.members.user.username
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('members/logout')
      this.$router.replace({ name: 'Login' })
    },
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    }
  }
}
</script>
