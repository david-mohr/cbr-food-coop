<template>
  <div class="row q-gutter-md">
    <q-toggle
      v-model="concession"
      label="Concession"
    />
    <q-select
      v-show="concession"
      v-model="concessionType"
      map-options
      emit-value
      option-value="id"
      :options="concessions"
      label="Concession Type"
      :rules="[val => !!val || 'Required']"
      style="width: 150px"
    />
  </div>
  <q-list>
    <q-item
      v-for="memberType in memberTypes"
      :key="memberType.id"
      tag="label"
      v-ripple
    >
      <q-item-section avatar>
        <q-radio
          v-model="type"
          :val="memberType.id"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ memberType.label }}</q-item-label>
        <q-item-label
          v-if="concession && memberType.concessionCaption"
          caption
        >
          {{ memberType.concessionCaption }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <b v-if="concession">${{ memberType.concession }}</b>
        <b v-else>${{ memberType.cost }}</b>
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
    ...makeComputed('concessionType'),
    ...makeComputed('type'),
    memberTypes () {
      return this.$store.state.members.types
    },
    concessions () {
      return this.$store.state.members.concessions
    }
  },
  mounted () {
    if (Object.keys(this.modelValue).length === 0) {
      this.$emit('update:modelValue', { concession: false, type: 'single' })
    }
  }
}
</script>
