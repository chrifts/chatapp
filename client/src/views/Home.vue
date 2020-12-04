<template>
  <div class="home" id="main-view">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1 v-if="user">Welcome {{ user.email  }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class Home extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>
