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
import { axiosRequest } from './helpers';
import store from './store/index'

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
      console.log(this.$store.state)
      this.appInit()
    }
  }

  async appInit() {
    console.log('APP INIT')
    this.appLoading = true;
    const sessionToken = this.$cookies.get('jwt'); 
    if(this.theUser.email){
      //set logged user
      console.log('ON IF')
      //get user contacts
      await this.$store.dispatch('GET_CONTACTS', { user: this.theUser, jwtKey: sessionToken })
      //save user data
      //NO RECARGO USER; ENTONCES NO TRAE LAS NUEVAS NOTIF HABIENDO ESTADO OFFLINE
      this.$store.commit('updateNotifications', this.theUser)
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
    this.$root.$on('connectToMainSocket', async ()=>{
      console.log('connectToMainSocket')
      if(this.$socket.client.disconnected) {
        const user = await axiosRequest('POST', (this.$root as any).urlApi + '/get-user', {}, {headers: {"x-auth-token": this.$cookies.get('jwt')}})
        this.$store.dispatch('SET_USER', user.data)
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
    console.log('MAIN APP SOCKET :', s)
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
