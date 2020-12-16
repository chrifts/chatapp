<template>
  <v-container id="chat">
    <!-- DESKTOP -->
    <div :class="{'main-content' : !$vuetify.breakpoint.mobile, 'main-content-mobile' : $vuetify.breakpoint.mobile}">
      
       
      <template v-if="$vuetify.breakpoint.mobile">
        <Contacts 
        v-if="!chatSelected"
        @chatSelected="focusChat"
        />
      </template>
      <template v-else>
        <Contacts 
        @chatSelected="focusChat"
        />
      </template>
      <v-col :cols="$vuetify.breakpoint.mobile ? 12 : 2" v-if="mainSocketStatus == 'error'"></v-col>
      <v-col :cols="$vuetify.breakpoint.mobile ? 12 : 8" style="padding: 0 !important">
        <div class="chat-main-view">
          <div class="center_content" v-if="!chatSelected">
            <p class="text--primary">Choose a chat</p>
          </div>
          <div class="header-block" v-if="chatSelected">
            <v-row>
              <v-col cols=2 v-if="$vuetify.breakpoint.mobile" class="pb-2">
                <v-btn outlined elevation="1" v-if="!$store.state.loadingChat" color="icons" style="bottom: 5px;" icon @click="unsetSelectedChat()"> 
                  <v-icon color="icons">
                    mdi-chevron-left
                  </v-icon> 
                </v-btn>
              </v-col>
              <v-col :cols="$vuetify.breakpoint.mobile ? 10 : 12" class="d-flex" style="justify-content: space-between">
                
                <span v-if="!$store.state.loadingChat && socket.connected" :class="{'text-left d-inline overline text--dark': $vuetify.breakpoint.mobile, 'text-left d-inline text-h5 text--primary': !$vuetify.breakpoint.mobile }">{{ chatSelected.profile.name + ' ' + chatSelected.profile.lastName  }}</span>
                <v-progress-circular
                  v-else
                  indeterminate
                  color="text darken2"
                />
                <template v-if="mainSocketStatus != 'connected'">
                  <span class="text-right d-inline caption font-weight-light" style="margin-top: 5px" v-if="mainSocketStatus == 'disconnected'">
                    {{mainSocketStatus == 'error' ? 'Error conecting to server' : null}}
                    {{mainSocketStatus == 'disconnected' ? 'You are disconnected' : null}}
                  </span>  
                  <template v-if="mainSocketStatus == 'reconnecting'">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    />
                    <p>Reconnecting...</p>
                  </template>
                </template>
              </v-col>
            </v-row>
            
          </div>
          <ChatList v-if="chatSelected" 
            :chatWindowProp="chatWindow"
            :loadingChat="loading"
            :message="newMessage ? newMessage : null"
          />
          <ChatFoot v-if="chatSelected && mainSocketStatus == 'connected'" 
            :chatWindowProp="chatWindow"
            :loadingChat="loading"
            @myNewMsg="myNewMsg" 
          />
        </div>
      </v-col>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import Contacts from "./chatContent/Contacts.vue";
import ChatList from "./ChatList.vue";
import ChatFoot from "./ChatFoot.vue";
import VueScrollTo from 'vue-scrollto';
import store from '../store/index'
import { axiosRequest, defaultSocketEvents } from '../helpers';
import { io } from 'socket.io-client';
Vue.use(VueScrollTo)

@Component({
  name: 'Chat',
  components: {
    Contacts,
    ChatList,
    ChatFoot
  }
})
export default class Chat extends Vue {
  chatSelected: any | boolean = false;
  chatWindow = false;
  loading = true;
  scrollOpts = {
    container: '.chat-list-block',
    element: '.bubble:last-child',
    easing: 'ease-in',
    lazy: false,
    offset: 0,
    force: true,
    cancelable: true,
    x: false,
    y: true
  }
  chatRoom: string;
  socket: boolean | any = false;
  api = (this.$root as any).urlApi;
  newMessage = null;

  @Watch('$store.state.loadingChat')
  onLoadedChat(val: any) {
      this.loading = val;
  }

  mainSocketStatus = this.getSocketStatus;
  @Watch('$store.state.mainAppSocketStatus')
  onMainSocket(val) {
    this.mainSocketStatus = val;
  }

  get mydata() {
    return this.$store.getters.user;
  }

  get getSocketStatus() {
    return this.$store.getters.mainAppSocketStatus;
  }

