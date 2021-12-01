<template>
  <q-page>
    <div class="text-h2 text-center">
      Application for Membership
    </div>
    <div class="text-h4 text-center">
      of The Food Co-op Shop Canberra.
    </div>
    <div class="q-pa-md row justify-center">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        style="width: 100%; max-width: 800px"
      >
        <q-step
          :name="1"
          title="What we're about"
          icon="favorite"
          :done="step > 1"
        >
          We’re pleased and excited that you are interested in joining The Food
          Co-op in Canberra as a Member!

          We are a community owned-and-run bulk grocery store and cafe, events
          venue and community hub in central Canberra who believes in the
          supply of food for people and the planet, not for profit

          According to our constitution, the primary activity of the Co-op is
          to trade in food and other items that promote our objectives, which
          are:
          <ul>
            <li>to provide where possible, food in bulk (i.e. without packaging), at an affordable price</li>
            <li>to encourage participation in the running of the Co-operative</li>
            <li>to provide a supportive environment for employees, Co-ordinators, Working Members and Members</li>
            <li>to promote organic produce</li>
            <li>to encourage and support the production of local produce</li>
            <li>to promote healthy, happy, sustainable and environmentally friendly living in the region</li>
            <li>to promote environmental sustainability and</li>
            <li>to inspire and encourage community participation and involvement in these aims</li>
          </ul>

          Please fill out the following form to apply for Membership.  Your
          application will be tabled at the next regular Board meeting for
          approval, however you are eligible to receive your Member’s discount
          immediately!
        </q-step>
        <q-step
          :name="2"
          title="Membership"
          icon="shopping_cart"
          :done="step > 2"
        >
          <membership-picker v-model="membership" />
        </q-step>
        <q-step
          :name="3"
          title="Your details"
          icon="badge"
          :done="step > 3"
        >
          <q-form
            ref="member"
            autofocus
            @submit="$refs.stepper.next()"
          >
            <div class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="firstname"
                    hide-bottom-space
                    type="text"
                    label="First name"
                    color="grey-8"
                    :rules="[required]"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="lastname"
                    hide-bottom-space
                    type="text"
                    label="Last name"
                    color="grey-8"
                    :rules="[required]"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="email"
                    hide-bottom-space
                    type="email"
                    label="Email"
                    color="grey-8"
                    :rules="[validEmail]"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="phone"
                    type="text"
                    label="Phone"
                    color="grey-8"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="suburb"
                    type="text"
                    label="Suburb"
                    color="grey-8"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="postcode"
                    hide-bottom-space
                    type="text"
                    label="Postcode"
                    color="grey-8"
                    :rules="[validPostcode]"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-step>
        <q-step
          :name="4"
          title="Review"
          icon="face"
        >
          Is this correct?
          <div style="max-width: 350px">
            <static-key-val label="Name" :value="firstname + ' ' + lastname" />
            <static-key-val label="Membership" :value="membership.type + (membership.concession ? ` (${membership.concessionType})` : '')" />
            <static-key-val label="Email" :value="email" />
            <static-key-val label="Phone" :value="phone" />
            <static-key-val label="Address" :value="suburb + ' ' + postcode" />
          </div>
        </q-step>
        <template #navigation>
          <q-stepper-navigation>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="step > 1"
                flat
                color="primary"
                @click="$refs.stepper.previous()"
                label="Back"
                class="q-ml-sm"
              />
              <q-space />
              <!--
              <q-toggle
                v-if="step === 4"
                v-model="sendemails"
                left-label
                label="I consent to receive emails from the Food Co-op"
              />
              -->
              <q-btn
                @click="doStep()"
                color="primary"
                :disable="loading || step === 2 && membership.concession && !membership.concessionType"
                :loading="loading"
                :label="step === 4 ? 'Finish' : 'Continue'"
              />
            </div>
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </q-page>
</template>

<script>
import MembershipPicker from '../components/MembershipPicker.vue'
import StaticKeyVal from '../components/StaticKeyVal.vue'

export default {
  components: { MembershipPicker, StaticKeyVal },
  data () {
    return {
      step: 1,
      membership: {},
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      suburb: '',
      postcode: '',
      sendemails: true,
      loading: false
    }
  },
  methods: {
    async completeSignup () {
      this.loading = true
      try {
        await this.$api.post('/api/signup', {
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          phone: this.phone,
          suburb: this.suburb,
          postcode: this.postcode,
          membership: this.membership.type,
          concession: this.membership.concessionType,
          sendemails: this.sendemails
        })
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Signup complete',
          caption: 'Thanks'
        })
        this.$router.push({ name: 'Thanks' })
      } catch (err) {
        console.log(err)
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Signup failed'
        })
      }
      this.loading = false
    },
    validPostcode (val) {
      return /^[0-9]{4}$/.test(val) || 'Invalid postcode'
    },
    validEmail (val) {
      return /^[^\s@]+@[^\s@]+(\.[^\s@]+)+$/.test(val) || 'Invalid email'
    },
    required (val) {
      return !!val || 'Required'
    },
    doStep () {
      if (this.step <= 2) return this.$refs.stepper.next()
      if (this.step === 3) return this.$refs.member.submit()
      this.completeSignup()
    }
  }
}
</script>
