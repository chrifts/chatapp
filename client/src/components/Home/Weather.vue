<template>
    <v-card height="calc(50vh - 70px )">
        <h1  class="text--primary ">Weather</h1>
        <p class="text-overline"> In development </p>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: 'Weather',
  components: {}
})
export default class Weather extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>