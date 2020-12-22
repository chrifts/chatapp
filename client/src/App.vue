<template>
  
    <v-app 
      backgroundColor="primary" 
      :class="{
              'mobile-chat-selected' : $vuetify.breakpoint.mobile && chatSelected,
              'mobile-container app-height-mobile' : $vuetify.breakpoint.mobile && !chatSelected,
              'padding-ios': $root.$data.platform.operatingSystem == 'ios' && $root.$data.platform.platform == 'web' && !standalone && safari, 
              'padding-ios-wk': !standalone && !safari,
              }">
      <NavBar 
        v-if="!$vuetify.breakpoint.mobile"  
        style="z-index: 1;"
      />
      <Dialog />
      <router-view />
      
      <NavBar v-if="$vuetify.breakpoint.mobile" style="z-index: 1;" :isWK="isWK" />
    </v-app>
  
</template>

<script lang="ts">
import Vue from "vue";
import { Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import NavBar from "@/components/NavBar.vue";
import { axiosRequest, getCookies } from './helpers';
import store from './store/index'
import ifvisible from 'ifvisible.js'
import Dialog from '@/components/Dialog.vue'

@Component({
  name: 'App',
  components: {
    NavBar,
    Dialog
  }
})
export default class App extends Vue {
  
  theUser = this.$store.getters.user;
  appLoading = false;
  goDark = localStorage.getItem("dark");;
  standalone = (window.navigator as any).standalone === undefined ? null : (window.navigator as any).standalone;
  userAgent = window.navigator.userAgent.toLowerCase();
  safari = /safari/.test( this.userAgent );
  ios = /iphone|ipod|ipad/.test( this.userAgent );
  isWK = (!this.standalone && !this.safari)
  chatSelected = this.$store.getters.selectedChat;
  
  @Watch('$store.state.user')
  onUser(val: any) {
   if(val) {
      this.theUser = val;
      if(!this.$store.getters.firstLoad) {
        this.$store.commit('setFirstLoad', true);
      }
    }
  }

  @Watch('$store.state.selectedChat')
  onChatSelected(val: any) {
   if(val) {
     this.chatSelected = true;
   } else {
     this.chatSelected = false;
   }
  }

  @Watch('$store.state.firstLoad') 
  onFristLoadChanged(init: any) {
    if(init) {
      this.appInit()
    }
  }

  async appInit(evt?: any) {
    this.appLoading = true;
    const theme = localStorage.getItem("dark");
    if (theme) {
        if (theme == "true") {
            this.$vuetify.theme.dark = true;
        } else {
            this.$vuetify.theme.dark = false;
        }
    }
    if(!this.$socket.client.connected){
      this.$socket.client.connect();
    }
    
    if(evt == 'focus') {
      if(!this.$socket.client.connected){
        this.$store.commit('setMainAppSocketStatus', 'connecting...')
        this.$socket.client.connect();
      }
    }
    if(this.theUser.email){
      const contacts = await this.$store.dispatch('GET_CONTACTS', { user: this.theUser, jwtKey: this.$cookies.get('jwt') })
      this.$store.commit('updateNotifications', this.theUser)
      if(this.$store.getters.selectedChat) {
        const sc = this.$store.getters.selectedChat
        this.$store.commit('setSelectedChat', null)
        this.$store.commit('setSelectedChat', sc);
      } 
    }
    this.appLoading = false;
  }

  mounted(){
    ifvisible.on('focus', ()=> {
      if(this.$socket && !this.$socket.client.connected) {
        this.appInit('focus');
      }
    })      
    this.$root.$on('connectToMainSocket', async ()=>{
      console.log('connectToMainSocket')
      if(this.$socket.client.disconnected) {
        const user = await axiosRequest('POST', (this.$root as any).urlApi + '/get-user', {}, {headers: {"x-auth-token": this.$cookies.get('jwt')}})
        this.$store.dispatch('SET_USER', user.data)
        this.$socket.client.connect()
        this.$socket.client.connected ? this.$store.commit('setMainAppSocketStatus', 'connected') : null;
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
  html {
    overflow: hidden;
  }
  #app .v-bottom-navigation .v-btn {
    height: inherit !important;
  }
  .v-application--wrap {
    background: var(--v-primary-base)
  }
  .mobile-container {
    .v-application--wrap {
      height: 100%;
      min-height: unset !important;
      // #main-view {
        
      // }
      #chat {
        padding: 0 !important;
      }
      padding-bottom: 0px !important;
      z-index: 0;
    }
  }
  .padding-ios {
    .v-application--wrap {
      // padding-bottom: 114px !important;
      //padding-bottom: 75px !important;
    }
    
  }
  .padding-ios-wk {
    .v-application--wrap {
      padding-top: 20px !important;
    }
    
  }
  .mobile-chat-selected {
    .v-application--wrap {
      min-height: unset !important;
    }
    height: calc(100% - env(safe-area-inset-bottom)) !important;
  }
  .app-height-mobile {
    height: calc(100% - calc(56px + env(safe-area-inset-bottom))) !important;
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
