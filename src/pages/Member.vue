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
            <q-tab
              name="status"
              label="Membership"
            />
            <q-tab
              name="history"
              label="History"
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="tab"
            animated
          >
            <q-tab-panel name="status">
              <membership-status
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
import MembershipStatus from '../components/MembershipStatus.vue'

export default {
  components: { MemberDetails, MembershipStatus },
  data () {
    return {
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
    ready () {
      return this.$store.state.members.members.length
    },
    memberId () {
      return this.$route.params.memberId
    },
    history () {
      return this.$store.state.members.memberHistory[this.memberId]
    }
  },
  async created () {
    if (!this.$store.state.members.memberHistory[this.memberId]) {
      await this.$store.dispatch('members/getHistory', this.memberId)
    }
  }
}
</script>
