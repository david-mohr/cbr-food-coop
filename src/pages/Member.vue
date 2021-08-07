<template>
  <q-page padding v-if="!member">
    <p>Member not found</p>
  </q-page>
  <q-page padding v-if="!!member">
    <div class="q-py-md">
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
    </div>
    <div class="q-py-md">
      <q-card style="width: 100%">
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
            <div v-if="!status">
              <q-spinner color="primary" size="3em" />
            </div>
            <div class="q-pa-md" v-if="!!status">
              <div class="row q-col-gutter-md">
                <div class="col">
                  <q-card bordered :class="expStatus">
                    <q-card-section>
                      <div class="text-h6">Membership expires</div>
                    </q-card-section>
                    <q-separator inset />
                    <q-card-section>
                      <div class="text-h6">{{ expDate }}</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col">
                  <q-card bordered :class="discountStatus">
                    <q-card-section>
                      <div class="text-h6">Discount valid until</div>
                    </q-card-section>
                    <q-separator inset />
                    <q-card-section>
                      <div class="text-h6">{{ discountDate }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
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
  </q-page>
</template>

<script>
import { date } from 'quasar'

export default {
  data () {
    return {
      tab: 'status',
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
    },
    status () {
      return this.$store.state.members.memberStatus[this.memberId]
    },
    expDate () {
      return date.formatDate(this.status.MEMBERSHIPEXPIRES, 'YYYY-MM-DD')
    },
    expStatus () {
      const now = new Date()
      const monthBeforeExp = date.subtractFromDate(this.status.MEMBERSHIPEXPIRES, { days: 31 })
      if (now < monthBeforeExp) {
        return 'bg-positive'
      }
      if (date.isBetweenDates(now, monthBeforeExp, this.status.MEMBERSHIPEXPIRES, { onlyDate: true })) {
        return 'bg-warning'
      }
      return 'bg-negative'
    },
    discountDate () {
      return date.formatDate(this.status.DISCVALIDUNTIL, 'YYYY-MM-DD')
    },
    discountStatus () {
      const now = new Date()
      if (now < this.status.DISCVALIDUNTIL) {
        return 'bg-positive'
      }
      return 'bg-negative'
    }
  },
  async created () {
    if (!this.$store.state.members.members.length) {
      await this.$store.dispatch('members/getMembers')
    }
    if (!this.$store.state.members.memberHistory[this.memberId]) {
      await this.$store.dispatch('members/getHistory', this.memberId)
    }
    if (!this.$store.state.members.memberStatus[this.memberId]) {
      await this.$store.dispatch('members/getStatus', this.memberId)
    }
  }
}
</script>
