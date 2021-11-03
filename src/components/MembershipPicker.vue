<template>
  <q-toggle
    v-model="concession"
    label="Concession"
  />
  <q-list>
    <q-item
      tag="label"
      v-ripple
    >
      <q-item-section avatar>
        <q-radio
          v-model="type"
          val="individual"
        />
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
    <q-item
      tag="label"
      v-ripple
    >
      <q-item-section avatar>
        <q-radio
          v-model="type"
          val="couple"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>Couple</q-item-label>
        <q-item-label
          v-if="concession"
          caption
        >
          Where both people hold a concession
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <b v-if="concession">$25</b>
        <b v-else>$40</b>
        /year
      </q-item-section>
    </q-item>
    <q-item
      tag="label"
      v-ripple
    >
      <q-item-section avatar>
        <q-radio
          v-model="type"
          val="household"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>Household</q-item-label>
        <q-item-label
          v-if="concession"
          caption
        >
          Majority concession holders
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <b v-if="concession">$40</b>
        <b v-else>$50</b>
        /year
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    concession: {
      get () {
        return this.modelValue?.concession
      },
      set (concession) {
        this.$emit('update:modelValue', { ...this.modelValue, concession })
      }
    },
    type: {
      get () {
        return this.modelValue?.type
      },
      set (type) {
        this.$emit('update:modelValue', { ...this.modelValue, type })
      }
    }
  },
  mounted () {
    if (Object.keys(this.modelValue).length === 0) {
      this.$emit('update:modelValue', { concession: false, type: 'individual' })
    }
  }
}
</script>
