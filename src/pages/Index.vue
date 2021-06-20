<template>
  <q-page class="flex justify-center" style="margin-top: 30px">
    <div
      v-if="!!members"
      class="row"
    >
      <div class="col">
        <q-input
          v-model="search"
          filled
          type="search"
          hint="Search"
          @update:modelValue="page = 1"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-list
          bordered
          separator
          style="min-width: 300px"
        >
          <q-item
            v-for="member in matchingMembers"
            :key="member.ID"
            v-ripple
            clickable
          >
            <q-item-section>{{ member.NAME }}</q-item-section>
          </q-item>
        </q-list>
        <div
          v-if="totalPages > 1"
          class="q-pa-lg flex flex-center"
        >
          <q-pagination
            v-model="page"
            :max="totalPages"
            :max-pages="5"
            :direction-links="true"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import fuzzysearch from 'fuzzysearch'
export default {
  data () {
    return {
      search: '',
      page: 1,
      pageSize: 15
    }
  },
  computed: {
    members () {
      return this.$store.state.members.members
    },
    totalPages () {
      return Math.ceil(this.filteredMembers().length / this.pageSize)
    },
    matchingMembers () {
      return this.filteredMembers()
        .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
    }
  },
  async created () {
    if (!this.members.length) {
      await this.$store.dispatch('members/getMembers')
    }
  },
  methods: {
    filteredMembers () {
      if (!this.members) return []
      return this.members.filter(member => fuzzysearch(this.search.toLowerCase(), member.NAME.toLowerCase()))
    }
  }
}
</script>
