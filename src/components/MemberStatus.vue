<template>
  <div class="row q-col-gutter-md">
    <div class="col-6">
      <q-card
        bordered
        :class="expStatus"
      >
        <q-card-section>
          <div class="text-h6 text-white">
            Membership expires {{ expDate }}
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
      addVolunteering: false,
      renewMembership: false,
      date: DateTime.now().toISODate(),
      hours: 1.0,
      activity: null
    }
  },
  computed: {
    discountDate () {
      return date.formatDate(this.status.discvaliduntil, 'YYYY-MM-DD')
    },
    discountStatus () {
      const now = new Date()
      if (now < this.status.discvaliduntil) {
        return 'bg-positive'
      }
      return 'bg-negative'
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
    status () {
      return this.$store.state.members.memberStatus[this.memberId]
    }
  },
  methods: {
    reset () {
      this.date = DateTime.now().toISODate()
      this.hours = 1.0
      this.activity = null
    },
    async onSubmit (evt) {
      // TODO: actually add this to the database.
      console.log(this.date, this.hours, this.activity)
      try {
        await this.$api.post(`/api/members/${this.memberId}/history`, {
          date: this.date,
          action: 'Volunteered',
          paid: this.hours,
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
          message: 'Not Added'
        })
      }
      this.reset()
      this.addVolunteering = false
    }
  }
}
</script>
