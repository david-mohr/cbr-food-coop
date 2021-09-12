<template>
  <q-page>
    <div class="text-h2 text-center">Application for Membership</div>
    <div class="text-h4 text-center">of The Food Co-operative Shop Ltd.</div>
    <div class="q-pa-md">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
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
          <q-toggle v-model="concession" label="Concession" />
            <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-radio v-model="membershipType" val="individual" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Individual</q-item-label>
              </q-item-section>
              <q-item-section side>
                <b v-if="concession">$15</b>
                <b v-else>$25</b>
                /year
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-radio v-model="membershipType" val="couple" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Couple</q-item-label>
                <q-item-label v-if="concession" caption>Where both people hold a concession</q-item-label>
              </q-item-section>
              <q-item-section side>
                <b v-if="concession">$25</b>
                <b v-else>$40</b>
                /year
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-radio v-model="membershipType" val="household" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Household</q-item-label>
                <q-item-label v-if="concession" caption>Majority concession holders</q-item-label>
              </q-item-section>
              <q-item-section side>
                <b v-if="concession">$40</b>
                <b v-else>$50</b>
                /year
              </q-item-section>
            </q-item>
          </q-list>
        </q-step>
        <q-step
          :name="3"
          title="Your details"
          icon="badge"
          :done="step > 3"
        >
          <q-form
            class="q-gutter-md"
            @submit="onSubmit"
          >
            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-12">
                <q-input
                  v-model="name"
                  type="text"
                  label="Name"
                  color="grey-8"
                />
                <q-input
                  v-model="email"
                  type="email"
                  label="Email"
                  color="grey-8"
                  :rules="[validEmail]"
                />
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
                <q-input
                  v-model="postcode"
                  type="text"
                  label="Postcode"
                  color="grey-8"
                  :rules="[validPostcode]"
                />
              </div>
            </div>
          </q-form>
        </q-step>
        <q-step
          :name="4"
          title="Additional info"
          icon="face"
        >
          <p>What is your age? 18-25yrs; 25-35 yrs; 35-45yrs; 45-60yrs; 60-70yrs; 70+yrs</p>
          <p>How long have you been a resident of the ACT? (yrs)</p>
          <p>Did/does your family speak a language other than English at home?</p>
          <p>Are you a parent of a child/children under 10yrs?</p>
          <p>What is your gender?</p>
          <p>Do you have a disability or any other accessibility needs?</p>
        </q-step>
        <template v-slot:navigation>
          <q-stepper-navigation>
            <div class="row">
              <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back" class="q-ml-sm" />
              <q-space />
              <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 4 ? 'Finish' : 'Continue'" />
            </div>
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      step: 1,
      concession: false,
      membershipType: 'individual',
      name: '',
      email: '',
      phone: '',
      suburb: '',
      postcode: '',
      loading: false,
      isPwd: true
    }
  },
  methods: {
    async onSubmit () {
      this.loading = true
      try {
        await this.$api.post('/api/signup', {
          name: this.name,
          email: this.email,
          phone: this.phone
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
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Login failed'
        })
      }
      this.loading = false
    },
    validPostcode (val) {
      return /^[0-9]{4}$/.test(val) || 'Invalid postcode'
    },
    validEmail (val) {
      return /^[^\s@]+@[^\s@]+(\.[^\s@]+)+$/.test(val) || 'Invalid email'
    }
  }
}
</script>
