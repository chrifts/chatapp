<template>
  <div class="home" id="main-view" style="overflow-y: scroll;">
    <v-container fluid fill-height >
      <v-row >
        <v-col cols=12 sm=6>
            <News />
        </v-col>
        <v-col cols=12 sm=6 style="flex-direction: column; justify-content: space-between">
            <Weather />
            <Finances />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Weather from "../components/Home/Weather.vue"
import Finances from "../components/Home/Finances.vue"
import News from "../components/Home/News.vue"

@Component({
  name: 'Home',
  components: {
    Weather,
    Finances,
    News
  }
})
export default class Home extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>
