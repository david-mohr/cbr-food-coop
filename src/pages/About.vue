<template>
  <q-page>
    <div class="text-h4 text-center">
      About this software
    </div>
    <div class="q-pa-md">
      Version {{ version }}
    </div>
    <div class="q-pa-md">
      Find the source code here:
      <a href="https://github.com/david-mohr/cbr-food-coop">https://github.com/david-mohr/cbr-food-coop</a>
    </div>
    <div class="q-pa-md">
      The tech team meets every Wednesday at 7pm.
    </div>
    <div class="q-pa-md">
      Get in touch with us if you want to be involved: info@cbrfoodcoop.org.au
    </div>
  </q-page>
</template>

<script>
import { version } from '../../package.json'

export default {
  data () {
    return { version: version }
  }
}

</script>
