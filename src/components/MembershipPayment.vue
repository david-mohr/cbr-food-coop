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
          Renew Membership
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-select
            filled
            v-model="type"
            :options="types"
            label="Membership Type"
          />
          <q-toggle
            v-model="concession"
            label="Concession Holder"
          />
          <q-input
            v-if="concession"
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
            v-model.number="price"
            filled
            label="Amount Paid"
            type="number"
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
      required: true
    }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      concession: false,
      type: null,
      types: [
        'Single', 'Couple', 'Household', 'Philanthropic'
      ], // I would like to have this as a table in the database,
      // as I think this is likely to change in the future. The same may go for the below.
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
    }
  },
  methods: {
    reset () {
      this.date = DateTime.now().toISODate()
      this.price = null
      this.concession = false
      this.concession_type = null
    },
    async onSubmit (evt) {
      let notes = this.type
      if (this.concession) {
        notes += `: ${this.concession_type}`
      }
      // For the time being, add membership renewal into volunteer history.
      try {
        await this.$store.dispatch('members/updateHistory', {
          memberId: this.memberId,
          activity: {
            date: this.date,
            action: 'Renewed',
            paid: this.price,
            notes
          }
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

      this.reset()
      this.open = false
    }
  }
}
</script>
