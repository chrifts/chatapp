<template>
  <div class="home" id="main-view" style="overflow-y: scroll;">
    <v-container fluid fill-height >
      <v-row>
        <v-col cols=12 sm=6>
          <v-card height="calc(100vh - 86px)">
            <h1  class="text--primary ">News</h1>
            <p class="text-overline"> In development </p>
          </v-card>
        </v-col>
        <v-col cols=12 sm=6 style="padding-top: 0 !important">
          <v-row >
            <v-col cols=12 class="mb-1">
              <v-card height="calc(53vh - 86px)">
                <h1  class="text--primary ">Weather</h1>
                <p class="text-overline"> In development </p>
              </v-card>
            </v-col>
            <v-col cols=12>
              <v-card height="calc(53vh - 86px)">
                <h1  class="text--primary ">Finances</h1>
                <p class="text-overline"> In development </p>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: 'Home',
  components: {}
})
export default class Home extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>
