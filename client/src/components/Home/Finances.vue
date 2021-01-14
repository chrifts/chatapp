<template>
    <v-card height="calc(50vh - 50px)" style="margin-top: 20px">
      <h1  class="text--primary ">Finances</h1>
      <p class="text-overline"> In development </p>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: 'Finances',
  components: {}
})
export default class Finances extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>