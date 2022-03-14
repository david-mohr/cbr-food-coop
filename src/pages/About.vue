<template>
  <q-page>
    <div class="text-h4 text-center">
      About this software
    </div>
    <div class="q-pa-md">
      This is version {{ version }} which first went live February 1st 2022
    </div>
    <div class="q-pa-md">
      Find the source code here:
      <a :href="sourceUrl">{{ sourceUrl }}</a>
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
import packageJson from '../../package.json'
const version = packageJson.version

export default {
  data () {
    return {
      version: version,
      sourceUrl: 'https://github.com/david-mohr/cbr-food-coop'
    }
  }
}

</script>
