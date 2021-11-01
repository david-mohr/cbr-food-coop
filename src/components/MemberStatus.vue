<template>
  <div class="row q-col-gutter-md">
    <div class="col-6">
      <q-card
        bordered
        :class="expStatus"
      >
        <q-card-section>
          <div class="text-h6 text-white">
            Membership valid until {{ expDate }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            text-color="white"
            label="Renew Membership"
            @click="renewMembership = true"
          />
        </q-card-actions>
        <q-dialog
          v-model="renewMembership"
          persistent
        >
          <q-card style="min-width: 350px">
            <q-form
              no-error-focus
              @submit="onSubmit"
              @reset="reset"
            >
              <q-card-section class="text-h6">
                Renew Membership
              </q-card-section>
              <q-card-section class="q-pt-none q-gutter-y-md">
                <q-select
                  filled
                  v-model="renewal_type"
                  :options="renewal_types"
                  label="Membership Type"
                />
                <q-toggle
                  v-model="renewal_concession"
                  label="Concession Holder"
                />
                <q-input
                  v-if="renewal_concession"
                  v-model="concession_type"
                  filled
                  hide-bottom-space
                  label="Concession Type"
                  type="string"
                  :rules="[
                    val => val != null && val != '' || 'Please provide a valid concession type.'
                  ]"
                />
                <q-input
                  v-model="renewal_price"
                  filled
                  label="Amount Paid"
                  type="number"
                />
                <q-input
                  v-model="renewal_receipt"
                  filled
                  label="Vend receipt number"
                  type="string"
                />
              </q-card-section>

              <q-card-actions
                align="left"
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
                  label="Submit Renewal"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>
      </q-card>
    </div>
    <div class="col-6">
      <q-card
        bordered
        :class="discountStatus"
      >
        <q-card-section>
          <div class="text-h6 text-white">
            Discount valid until {{ discountDate }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Add Volunteering Hours"
            text-color="white"
            @click="addVolunteering = true"
          />
        </q-card-actions>
        <q-dialog
          v-model="addVolunteering"
          persistent
        >
          <q-card style="min-width: 350px">
            <q-form
              no-error-focus
              @submit="onSubmit"
              @reset="reset"
            >
              <q-card-section class="text-h6">
                Add Volunteer Hours
              </q-card-section>
              <q-card-section class="q-pt-none q-gutter-y-md">
                <q-input
                  v-model="date"
                  filled
                  label="Date"
                  type="date"
                />
                <q-input
                  v-model.number="hours"
                  filled
                  hide-bottom-space
                  label="Hours Worked"
                  type="number"
                  :rules="[
                    val => val != null && val != '' || 'Please include the number of hours',
                    val => val > 0 && val <= 16 || 'Please add a reasonable number of hours'
                  ]"
                />
                <q-input
                  v-model="activity"
                  filled
                  label="Volunteering Type"
                  type="string"
                />
              </q-card-section>

              <q-card-actions
                align="left"
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
                  label="Add Volunteer Hours"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>
      </q-card>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
import { DateTime } from 'luxon'

export default {
  props: {
    memberId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      action: 'Volunteered',
      renewal_concession: false,
      renewal_type: null,
      renewal_types: [
        'Single', 'Couple', 'Household', 'Philanthropic'
      ], // I would like to have this as a table in the database,
      // as I think this is likely to change in the future. The same may go for the below.
      concession_type: null,
      renewal_price: 0.0, // could be linked to renewal type by default.
      renewal_receipt: null, // to be phased out with vend integration.
      addVolunteering: false,
      renewMembership: false,
      date: DateTime.now().toISODate(),
      hours: 1.0,
      activity: null
    }
  },
  computed: {
    discountDate () {
      return date.formatDate(this.status.discvaliduntil, 'DD-MM-YYYY')
    },
    discountStatus () {
      const now = new Date()
      if (now < this.status.discvaliduntil) {
        return 'bg-positive'
      }
      return 'bg-negative'
    },
    expDate () {
      return date.formatDate(this.status.membershipexpires, 'DD-MM-YYYY')
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
    status () {
      return this.$store.state.members.memberStatus[this.memberId]
    }
  },
  methods: {
    reset () {
      this.date = DateTime.now().toISODate()
      this.hours = 1.0
      this.activity = null
      this.renewal_receipt = null
      this.renewal_price = null
      this.renewal_receipt = null
      this.renewal_concession = false
      this.concession_type = null
    },
    async onSubmit (evt) {
      console.log(this.date, this.hours, this.activity, this.renewMembership)

      if (this.renewMembership) {
        // Populate or update necessary fields for adding to member history.
        this.action = 'Renewed'
        this.hours = this.renewal_price
        this.activity = this.renewal_receipt
      }

      console.log(this.date, this.action, this.hours, this.activity)

      // For the time being, add membership renewal into volunteer history.
      try {
        await this.$api.post(`/api/members/${this.memberId}/history`, {
          date: this.date,
          action: this.action,
          paid: Number(this.hours),
          notes: this.activity
        }, {
          headers: {
            authorization: 'Bearer ' + this.$store.state.members.token
          }
        })
        await this.$store.dispatch('members/getHistory', this.memberId)
        await this.$store.dispatch('members/getStatus', this.memberId)
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Hours added'
        })
      } catch (err) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Hours Not Added'
        })
      }

      this.reset()
      this.addVolunteering = false
      this.renewMembership = false
    }

  }
}
</script>
