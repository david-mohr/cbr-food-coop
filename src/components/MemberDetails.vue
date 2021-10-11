<template>
  <q-form class="row q-col-gutter-md">
    <div class="col-6">
      <q-input
        v-model="member.name"
        label="Name"
        :readonly="!edit"
      />
      <q-input
        v-model="member.address"
        label="Address"
        :readonly="!edit"
      />
      <q-input
        v-model="member.city"
        label="Suburb"
        :readonly="!edit"
      />
      <q-input
        v-model="member.postal"
        label="Postcode"
        :readonly="!edit"
      />
    </div>
    <div class="col-6">
      <q-field
        label="ID"
        stack-label
        readonly
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.id }}
          </div>
        </template>
      </q-field>
      <q-input
        v-model="member.email"
        label="Email"
        :readonly="!edit"
      />
      <q-input
        v-model="member.phone"
        label="Phone"
        :readonly="!edit"
      />
    </div>
  </q-form>
</template>

<script>
export default {
  props: {
    memberId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      edit: false
    }
  },
  computed: {
    member () {
      return this.$store.state.members.members.find(member => member.id === this.memberId)
    }
  }
}
</script>
