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
            step="0.5"
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
            :loading="working"
            :disabled="working"
            label="Add Volunteer Hours"
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
      working: false,
      action: 'Volunteered',
      date: DateTime.now().toISODate(),
      hours: 1.0,
      activity: null
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
      this.hours = 1.0
      this.activity = null
    },
    async onSubmit (evt) {
      this.working = true
      // For the time being, add membership renewal into volunteer history.
      try {
        await this.$store.dispatch('members/updateHistory', {
          memberId: this.memberId,
          activity: {
            date: this.date,
            action: this.action,
            paid: this.hours,
            notes: this.activity
          }
        })
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

      this.working = false
      this.reset()
      this.open = false
    }
  }
}
</script>
