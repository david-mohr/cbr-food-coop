<template>
  <div class="row q-col-gutter-md">
    <div class="col text-bold row justify-end">
      {{ label }}
    </div>
    <div class="col">
      {{ value }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }
}
</script>
