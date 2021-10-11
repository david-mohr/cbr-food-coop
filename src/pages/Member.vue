<template>
  <q-page padding>
    <template v-if="!memberId">
      <p>Member not found</p>
    </template>
    <template v-else-if="!ready">
      <q-spinner size="2rem" />
    </template>
    <template v-else>
      <div class="q-py-md row">
        <member-details
          :member-id="memberId"
          class="col"
        />
      </div>
      <div class="q-py-md row">
        <q-card class="col">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="status" label="Status" />
            <q-tab name="history" label="History" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="status">
              <member-status
                :member-id="memberId"
              />
            </q-tab-panel>
            <q-tab-panel name="history">
              <div class="q-pa-md">
                <q-table
                  title="History"
                  :rows="history"
                  :columns="columns"
                  row-key="name"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </template>
  </q-page>
</template>

<script>
import MemberDetails from '../components/MemberDetails.vue'
import MemberStatus from '../components/MemberStatus.vue'

export default {
  components: { MemberDetails, MemberStatus },
  data () {
    return {
      ready: false,
      tab: 'status',
      columns: [
        { name: 'Date', align: 'left', label: 'Date', field: 'datenew', sortable: true },
        { name: 'event', align: 'left', label: 'Event', field: 'action', sortable: true },
        { name: 'paid', label: 'Paid', field: 'amountpaid', sortable: true },
        { name: 'notes', align: 'left', label: 'Notes', field: 'notes', sortable: true }
      ]
    }
  },
  computed: {
    memberId () {
      return this.$route.params.memberId
    },
    history () {
      return this.$store.state.members.memberHistory[this.memberId]
    }
  },
  async created () {
    const promises = []
    if (!this.$store.state.members.members.length) {
      promises.push(this.$store.dispatch('members/getMembers'))
    }
    if (!this.$store.state.members.memberHistory[this.memberId]) {
      promises.push(this.$store.dispatch('members/getHistory', this.memberId))
    }
    if (!this.$store.state.members.memberStatus[this.memberId]) {
      promises.push(this.$store.dispatch('members/getStatus', this.memberId))
    }
    await Promise.all(promises)
    this.ready = true
  }
}
</script>
