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
        label="Membership #"
        stack-label
        readonly
      >
        <template #control>
          <div
            class="self-center full-width no-outline"
            tabindex="0"
          >
            {{ member.membership_id }}
          </div>
        </template>
      </q-field>
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
      <div class="q-pt-lg row justify-end q-gutter-sm">
        <template v-if="edit">
          <q-btn
            label="Cancel"
            :disable="saving"
            @click="cancel"
          />
          <q-btn
            color="primary"
            :working="saving"
            :disable="saving"
            label="Save"
            @click="save"
          />
        </template>
        <template v-else>
          <q-btn
            label="Edit member details"
            @click="edit = true"
          />
        </template>
      </div>
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
      saving: false,
      edit: false,
      member: {}
    }
  },
  mounted () {
    this.member = { ...this.$store.state.members.members.find(member => member.id === this.memberId) }
  },
  methods: {
    cancel () {
      this.edit = false
      this.member = { ...this.$store.state.members.members.find(member => member.id === this.memberId) }
    },
    async save () {
      try {
        this.saving = true
        await this.$store.dispatch('members/updateMemberDetails', this.member)
        this.member = { ...this.$store.state.members.members.find(member => member.id === this.memberId) }
        this.edit = false
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Member details updated'
        })
      } catch (err) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Update failed'
        })
      }
      this.saving = false
    }
  }
}
</script>
