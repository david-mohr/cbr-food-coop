<template>
  <q-spinner v-if="!signup" size="40px" />
  <q-page
    v-else
    class="q-pa-md"
  >
    <div class="text-h3 q-my-md">
      Membership request
    </div>
    <q-input
      v-model="membershipTypeLabel"
      label="Membership type"
      :readonly="true"
    />
    <div class="row q-col-gutter-md q-pt-lg">
      <div class="col row">
        <q-btn
          color="negative"
          label="Delete request"
          @click="deleteRequest"
        />
        <q-space />
        <q-btn
          v-if="duplicateEmails"
          color="grey"
          disable="true"
          label="Duplicated Email"
        />
        <q-btn
          v-else-if="missingVendIds"
          :label="vendLabel"
          :loading="working.vend"
          :disable="working.vend"
          @click="createVend"
        />
        <q-btn
          v-else
          color="primary"
          label="Membership payment"
          @click="membershipPayment = true"
        />
      </div>
    </div>
    <membership-payment
      v-model="membershipPayment"
      :membership="membership"
      @payment="createMember"
    />
    <h4 class="q-mb-md">
      Members
    </h4>
    <div
      v-for="member in signup.members"
      :key="member.id"
      class="row q-col-gutter-md"
    >
      <div class="col-12 text-h5 q-mt-md">
        {{ member.firstname + ' ' + member.lastname }}
      </div>
      <div class="col-6">
        <q-input
          v-model="member.phone"
          label="Phone"
          :readonly="true"
        />
        <q-input
          v-model="member.suburb"
          label="Suburb"
          :readonly="true"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model="member.email"
          label="Email"
          :readonly="true"
        />
        <q-input
          v-model="member.postcode"
          label="Postcode"
          :readonly="true"
        />
      </div>
      <q-dialog
        v-model="alert"
      >
        <q-card>
          <q-card-section>
            <div class="text-h6">
              Duplicated Email
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            The email address given by this member already exists in our database!
            This should be renewed, rather than adding a new membership.
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="OK"
              color="primary"
              @click="confirm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import MembershipPayment from '../components/MembershipPayment.vue'

export default {
  components: { MembershipPayment },
  data () {
    return {
      membershipPayment: false,
      working: {},
      confirmed: false
    }
  },
  computed: {
    alert () {
      return this.duplicateEmails && !this.confirmed
    },
    duplicateEmails () {
      console.log(this.$store.state.members[0])
      return this.signup.members.some(m =>
        this.$store.state.members.members.some(mm => mm.email === m.email))
    },
    missingVendIds () {
      return this.signup.members.some(m => !m.vend_id)
    },
    membershipTypeLabel () {
      return this.membershipType?.label
    },
    membershipType () {
      return this.$store.state.members.types?.find(t => t.membership_type_id === this.signup.membership_type_id)
    },
    vendLabel () {
      return 'Create Vend account' + (this.signup.members?.length > 1 ? 's' : '')
    },
    signupId () {
      return parseInt(this.$route.params.signupId, 10)
    },
    signup () {
      return this.$store.state.members.signups.find(s => s.id === this.signupId)
    },
    membership () {
      return {
        concession: this.signup.concession,
        membership_type_id: this.signup.membership_type_id
      }
    }
  },
  async created () {
    this.$store.dispatch('members/getMembershipTypes')
    if (!this.$store.state.members.signups.length) {
      await this.$store.dispatch('members/getSignups')
    }
  },
  methods: {
    async createVend () {
      this.working.vend = true
      try {
        const res = await this.$api.post(`/api/signups/${this.signup.id}/vend`, {}, {
          headers: {
            authorization: 'Bearer ' + this.$store.state.members.token
          }
        })
        this.$store.commit('members/addVendId', {
          signupId: this.signup.id,
          vendIds: res.data
        })
      } catch (err) {
        console.log(err)
      }
      this.working.vend = false
    },
    async createMember (payment) {
      try {
        const res = await this.$api.post(`/api/signups/${this.signup.id}/member`, payment, {
          headers: {
            authorization: 'Bearer ' + this.$store.state.members.token
          }
        })
        for (const member of res.data.members) {
          this.$store.commit('members/updateMemberDetails', member)
        }
        this.$store.commit('members/updateMembership', res.data)
        this.$store.dispatch('members/getSignups')
        this.membershipPayment = false
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'New member created'
        })
        this.$router.push({ name: 'Members' })
      } catch (err) {
        console.log(err)
      }
    },
    deleteRequest () {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Are you sure?',
        cancel: true,
        ok: { color: 'negative', label: 'Delete' }
      })
        .onOk(async () => {
          await this.$api.delete(`/api/signups/${this.signup.id}`, {
            headers: {
              authorization: 'Bearer ' + this.$store.state.members.token
            }
          })
          this.$store.dispatch('members/getSignups')
          this.$router.push({ name: 'View signups' })
        })
    },
    confirm () { this.confirmed = true }
  }
}
</script>
