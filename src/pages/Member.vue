<template>
  <q-page padding v-if="!member">
    <p>Member not found</p>
  </q-page>
  <q-page padding v-if="!!member">
    <q-field label="ID" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{ member.ID }}</div>
      </template>
    </q-field>
    <q-field label="Name" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{ member.NAME }}</div>
      </template>
    </q-field>
    <q-field label="Email" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{ member.EMAIL }}</div>
      </template>
    </q-field>
    <q-field label="Phone" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{ member.PHONE }}</div>
      </template>
    </q-field>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      memberId: this.$route.params.memberId
    }
  },
  computed: {
    member () {
      return this.$store.state.members.members.find(member => member.ID === this.memberId)
    }
  },
  async created () {
    if (!this.$store.state.members.members.length) {
      await this.$store.dispatch('members/getMembers')
    }
  }
}
</script>
