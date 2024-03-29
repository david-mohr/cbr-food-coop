<template>
  <q-dialog
    v-model="open"
    persistent
  >
    <q-card style="min-width: 350px">
      <q-form
        no-error-focus
        @submit="onSubmit"
        @reset="reset"
      >
        <q-card-section class="text-h6">
          {{ memberId ? 'Renew' : 'New' }} Membership
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-select
            filled
            v-model="membership_type_id"
            :options="types"
            map-options
            emit-value
            option-value="membership_type_id"
            label="Membership Type"
            :rules="[required]"
          />
          <q-toggle
            v-model="concession"
            label="Concession Holder"
          />
          <q-select
            v-if="concession"
            v-model="concession_type"
            filled
            hide-bottom-space
            map-options
            emit-value
            option-value="id"
            label="Concession Type"
            :options="concessions"
            :rules="[required]"
          />
          <q-input
            v-model.number="price"
            filled
            label="Amount Paid"
            type="number"
            :rules="[val => Number.isFinite(val) && val > 0 || 'Too small']"
          />
        </q-card-section>

        <q-card-section>
          <q-banner class="bg-warning text-black">
            <template #avatar>
              <q-icon name="paid" />
            </template>
            Please process payment on Vend
          </q-banner>
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
            :loading="working"
            :disabled="working"
            :label="memberId ? 'Renew' : 'Create new membership'"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    memberId: {
      type: String,
      default: () => null
    },
    membership: {
      type: Object,
      default: () => null
    }
  },
  emits: ['update:modelValue', 'payment'],
  data () {
    return {
      working: false,
      concession: false,
      membership_type_id: null,
      concession_type: null,
      price: 0.0, // could be linked to renewal type by default.
      date: DateTime.now().toISODate()
    }
  },
  computed: {
    open: {
      get () {
        return this.modelValue
      },
      set (val) {
        this.$emit('update:modelValue', val)
      }
    },
    types () {
      return this.$store.state.members.types
    },
    concessions () {
      return this.$store.state.members.concessions
    }
  },
  watch: {
    modelValue (val) {
      if (!val || !this.membership) return
      // use the membership object to seed the values
      this.concession = !!this.membership.concession
      this.concession_type = this.membership.concession
      this.membership_type_id = this.membership.membership_type_id
      const plan = this.types.find(type => type.membership_type_id === this.membership.membership_type_id)
      if (plan) {
        this.price = this.concession ? plan.concession : plan.price
      }
    }
  },
  methods: {
    required (val) {
      return !!val || 'Required'
    },
    reset () {
      this.date = DateTime.now().toISODate()
      this.price = null
      this.concession = false
      this.concession_type = null
    },
    async onSubmit (evt) {
      this.working = true
      let notes = this.type
      if (this.concession) {
        notes += `: ${this.concession_type}`
      }
      const activity = {
        date: this.date,
        paid: this.price,
        notes
      }
      if (!this.memberId) return this.$emit('payment', activity)
      activity.action = 'Renewed'
      // For the time being, add membership renewal into volunteer history.
      try {
        await this.$store.dispatch('members/updateHistory', {
          memberId: this.memberId,
          activity
        })
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Membership renewed'
        })
      } catch (err) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Renewal failed'
        })
      }

      this.working = false
      this.reset()
      this.open = false
    }
  }
}
</script>
