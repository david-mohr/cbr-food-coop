<template>
  <q-page padding v-if="!member">
    <p>Member not found</p>
  </q-page>
  <q-page padding v-if="!!member">
    <div class="q-py-md">
      <q-field label="ID" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{ member.id }}</div>
        </template>
      </q-field>
      <q-field label="Name" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{ member.name }}</div>
        </template>
      </q-field>
      <q-field label="Email" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{ member.email }}</div>
        </template>
      </q-field>
      <q-field label="Phone" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{ member.phone }}</div>
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
                  <div class="q-pa-md">
                  <q-btn label="Renew Membership" color="primary" @click="renewMembership = true"></q-btn>
                  </div>
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
                  <div class="q-pa-md">
                  <q-btn label="Add Volunteering Hours" color="primary" @click="addVolunteering = true"></q-btn>
                  </div>
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
      <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="addVolunteering" persistent>
      <q-card style="min-width: 350px">
        <q-form
            no-error-focus
            @submit="onSubmit"
            @reset="reset"
          >
        <q-card-section>
          <div class="text-h6">Add Volunteer Hours</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text">Date</div>
          <q-input v-model ="date"
                   filled type="date"
                   autofocus @keyup.enter="addVolunteering = false"></q-input>
          <div class="text">Hours Worked</div>
          <q-input v-model="hours"
                   filled type ="number"
                   autofocus @keyup.enter="addVolunteering = false"
                   lazy-rules
                   :rules="[
                      val => val != null && val != '' || 'Please include the number of hours',
                      val => val > 0 && val <= 16 || 'Please add a reasonable number of hours']"></q-input>
          <div class="text">Volunteering Type</div>
          <q-input v-model ="activity"
                   filled type="string"
                   autofocus @keyup.enter="addVolunteering = false"></q-input>
        </q-card-section>

        <q-card-actions align="left" class="text-primary">
          <q-btn flat
                 label="Cancel"
                 type="reset"
                 v-close-popup></q-btn>
          <q-btn flat
                 type="submit"
                 label="Add Volunteer Hours"
                 v-close-popup></q-btn>
        </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
  </q-page>
</template>

<script>
import { date } from 'quasar'
import { ref } from 'vue'
// import { updateVolunteerHours } from '../../api/members.mjs'

export default {
  data () {
    return {
      // Things for Dialogue
      renewMembership: ref(false),
      addVolunteering: ref(false),
      date: ref(new Date()),
      hours: ref(1.0),
      activity: ref(null),
      // Other things.
      tab: 'status',
      memberId: this.$route.params.memberId,
      columns: [
        { name: 'Date', align: 'left', label: 'Date', field: 'datenew', sortable: true },
        { name: 'event', align: 'left', label: 'Event', field: 'action', sortable: true },
        { name: 'paid', label: 'Paid', field: 'amountpaid', sortable: true },
        { name: 'notes', align: 'left', label: 'Notes', field: 'notes', sortable: true }
      ]
    }
  },
  methods: {
    reset () {
      this.date = ref(new Date())
      this.hours = ref(1.0)
      this.activity = ref(null)
    },
    onSubmit (evt) {
      // TODO: actually add this to the database.
      console.log(this.date, this.hours, this.activity)
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Not added because I don\'t know how!'
      })
      this.reset()
    }
  },
  computed: {
    member () {
      return this.$store.state.members.members.find(member => member.id === this.memberId)
    },
    history () {
      return this.$store.state.members.memberHistory[this.memberId]
    },
    status () {
      return this.$store.state.members.memberStatus[this.memberId]
    },
    expDate () {
      return date.formatDate(this.status.membershipexpires, 'YYYY-MM-DD')
    },
    expStatus () {
      const now = new Date()
      const monthBeforeExp = date.subtractFromDate(this.status.membershipexpires, { days: 31 })
      if (now < monthBeforeExp) {
        return 'bg-positive'
      }
      if (date.isBetweenDates(now, monthBeforeExp, this.status.membershipexpires, { onlyDate: true })) {
        return 'bg-warning'
      }
      return 'bg-negative'
    },
    discountDate () {
      return date.formatDate(this.status.discvaliduntil, 'YYYY-MM-DD')
    },
    discountStatus () {
      const now = new Date()
      if (now < this.status.discvaliduntil) {
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
