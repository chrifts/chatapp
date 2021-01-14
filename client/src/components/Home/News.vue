<template>
    <v-card min-width='100%' style="height: calc(100vh - 100px)">
      <h1  class="text--primary ">News</h1>
      <p class="text-overline"> In development </p>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: 'News',
  components: {}
})
export default class News extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>