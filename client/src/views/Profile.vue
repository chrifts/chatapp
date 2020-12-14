<template>
  <div class="profile" id="main-view">
    <v-avatar color="indigo" class="mt-5" size="70">
      <v-icon dark size="70">
        mdi-account-circle
      </v-icon>
    </v-avatar>
    <h1>Welcome {{ user.profile.name ? user.profile.name + ' ' + user.profile.lastName : ''  }} CACA</h1>
    <div>
      {{this.$cookies.get('jwt')}}{{this.$cookies.get('refreshToken')}}
      {{cok}}{{cok2}}
    </div>
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
  cok;
  cok2;
  get user() {
    return this.$store.getters.user;
  }
  async getCookie() {
    const data = await getCookies()
    console.log('COOKIE: ', data)
    getCookies().then((dt)=> {
      console.log('then: ', dt)
      this.cok2 = dt
    })
    this.cok = data
    return data
  }
  async mounted() {
    await this.getCookie()
    const formatter = new JSONFormatter({root: this.$root, cookies: {jwt: this.getCookie().then(dt => {return dt}), refresh: this.$cookies.get('refreshToken')}}, 0, 
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