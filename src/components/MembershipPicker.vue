<template>
  <div class="row q-gutter-md">
    <q-toggle
      v-model="concession"
      label="Concession"
    />
    <q-input
      v-show="concession"
      v-model="concessionId"
      label="Concession ID"
      :rules="[val => !!val || 'Required']"
    />
  </div>
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

function makeComputed (prop) {
  return {
    [prop]: {
      get () {
        return this.modelValue?.[prop]
      },
      set (val) {
        this.$emit('update:modelValue', { ...this.modelValue, [prop]: val })
      }
    }
  }
}

export default {
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    ...makeComputed('concession'),
    ...makeComputed('concessionId'),
    ...makeComputed('type')
  },
  mounted () {
    if (Object.keys(this.modelValue).length === 0) {
      this.$emit('update:modelValue', { concession: false, type: 'individual' })
    }
  }
}
</script>
