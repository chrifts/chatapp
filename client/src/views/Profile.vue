<template>
  <div class="profile" id="main-view">
    <v-avatar color="indigo" class="mt-5" size="70">
      <v-icon dark size="70">
        mdi-account-circle
      </v-icon>
    </v-avatar>
    <h1>Welcome {{ user.profile.name ? user.profile.name + ' ' + user.profile.lastName : ''  }}</h1>
    DEBUG
    <div id="jsonView"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import JSONFormatter from 'json-formatter-js'
import { getCookies } from "../helpers";


@Component({
  name: 'Profile',
})
export default class Profile extends Vue {

  get user() {
    return this.$store.getters.user;
  }
  async mounted() {
    (window as any).webkit.messageHandlers.derp.postMessage(0);
    //alert('ola')
    const formatter = new JSONFormatter({root: this.$root }, 0, 
    {
      hoverPreviewEnabled: false,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
      theme: '',
      animateOpen: true,
      animateClose: true,
      useToJSON: true
    });
    (document as any).getElementById("jsonView").appendChild(formatter.render());
  }
}
</script>
<style lang="scss" scoped>
#jsonView {
  overflow: scroll;
  height: inherit;
  text-align: left !important;
}
</style>