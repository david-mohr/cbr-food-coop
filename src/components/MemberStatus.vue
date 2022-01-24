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
      </q-card>
      <membership-payment
        v-model="renewMembership"
        :member-id="memberId"
      />
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
      </q-card>
      <volunteer-hours
        v-model="addVolunteering"
        :member-id="memberId"
      />
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
import MembershipPayment from './MembershipPayment.vue'
import VolunteerHours from './VolunteerHours.vue'

export default {
  components: { MembershipPayment, VolunteerHours },
  props: {
    memberId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      addVolunteering: false,
      renewMembership: false
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
  }
}
</script>
