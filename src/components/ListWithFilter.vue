<template>
  <div
    v-if="!!items"
    class="row"
  >
    <div class="col">
      <q-input
        v-model="search"
        filled
        type="search"
        hint="Search"
        @update:model-value="page = 1"
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
        <slot :items="matchingItems" />
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
</template>

<script>
import fuzzysearch from 'fuzzysearch'

export default {
  props: {
    items: {
      type: Array,
      required: true
    },
    filterKey: {
      type: String,
      default: 'name'
    }
  },
  data () {
    return {
      search: '',
      page: 1,
      pageSize: 15
    }
  },
  computed: {
    totalPages () {
      return Math.ceil(this.filteredItems.length / this.pageSize)
    },
    matchingItems () {
      return this.filteredItems
        .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
    },
    filteredItems () {
      if (!this.items) return []
      return this.items.filter(item => fuzzysearch(this.search.toLowerCase(), item[this.filterKey].toLowerCase()))
    }
  }
}
</script>
