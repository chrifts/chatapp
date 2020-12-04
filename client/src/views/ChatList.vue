<template>
    <div class="chat-list-block px-3" id="chat-list"> 
        <ResizeSensor @resized="onResize" :debounce="50"></ResizeSensor>
        <v-progress-linear
            v-if="chatSelected && !messages"
            indeterminate
            color="primary"
        />
        <v-col cols=12 :style="messages ? 'visibility: visible' : 'visibility: hidden'">
            <v-list :class="{'d-block' : chatWindow}" class="d-none" id="the-list">
            <template v-for="(item, index) in messages">
                <v-list-item 
                two-line 
                :key="index"
                class="bubble-left bubble"
                :class="{'bubble-right': item.from == mydata._id, 'bubble-mobile' : $vuetify.breakpoint.mobile}"
                >
                <v-list-item-content >
                    {{item.message.trim()}}
                    <v-list-item-subtitle
                    class="text-left datetime"
                    :class="{'text-right': item.from == mydata._id}"
                    >{{parseTime(item.timestamp)}}</v-list-item-subtitle>
                </v-list-item-content>
                </v-list-item>
            </template>
            </v-list>
        </v-col>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop, Model } from "vue-property-decorator";
import moment from 'moment';
import VueScrollTo from 'vue-scrollto';
import ResizeSensor from 'vue-resizesensor';
import { axiosRequest } from '../helpers';
import { io } from 'socket.io-client';

Vue.use(VueScrollTo)
Vue.component('ResizeSensor', ResizeSensor)

@Component
export default class ChatList extends Vue {

    @Prop() chatWindowProp: any;
    
    @Model('change') message!: any

    @Watch('message')
    onNewMessage(msg: any) {
        this.messages.push(msg)
    }
    scrollOpts = {
        container: '.chat-list-block',
        element: '.bubble:last-child',
        easing: 'ease-in',
        lazy: false,
        offset: 30,
        force: true,
        cancelable: true,
        x: false,
        y: true
    }
    messages: any | boolean = false;
    chatSelected = this.selectedChat;
    chatWindow = this.chatWindowProp;
    messageText: string;
    api = (this.$root as any).urlApi;
    
    get mydata() {
        return this.$store.getters.user;
    }

    get selectedChat() {
        return this.$store.getters.selectedChat;
    }

    public scrollBottom() {
        this.$scrollTo('.bubble:last-child', 0, this.scrollOpts)
    }

    onResize() {
        this.scrollBottom();
    }
    updated() {
        if(/Android/.test(navigator.appVersion)) {
            window.addEventListener("resize", () => {
                if(document.activeElement!.tagName=="DIV") { //ANDROID FIX: que scrollée solo si no escrolleó para arriba (leyendo mensajes anteriores)
                    this.scrollBottom()
                }
            })
        } 
    }

    parseTime(time: any) {
        return moment(time).calendar();   
    }
    async mounted(){
        await this.loadChat(this.chatSelected)
    }
    async loadChat(selectedChat) {
        let theContact: any;
        if(selectedChat && selectedChat._id) {
            theContact = {_id: selectedChat._id}
            const res = await axiosRequest('POST', this.api + '/chat/get-messages', {chatId: selectedChat.chatId, contact: theContact}, {headers: {"x-auth-token": this.$cookies.get('jwt')}})
            this.messages = res.data.messages   
        }
    }

    @Watch("chatWindowProp")
    onWindowChange(val: any): any {
        this.chatWindow = this.chatWindowProp;
    }

    @Watch("$store.state.selectedChat")
    onChangedChat(val: any) {
        this.chatSelected = val;
        this.loadChat(val);
    }

    @Watch("messages")
    onMessagesChange(val: any): any {
        if(this.messages) {
            this.$nextTick().then(() => {
                this.scrollBottom();
            })
        }
    }
}
</script>
<style lang="scss">
#the-list {
    background-color: transparent;
    .v-list-item__content {
        white-space: pre-line;
        display: block;
        padding: 20px 6px;
        overflow-wrap: break-word;
    }
}
.datetime {
    color: #ffaaaa !important;
}
.bubble-left {
  background-color: #fff;
  text-align: left;
  .v-list-item__content {
    color: black !important;
  }
  margin: 10px 0px;
}
.bubble-mobile {
    max-width: 85% !important;
}
.bubble {
  box-shadow: 3pt 4pt 2pt 0pt #c3c3c3;
  margin: 10px 0px;
  min-width: 70px;
  max-width: 60%;
  width: max-content;
  border-radius: 10px;
  animation-duration: 0.2s;
  animation-name: slidein;
  animation-timing-function: ease-out;
}
.bubble-right {
  margin-left: 100%;
  text-align: left;
  background-color: $main_1;
  .v-list-item__content {
    color: #fff !important;
  }
  float: right;
}

@keyframes slidein {
  0% { opacity: 0; transform: scaleY(0.2); top: 25px}  
  100% { opacity: 1; transform: scaleY(1); top: 0}
}



/* width */
.chat-list-block::-webkit-scrollbar {
  width: 10px;
}

/* Track */
.chat-list-block::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
.chat-list-block::-webkit-scrollbar-thumb {
  background: darken($color: $chat-theme, $amount: 20);
}

/* Handle on hover */
.chat-list-block::-webkit-scrollbar-thumb:hover {
  background: darken($color: $chat-theme, $amount: 25);
}

</style>
