<template>
  <div id="app">
    <v-app :class="{'mobile-container' : $vuetify.breakpoint.mobile}">
      <NavBar 
        v-if="!$vuetify.breakpoint.mobile"  
        style="z-index: 1;"
      />
      <router-view/>
      
      <NavBar v-if="$vuetify.breakpoint.mobile" style="z-index: 1;" />
    </v-app>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import NavBar from "@/components/NavBar.vue";
// import VueSocketIOExt, { Socket } from 'vue-socket.io-extended'
// import { io } from 'socket.io-client';
import { axiosRequest } from './helpers';
import store from './store/index'
// import { MAIN_APP_CONTACT_HANDLER, MAIN_APP_MESSAGES } from './constants';

@Component({
  components: {
    NavBar
  }
})
export default class App extends Vue {
  
  theUser = this.$store.getters.user;
  appLoading = false;
  
  @Watch('$store.state.user')
  onUser(val: any) {
   if(val) {
      this.theUser = val;
      if(!this.$store.getters.firstLoad) {
        this.$store.commit('setFirstLoad', true);
      }
    }
  }

  @Watch('$store.state.firstLoad') 
  onFristLoadChanged(init: any) {
    if(init) {
      if(this.$socket.client) {
        this.$socket.client.connect();
      }
      this.appInit()
    }
  }

  async appInit() {
    this.appLoading = true;
    const sessionToken = this.$cookies.get('jwt'); 
    const user = await axiosRequest('POST', (this.$root as any).urlApi + '/get-user', {}, {headers: {"x-auth-token": sessionToken}})
    if(user.data.email){
      //set logged user
      const fullUser = await axiosRequest('POST', (this.$root as any).urlApi + '/get-user', {getFull: true, email: user.data.email}, {headers: {"x-auth-token": sessionToken}})      
      this.theUser = fullUser.data;
      //get user contacts
      await this.$store.dispatch('GET_CONTACTS', { user: fullUser.data, jwtKey: sessionToken })
      //save user data
      this.$store.dispatch('SET_USER', fullUser.data);
      if(this.$store.getters.selectedChat) {
        const sc = this.$store.getters.selectedChat
        this.$store.commit('setSelectedChat', null)
        this.$store.commit('setSelectedChat', sc);
      } 
      this.appLoading = false;
      //listen socket events
    }
  }

  mounted(){
    this.$root.$on('connectToMainSocket', ()=>{
      console.log('connectToMainSocket')
      if(this.$socket.client.disconnected) {
        this.$socket.client.connect()
      }
    })
    this.$root.$on('disconnectAllSockets', ()=>{
      if(this.$socket.client) {
        this.$socket.client.disconnect();
        console.log('Disconnect current main socket: ', this.$socket.client)
      } else {
        console.log('chat socket == false')
      }
    })
  }

  @Watch('$store.state.mainAppSocketStatus' )
  onMainSocketChange(s: any) {
    if(s == 'connected' || s == 'reconnected') {
      this.appInit()
    }
    if(s == 'disconnected' || s == 'connection timeout') {
      // this.$socket.client.connect();
    }
    //error
  }

  @Watch('$store.state.mainLoading')
  onAppLoaded(val: any) {
    this.appLoading = val; 
  }
}
</script>
<style lang="scss">
  .v-application--wrap {
    background: linear-gradient(rgb(245, 245, 245), rgb(218, 218, 218));
  }
  .mobile-container {
    .v-application--wrap {
      #main-view {
        height: 100%;
      }
      #chat {
        padding: 0 !important;
      }
      padding-bottom: 75px !important;
      z-index: 0;
    }
  }
  #app {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    padding: 0;
    margin: 0;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 30px;

    a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>
