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
    <div class="q-pa-md">
      <q-table
        title="History"
        :rows="history"
        :columns="columns"
        row-key="name"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      memberId: this.$route.params.memberId,
      columns: [
        { name: 'Date', align: 'left', label: 'Date', field: 'DATENEW', sortable: true },
        { name: 'event', align: 'left', label: 'Event', field: 'ACTION', sortable: true },
        { name: 'paid', label: 'Paid', field: 'AMOUNTPAID', sortable: true },
        { name: 'notes', align: 'left', label: 'Notes', field: 'NOTES', sortable: true }
      ]
    }
  },
  computed: {
    member () {
      return this.$store.state.members.members.find(member => member.ID === this.memberId)
    },
    history () {
      return this.$store.state.members.memberHistory[this.memberId]
    }
  },
  async created () {
    if (!this.$store.state.members.members.length) {
      await this.$store.dispatch('members/getMembers')
    }
    if (!this.$store.state.members.memberHistory[this.memberId]) {
      await this.$store.dispatch('members/getHistory', this.memberId)
    }
  }
}
</script>
