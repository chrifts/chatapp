<template>
  <div>
    <!-- DESKTOP -->
    <v-bottom-navigation 
      :background-color="color"
      :class="{'d-none' : chatSelected && $vuetify.breakpoint.mobile }" backgroundColor="primary">
      <template v-if="loggedIn && !loading && !$vuetify.breakpoint.mobile">
        <v-btn  color="icons" text :to="'/'">
          {{appName}}
        </v-btn>
        <v-badge
          class="dotPosition"
          inline
          dot
          :color="mainSocketStatus == 'connected' ? 'green' : 'red'"
        >
          <span  class="text-subtitle-1 text--disabled" title='Main socket status'>
            {{mainSocketStatus}}  
          </span>
        </v-badge>
      </template>  
      <SwitchSocket v-if="loggedIn"/>
      <v-spacer v-if="!$vuetify.breakpoint.mobile"></v-spacer>
      <template v-if="!loggedIn && !loading" class="v-bottom-navigation">
        <v-btn
          color="icons"
          text
          v-for="item in itemsNoAuth"
          :key="item.title"
          :to="item.link"
        >
          {{ item.title }}
          <v-icon center color="icons">{{ item.icon }}</v-icon>
        </v-btn>
      </template>

      <template v-if="loggedIn && !loading"  class="v-bottom-navigation">

        <v-menu offset-y
          v-model="isOpen"
          >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="icons"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-badge
                color="red"
                overlap
                :content="totalNotifications"
                :value="hasNotifications"
              >
                
                <v-icon>mdi-bell</v-icon>
              </v-badge>
            </v-btn>
            
          </template>
          <v-list class="not-list" v-if="Object.keys(mainNotifications).length > 0">
            <!-- loop notification type -->
            <v-list-item
              v-for="(data, notifType) in mainNotifications"
              :key="notifType"
              :class="{'d-none': Object.keys(data).length < 1}"
            >
              
                <!-- <span>{{parseNotificationType(notifType)}}</span> -->
                
                <v-list class="not-list">
                  <!-- Loop users -->
                  <v-list-item
                    v-for="(el, ix) in data"
                    :key="ix"
                  >
                    <div v-if="el.length > 0" :class="{'unread' : el[0].status == 'unread'}">
                      <v-list-item-title v-if="notifType == NEW_MESSAGE">{{ el.length }} {{el.length > 1 ? 'messages' : 'message'}} from </v-list-item-title>
                      <v-list-item-title v-if="notifType == CONTACT_REQUEST"> 
                        <!-- <span v-if="el[0].message.status == 'connecteds'"> accepted from</span> -->
                        <!-- {{debugFromTempate(el)}} -->
                        <!-- {{el[0].message.status}} -->
                        {{parseNotificationType(el[0].message.status)}} 
                      </v-list-item-title>
                      <v-list-item-subtitle>{{ el[0].extraDataFrom.email }}</v-list-item-subtitle>  
                    </div> 
                  </v-list-item>
                </v-list>
              
              
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn color="icons" text @click="changeTheme">
          <v-icon center color="icons">
            mdi-theme-light-dark
          </v-icon>
        </v-btn>
        <v-btn color="icons" text v-for="item in itemsAuth" :key="item.title" :to="item.link">
          {{ item.title }}
          <v-icon center color="icons">{{ item.icon }}</v-icon>
        </v-btn>
        
        <v-btn text color="icons" @click="logout" v-if="!$vuetify.breakpoint.mobile">
          Logout
          <v-icon color="icons" center>exit_to_app</v-icon>
        </v-btn>
      </template>  
    </v-bottom-navigation>
    <div v-if="mainLoading">
      <v-progress-linear
        height="8"
        v-if="mainLoading"
        indeterminate
        color="red darken-2"
      ></v-progress-linear>
      Loading...
    </div>    
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import store from '../store/index'
import { Watch, Prop, Model } from 'vue-property-decorator';
import { CONTACT_REQUEST, NEW_MESSAGE } from "../constants";
import { axiosRequest } from '../helpers';
import SwitchSocket from '@/components/SwitchSocket.vue'

@Component({
  name: 'NavBar',
  components: {
    SwitchSocket,
  }
})
export default class NavBar extends Vue {
  @Model('change') socketStatus!: string;
  
  color = (this as any).$vuetify.theme.themes.light.primary;
  NEW_MESSAGE = NEW_MESSAGE;
  CONTACT_REQUEST = CONTACT_REQUEST;
  isOpen = false;
  mainSocketStatus = this.mainAppSocketStatus;
  chatSelected = this.selectedChat;
  loading = false;
  loggedIn = this.userLoggedIn;
  appName = process.env.VUE_APP_NAME;
  mainNotifications = this.mainNotif;
  readed = false;
  hasNotifications = false;
  totalNotifications = 0;
  
