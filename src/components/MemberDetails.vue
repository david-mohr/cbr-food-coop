<template>
  <q-form class="row q-col-gutter-md">
    <div class="col-6">
      <q-field
        label="Name"
        stack-label
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.name }}
          </div>
        </template>
      </q-field>
      <q-field
        label="Address"
        stack-label
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.address }}
          </div>
        </template>
      </q-field>
      <q-field
        label="Suburb"
        stack-label
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.city }}
          </div>
        </template>
      </q-field>
      <q-field
        label="Suburb"
        stack-label
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.postal }}
          </div>
        </template>
      </q-field>
    </div>
    <div class="col-6">
      <q-field
        label="ID"
        stack-label
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
      <q-field
        label="Email"
        stack-label
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.email }}
          </div>
        </template>
      </q-field>
      <q-field
        label="Phone"
        stack-label
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.phone }}
          </div>
        </template>
      </q-field>
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
