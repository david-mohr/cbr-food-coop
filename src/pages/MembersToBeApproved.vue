<template>
  <q-page>
    <div class="text-h4 text-center">
      Members to be approved
    </div>
    <div class="q-pa-md">
      <q-table
        title="Members to be Approved"
        :rows="memberList"
        :columns="columns"
        selection="multiple"
        v-model:selected="selected"
        :pagination="pagination"
      />
      <q-btn
        v-if="selected.length"
        colour="primary"
        label="Generate Approval Sheet for Selected Members"
        @click="approvalSheet = true"
      >
        <q-tooltip> Creates a temporary approval-sheet to be approved straight away.</q-tooltip>
      </q-btn>
    </div>
  </q-page>
  <q-dialog v-model="approvalSheet">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Approval Sheet
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section
        style="max-height: 40vh"
        width="40vh"
        class="scroll"
      >
        <q-table
          :rows="selected"
          :columns="columns"
          :pagination="pagination"
        />
      </q-card-section>
      <q-separator />
      <q-input
        v-model="signedby1"
        filled
        label="First Board-member Signing"
        type="string"
        :rules="[val => val != null && val != '' || 'A board member must sign here.']"
      />
      <q-input
        v-model="signedby2"
        filled
        label="Second Board-member Signing"
        type="string"
        :rules="[val => val != null && val != '' || 'A board member must sign here.']"
      />
      <q-input
        v-model="notes"
        filled
        label="Notes"
        type="string"
      />

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          v-close-popup
        />
        <q-btn
          flat
          label="Approve"
          color="primary"
          @click="submitApprovalSheet"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  data () {
    return {
      working: false,
      selected: [],
      approvalSheet: false,
      date: DateTime.now().toISODate(),
      signedby1: null,
      signedby2: null,
      notes: null
    }
  },
  computed: {
    memberList () {
      return this.$store.getters['members/toBeApproved']
    },
    pagination () {
      return {
        rowsPerPage: 30
      }
    },
    columns () {
      return [
        {
          name: 'name',
          required: true,
          label: 'Name',
          field: row => row.name,
          sortable: true,
          align: 'left'
        },
        {
          name: 'city',
          label: 'Suburb',
          field: row => row.city,
          sortable: true,
          align: 'left'
        },
        {
          name: 'email',
          label: 'Email',
          field: row => row.email,
          sortable: true,
          align: 'left'
        }
      ]
    }
  },
  methods: {
    async submitApprovalSheet (evt) {
      this.working = true
      try {
        await this.$store.dispatch('members/submitApprovalSheet', {
          members: this.selected,
          approvedby: `${this.signedby1} and ${this.signedby2}`,
          notes: `Approved. ${this.notes ? `Notes: ${this.notes}` : ''}`
        })
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Approval Sheet Submitted'
        })
        this.approvalSheet = false
      } catch (err) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'error',
          message: 'Error: Approval Sheet not Submitted'
        })
      }
    }
  }
}

</script>