  changeTheme(){
    const val = this.$vuetify.theme.dark ? false : true
    this.$vuetify.theme.dark = val;
    localStorage.setItem("dark", val.toString());
  }

  @Watch('isOpen')
  onOpenNotif(val){
    if(!val) {
      this.readNotifications(this.mainNotifications)
    }
  }
  @Watch('$store.state.mainAppSocketStatus')
  onSocketStatusChange(ss: any) {
    this.mainSocketStatus = ss;
  }

  get itemsNoAuth() {
    const menuItems = [
      {
        title: "Register",
        icon: "add",
        link: "/register"
      },
      {
        title: "Login",
        icon: "send",
        link: "/login"
      }
    ];
    return menuItems;
  }
  debugFromTempate(q) {
    console.log(q);
  }
  get itemsAuth() {
    const menuItems = [
      {
        title: "Home",
        icon: "home",
        link: "/"
      },
      {
        title: "Chat",
        icon: "message",
        link: "/chat"
      },
      {
        title: "Profile",
        icon: "mdi-account",
        link: "/profile"
      },
    ];
    return menuItems;
  }

  get mainNotif() {
    return this.$store.getters.mainNotifs
  }
  get mainLoading() {
    return this.$store.getters.mainLoading;
  }

  get mainAppSocketStatus() {
    return this.$store.getters.mainAppSocketStatus;
  }

  get userLoggedIn() {
    return this.$store.getters.user;
  }

  get selectedChat() {
    return this.$store.getters.selectedChat;
  }

  async readNotifications(data) {
    const currentNotifications = this.totalNotifications;
    if(this.totalNotifications > 0) {
      this.hasNotifications = false;
      this.totalNotifications = 0;
      const res = await axiosRequest('POST', (this.$root as any).urlApi + '/user/read-notifications', {notifications: data}, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
      if(res.status == 500) {
        this.hasNotifications = true;
        this.totalNotifications = currentNotifications;
      } else {
        this.$store.commit('readNotifications', data)
      }      
    }
  }

  parseNotificationType(data) {
    let type;
    switch (data) {
      case 'new contact from':
        type = 'New contact request from'
        break;
      case 'resend':
        type = 'User has resend contact request'
        break;
      case 'connecteds':
        type = 'New contact!'
        break;
      case 'rejected':
        type = 'Contact has rejected your request'
        break;
      default:
        break;
    }
    return type;
  }

  public logout() {
    axiosRequest('POST', (this.$root as any).urlApi + '/auth/logout', {refreshToken: this.$cookies.get('refreshToken')} )
    store.commit("setMainLoading", true);
    if(this.$socket.client) {
      this.$socket.client.disconnect();
    }
    this.$store.dispatch("LOGOUT_USER");
    this.$cookies.remove('jwt');
    this.$cookies.remove('refreshToken');
  }
  @Watch('$store.state.mainLoading')
  onMainLoading(val: any) {
    this.loading = val;
  }

  @Watch('$store.state.mainNotifications', { deep : true, immediate: true })
  onMainNotificationsChange(val: any) {
    
    let totalN = 0;
    Object.entries(val).forEach(([type, contacts])=> {
      if(Object.keys(contacts as {}).length > 0) {
        Object.entries(contacts as {}).forEach(([ix, contact])=> {
          (contact as []).forEach(notification => {
            if((notification as any).status == 'unread') {
              totalN++;
            }
          });
        })
        if(totalN > 0) {
          this.hasNotifications = true;
          this.totalNotifications = totalN;
        }
      } 
    })
    if(totalN < 1) {
      this.hasNotifications = false;
      this.totalNotifications = 0;
    }
    this.mainNotifications = val;
  }

  @Watch('$store.state.user')
  onUser(val: any) {
    this.loggedIn = val;
  }
  @Watch('$store.state.selectedChat')
  onChangeChat(val: any) {
    this.chatSelected = val;
    if(val && val._id){
      this.$store.commit('readChat', val._id);
    }
    
  }
}
</script>
<style lang="scss">
.dotPosition .v-badge__wrapper span {
  position: relative;
  top: 19px !important;
  margin: 0 5px;
}
  .not-list {
    width: 100%;
  }
</style>
<style lang="scss" scoped>

.mainNav {
  background-color: var(--primary);
}
.unread {
  background-color: #cbcbcb;
  border-radius: 5px;
  padding: 6px 10px;
}
@media (max-width: 599px) {
  .v-toolbar__content, .v-toolbar__extension, .v-toolbar__items {
    width: 100% !important;
  }
  .v-item-group.v-bottom-navigation .v-btn {
    min-width: 60px !important;
  }
  .v-toolbar__content, .v-toolbar__extension {
    padding: 0 !important;
  }
  .v-menu__content {
    max-width: 100%;
    width: 100%;
    left: 0 !important;
    top: 0 !important;
    height: calc(100% - 57px) !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  // .v-list-item {
  //   display: block !important;
  // }
}
</style>
