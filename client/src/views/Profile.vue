<template>
  <div class="profile" id="main-view">
    <v-avatar color="indigo" class="mt-5" size="70">
      <v-icon dark size="70">
        mdi-account-circle
      </v-icon>
    </v-avatar>
    <h1 class="text--primary">{{ user.profile.name ? user.profile.name + ' ' + user.profile.lastName : ''  }}</h1>
    <p class="text-overline text--primary">{{user.email}}</p>
    <v-container>
      <v-row >
        <v-col cols=12 v-if="$vuetify.breakpoint.mobile">
          <span class="d-inline text--primary"> connection to server: {{socketStatus}} </span>
          <div>
            <SwitchSocket />
          </div>
        </v-col>
        <v-col cols=12>
          <Logout />
        </v-col>
        <v-col cols=12>
          <v-btn color="icons" text  to="cristihanschweizer" v-if="$vuetify.breakpoint.mobile">
          Developer info
            <v-icon center color="icons">mdi-account-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <div v-if="debug" id="jsonView"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import JSONFormatter from 'json-formatter-js'
import SwitchSocket from '@/components/SwitchSocket.vue'
import Logout from '@/components/Logout.vue'
import { Watch } from 'vue-property-decorator';

@Component({
  name: 'Profile',
  components: {
    SwitchSocket,
    Logout,
  }
})
export default class Profile extends Vue {
  public debug = false;
  public socketStatus = ''
  get user() {
    return this.$store.getters.user;
  }
  @Watch('$store.state.mainAppSocketStatus')
  onSocketStatusChange(ss: any) {
      this.socketStatus = ss
  }
  async mounted() {
    this.socketStatus = this.$store.getters.mainAppSocketStatus;
    //(window as any).webkit.messageHandlers.derp.postMessage(0);
    //alert('ola')
    if(this.debug) {      
      const formatter = new JSONFormatter({root: this.$root }, 0, 
      {
        hoverPreviewEnabled: false,
        hoverPreviewArrayCount: 100,
        hoverPreviewFieldCount: 5,
        theme: 'dark',
        animateOpen: true,
        animateClose: true,
        useToJSON: true
      });
      (document as any).getElementById("jsonView").appendChild(formatter.render());
    }
  }
}
</script>
<style lang="scss" scoped>
#jsonView {
  overflow: scroll;
  height: inherit;
  text-align: left !important;
  background-color: black;
}
.profile {
  
  overflow-y: scroll;
}
</style>