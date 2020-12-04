<template>
  <div class="profile" id="main-view">
    <v-avatar color="indigo" class="mt-5" size="70">
      <v-icon dark size="70">
        mdi-account-circle
      </v-icon>
    </v-avatar>
    <h1>Welcome {{ user.profile.name ? user.profile.name + ' ' + user.profile.lastName : ''  }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Profile extends Vue {
  get user() {
    return this.$store.getters.user;
  }
}
</script>