  async connectSocket() {
    //get if exists or create chat room in db
        const socketUrl: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_SOCKET_URL! : process.env.VUE_APP_SOCKET_URL_PROD!;
        const members = [this.mydata._id, this.chatSelected._id].sort();
        const res = await axiosRequest('POST', this.api + '/chat/get-or-create', {members: members}, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
        if(res.data.chat._id) {
          this.chatRoom = res.data.chat._id;
          //join socket room
          const socket = io(socketUrl+'/chat-'+this.chatRoom, {query: {members: members}});
          this.socket = socket;
          this.socket.on('broadcast', (data)=>{
              console.log(data)
          })
          this.socket.on('reconnect', async ()=>{
            const res = await axiosRequest('POST', this.api + '/chat/get-or-create', {members: members}, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
            if(res.data.chat._id) {
              this.chatRoom = res.data.chat._id;
            }
          })
          this.socket.on('NEW_MESSAGE', (msg)=>{
            
            if(msg.from != this.mydata._id) {
              this.newMessage = msg
            }
          })

          defaultSocketEvents(this.socket, {context: 'selectedChat'});
          //DOCS: https://socket.io/docs/v3/client-api/index.html
        }
  }

  myNewMsg(data) {
    this.socket.emit('ChatSpaceMessage', data)
    data.from = data.from._id
    if(data.from == this.mydata._id) {
      data.message.from = data.from
      this.newMessage = data.message
    }
  }

  async focusChat(contact: any) {
    
    if(this.chatSelected != contact) {
      if(this.socket) {
        this.socket.disconnect()
      }
      this.$store.commit('setLoadingChat', true)
      this.chatWindow = true;
      this.chatSelected = contact;
      await this.connectSocket()
      this.chatSelected.chatId = this.chatRoom
      store.commit('setSelectedChat', this.chatSelected);
    }
  }

  @Watch('$store.state.selectedChat')
  async onChangeChat(selected: any, before: any) {    
    if(before) {
      await axiosRequest('POST', this.api + '/chat/clear-notifications', {leaved: {_id : before._id}}, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
      this.$store.commit('readChat', before._id);
    }
    this.chatSelected = selected;
  }

  async beforeDestroy(){
    console.log('unmout chat')
    const res = await axiosRequest('POST', (this.$root as any).urlApi + '/user/read-notifications', {notifications: this.$store.getters.mainNotifs}, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
    this.$store.commit('setSelectedChat', null);
    this.$store.commit('setLoadingChat', false);
    if(this.socket) {
      this.socket.disconnect();
    }
  }

  scrollBottom() {
    this.$scrollTo('.bubble:last-child', 300, this.scrollOpts)
  }

  unsetSelectedChat() {
    this.chatWindow = false;
    this.chatSelected = false;
    store.commit('setSelectedChat', null);
  }

}
</script>

<style lang="scss">
  .center_content {
    position: relative;
    top: 50%;
  }
  .textarea-div {
    padding: 8px 10px;
    flex: 1 1 auto;
    box-sizing: border-box;
    width: inherit;
    min-width: 0;
    min-height: 20px;
    font-weight: 400;
    font-size: 15px;
    line-height: 20px;
    outline: none;
    will-change: width;
    .textarea {
      position: relative;
      display: flex;
      flex: 1;
      overflow: hidden;
      cursor: text;
      .label {
        position: absolute;
        top: 2px;
        z-index: 100;
        z-index: 2;
        color: var(--input-placeholder);
        font-size: 15px;
        line-height: 20px;
        transition: opacity .08s linear;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        pointer-events: none;
      }
      .writehere {
        background-color: white;
        text-align: left;
        width: 100%;
        border-radius: 6px;
        position: relative;
        z-index: 1;
        min-height: 25px;
        max-height: 100px;
        overflow-x: hidden;
        overflow-y: auto;
        color: var(--compose-primary);
        font-weight: 400;
        font-size: 15px;
        white-space: pre-wrap;
        word-wrap: break-word;
        outline: none;
      }
    }
  }

  #chat {
      position: relative;
      z-index: 100;
      width: 100%;
      height: 100%;
      overflow: hidden;
  }
  .main-content {
    position: relative;
    top: 0;
    display: flex;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    height: 100%;
    overflow: hidden;
    box-shadow: 0px 0px 6px 2px var(--v-shadow-lighten1), 0px 0px 1px 0 var(--v-shadow-lighten2);
  }
  .main-content-mobile {
    position: relative;
    top: 0;
    display: flex;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    height: 100%;
    overflow: hidden;
    .header-block {
      background-color: var(--v-primary-base);
      color: var(--v-text2-base);
    }
  }
  .chat-main-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: background-color .3s;
    background-color: var(--v-secondary-base)
  }
  .header-block {
    // box-shadow: 0pt 0pt 9pt 0pt #b8b8b8;
    z-index: 1;
    background-color: var(--v-primary-base);
    height: 72px;
    color: rgb(59, 59, 59);
    padding: 10px;
    position: relative;
    display: flex;
    order: 1;
  }
  .chat-list-block {
    background: var(--v-secondary-base);
    overflow-y: scroll;
    position: relative;
    display: block;
    order: 2;
    flex: 1 1 0;

  }


</style>
