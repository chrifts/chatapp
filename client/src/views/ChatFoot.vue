<template>
    <div class="footer-block" :class="{'footer-block__mobile':$vuetify.breakpoint.mobile }" >
        <div class="f1">
            <v-menu
                v-if="!$vuetify.breakpoint.mobile"
                top
                :offset-y="true">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        class="mb-4 ml-1" 
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                    <v-icon>
                        mdi-cogs
                    </v-icon>
                    </v-btn>
                </template>

                <v-switch                
                    :label="`Enter to send`"
                    @click="enterToSend = !enterToSend;"
                />
            </v-menu>
            <div class="textarea-div mb-3">
                <div tabindex="-1" class="textarea">
                    <div class="label" :class="{'d-none' : messageText}" style="visibility: visible">Escribe un mensaje aquí</div>
                    <div 
                        @keyup="writing($event)"
                        @keyup.enter="eventSendMessage($event)"
                        
                        id="texttype" 
                        class="writehere copyable-text selectable-text"
                        :class="{'enter_to_send' : enterToSend}"
                        contenteditable="true"
                        focusable
                        ref="_textarea"
                        data-tab="6" 
                        dir="ltr" 
                        spellcheck="true"
                        @focus="inputFocused = !inputFocused"
                        @blur="inputFocused = !inputFocused"
                        >
                        
                    </div>
                </div>
            </div>
            <v-btn 
                color="icons"
                icon 
                elevation="1" 
                outlined 
                @click="sendMessage()"
                class="mb-4 mr-2" style="position: relative; top: 1px;" >
                <v-icon
                    color="icons"
                >
                    mdi-send
                </v-icon>
            </v-btn>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import store from '../store/index';
import { axiosRequest } from '../helpers';

interface NewMessage {
    timestamp: number,
    message: string,
    from: any,
    to: string
}

@Component({
    name: 'ChatFoot',
})
export default class ChatFoot extends Vue {    
    inputFocused = false;
    chatWindow: boolean;
    chatSelected = this.selectedChat;
    messageText = '';
    newMessage: NewMessage;
    enterToSend = false;
    api = (this.$root as any).urlApi;


    @Prop() chatWindowProp: any;

    @Watch("chatWindowProp")
    onWindowChange(val: any): any {
        this.chatWindow = this.chatWindowProp;
    }

    get mydata() {
        return this.$store.getters.user;
    }
    
    get selectedChat() {
        return this.$store.getters.selectedChat;
    }

    @Watch("$store.state.selectedChat")
    onChangedChat(val: any) {
        this.chatSelected = val;
    }
    
    writing(event: any) {   
        const input = event.target as HTMLElement;
        this.messageText = input.innerText;        
    }
    
    eventSendMessage(evt: any) {
        this.messageText = this.messageText.trim()
        if(this.messageText.length > 0){
            if(this.enterToSend && !evt.shiftKey && evt.keyCode === 13) {
                this.sendMessage();
            }
            if(!this.enterToSend && evt.shiftKey && evt.keyCode === 13) {
                this.sendMessage();
            }
        }
    }

    sendMessage() {
        if(this.messageText.length > 0) {
            const theTextArea = this.$refs._textarea as HTMLElement;
            theTextArea.focus();
            const messageTime = Date.now();
            const myDataClean = this.mydata;
            myDataClean.contacts = null
            myDataClean.notifications = null
            const theNewMessage = {
                timestamp: messageTime,
                message: this.messageText,
                from: myDataClean as {},
                to: this.chatSelected._id
            }
            this.messageText = ''
            this.$emit('myNewMsg', {chatId: this.chatSelected.chatId, from: myDataClean, message: theNewMessage })
            store.commit('updateContactLastMessage', {to: this.chatSelected._id, message: theNewMessage.message, timestamp: theNewMessage.timestamp})
            //axiosRequest('POST', this.api + '/chat/post-message', {chatId: this.chatSelected.chatId, from: myDataClean, message: theNewMessage }, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
            // eslint-disable-next-line
            theTextArea.innerText = '';
            return;
        }
    }
}
</script>
<style lang="scss">
#texttype {
    background-color: #f5f5f5;
    padding-top: 2px;
    padding-left: 10px;
}
.label {
    padding-left: 10px;
    color: rgb(160, 160, 160) !important;
}
.enter_to_send {
    br {
        display: none;
    }
}
.mb-android {
    margin-bottom: 150px;
}
.v-menu__content {
    z-index: 100 !important;
    padding: 10px;
    background-color: white;
}
.footer-block{
//   box-shadow: 0pt 0pt 9pt 0pt #b8b8b8;
  z-index: 1;
  background-color: var(--v-primary-base);
  position: relative;
  z-index: 1;
  flex: none;
  order: 3;
  box-sizing: border-box;
  width: 100%;
  min-height: 62px;
  .f1 {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    box-sizing: border-box;
    max-width: 100%;
    min-height: 62px;
  }
}
.footer-block__mobile {
    background-color: var(--v-primary-base)
}
</style>
