<template>
    <v-col :cols="$vuetify.breakpoint.mobile ? 12 : 4" class="col-contacts">
      <v-row class="bg-header">
        <v-col cols=12>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="12" class="">
                      <v-fade-transition leave-absolute>
                        <span v-if="open" key="0">
                          Add contact
                        </span>
                        <span v-else key="1" class="text--white">
                          Contacts
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-text-field
                  v-on:keyup="defineContactEmail($event.target.value)"
                  placeholder="email"
                ></v-text-field>
                <v-btn v-if="!addingContact" @click="addContact(newContactEmail)">Add</v-btn>
                <v-progress-circular
                  v-if="addingContact"
                  indeterminate
                  color="primary"
                ></v-progress-circular>
                <v-alert
                  v-model="alert"
                  border="left"
                  dismissible
                  :color="addContactResponseMessage == 'Success' ? 'green lighten-2' : 'red lighten-2' "
                > 
                  {{ addContactResponseMessage }}
                </v-alert>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols=12 style="padding: 0">
          <v-list three-line v-if="!contactsLoading">
            <template  v-for="(item, index) in contacts">
              <v-list-item
                v-if="item.status != 'rejected_by_me' && !item.loading"
                :key="index"
                v-on="item.status == 'connecteds' ? { click: () => selectChat(item) } : {}"
              >
                <v-list-item-avatar>
                  <img :src="'https://cdn.vuetifyjs.com/images/lists/1.jpg'">
                </v-list-item-avatar>
                
                <v-badge v-if="Object.keys(mainNotifications).length > 0 && mainNotifications.hasOwnProperty(NEW_MESSAGE) && mainNotifications[NEW_MESSAGE][item._id] "
                  :content="mainNotifications[NEW_MESSAGE][item._id] ? mainNotifications[NEW_MESSAGE][item._id].length : null"
                  :value="mainNotifications[NEW_MESSAGE][item._id] ? mainNotifications[NEW_MESSAGE][item._id].length : null"
                  color="green"
                  overlap
                ></v-badge>
                <v-list-item-content>
                  <v-list-item-title v-html="item.email"/>
                                    
                  <v-list-item-subtitle v-if="item.status == 'requested_by'"> New contact request </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.status == 'sent'"> Pending </v-list-item-subtitle>
                  <div v-else-if="item.status == 'rejected_by_contact'">
                    <v-list-item-subtitle > Request rejected </v-list-item-subtitle>
                    <v-btn @click="handleContactRequest(item._id, 'RESEND', index)">resend</v-btn>
                    <v-btn @click="handleContactRequest(item._id, 'RESEND_CANCEL', index)">cancel</v-btn>
                  </div>
                  
                  <v-list-item-subtitle v-if="item.status == 'connecteds'"> {{item.lastMessage ? item.lastMessage.message : 'Start chat'}} </v-list-item-subtitle>

                  <v-btn 
                    v-if="item.status == 'requested_by'" 
                    @click="handleContactRequest(item._id, 'ACCEPTED', index)"
                    elevation="2"
                    icon
                    outlined
                  >accept</v-btn>
                  <v-btn 
                    v-if="item.status == 'requested_by'" 
                    elevation="2"
                    icon
                    outlined
                    @click="handleContactRequest(item._id, 'REJECTED', index)"
                  >reject</v-btn>
                </v-list-item-content>
                <v-menu 
                  offset-y
                  v-if="item.status == 'connecteds'"
                >
                    <template v-slot:activator="{ on, attrs }" >
                      <v-btn
                      
                        color="black"
                        elevation="2"
                        icon
                        outlined
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>
                          mdi-chevron-down
                        </v-icon>
                        
                      </v-btn>
                    </template>
                    <v-list-item>
                      <a title="You and your contact, cannot receive or send messages until unblock">Block contact</a>
                    </v-list-item>
                    <v-list-item>
                      <a title="Delete contact.">Delete contact</a>
                    </v-list-item>
                  </v-menu>
                  
              </v-list-item>
            </template>
          </v-list>
          <!-- <v-list v-else>
            <v-progress-linear
              indeterminate
              color="yellow darken-2"
            ></v-progress-linear>
          </v-list> -->
        </v-col>
      </v-row>
    </v-col>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { axiosRequest, emailRegex } from '@/helpers/index'
import { Socket } from 'vue-socket.io-extended'
import { CONTACT_REQUEST, NEW_MESSAGE } from "@/constants";
import _ from 'lodash';

@Component
export default class Contacts extends Vue {

  NEW_MESSAGE = NEW_MESSAGE;
  CONTACT_REQUEST = CONTACT_REQUEST;
  lodash = _;
  newContactEmail = "";
  contacts = this.allContacts;
  addContactResponseMessage = "";
  alert = false;
  api: string = (this.$root as any).urlApi;
  addingContact = false;
  contactsLoading = false;
  mainNotifications = this.mainNotif;

  defineContactEmail(val: string) {
    this.newContactEmail = val;
  }

  
  get mydata() {
    return this.$store.getters.user;
  }
  
  get allContacts() {
    // const contacts = this.orderBy(this.$store.getters.allContacts, 'lastMessage.timestamp', 'desc')
    // return contacts;
    return this.$store.getters.allContacts
  }

  get mainNotif() {
    return this.$store.getters.mainNotifs
  }

  @Watch('$store.state.mainNotifications', {deep: true})
  onMainNotificationsChange(val: any) {
    this.mainNotifications = val;
  }

  selectChat(item: any) {
    this.$emit('chatSelected', item)
    this.$store.commit('readChat', item._id);
  }

  orderBy(array, element, type) {
    return this.lodash.orderBy(array, [element], [type]);
  }

  async handleContactRequest(contactId: string, event: string, index: any) {
    this.contacts[index].loading = true;
    const myId = this.mydata._id;

    try {
      const response = await axiosRequest('POST', this.api+'/user/handle-contact-request', 
        {
          contactId: contactId, 
          myId: myId, 
          event: event
        }, 
        { 
          headers: {"x-auth-token": this.$cookies.get('jwt')
        }
      })
      this.$store.commit('readNotifications', this.mainNotifications)
      this.contacts[index].loading = false;
      this.contactsLoading = false;
        
    } catch (error) {
      this.contactsLoading = false;
      this.contacts[index].loading = false;
      throw new Error(error)
    }
  }
  mounted() {
    this.contacts = this.orderBy(this.allContacts, 'lastMessage.timestamp', 'desc');
  }

  @Watch('$store.state.allContacts', { deep: true })
  onChangeContacts(val: any) {
    const sorted = this.orderBy(val, 'lastMessage.timestamp', 'desc');
    this.contacts = sorted
    this.contactsLoading = false;
  }

  async addContact(email: string) {
    this.alert = false;
    this.addContactResponseMessage = "";
    
    if(this.mydata.email == this.newContactEmail) {
      this.addContactResponseMessage = "You can't add yourself ۜ(סּ_סּَ`)";
      this.alert = true;
      return;
    }

    if(emailRegex(this.newContactEmail)){
      
      this.addingContact = true;
      const response = await axiosRequest('POST', this.api + '/user/add-contact', 
        { myEmail: this.mydata.email, contactEmail: this.newContactEmail }, 
        { headers: { "x-auth-token": this.$cookies.get('jwt') }
      })

      switch (response.status) {
        case 500:
          this.addingContact = false;
          this.addContactResponseMessage = response.data.error;
          this.alert = true;
          break;
        case 403:
          this.addingContact = false;
          this.addContactResponseMessage = response.data.message;
          this.alert = true;
          break;
        default:
          this.addingContact = false;
          this.addContactResponseMessage = 'Success';
          this.alert = true;
          this.$store.commit('addContact', response.data.contact_data)
          break;
      }
    } else {
      this.addContactResponseMessage = "Invalid email format";
      this.alert = true;
      return;
    }
  }
}
</script>
<style lang="scss">

.v-list {
  transition: all 0.9s ease-out;
}

.col-contacts {
  background: linear-gradient($main_2, $main_3);
  border-right: 1px solid #b4b4b4;
  padding-top: 0 !important;
  .v-list {
    background-color: transparent !important;
    .v-list-item__content {
      color: white !important;
      font-weight: 600;
    }
    .v-list-item__subtitle {
      color: white !important;
      font-weight: 100;
    }
  }
}
.bg-header {
  background-color: $main_1;
}
.v-list {
  padding: 0 !important;
}
.theme--light.v-expansion-panels .v-expansion-panel {
  background-color: $main_2 !important;
  color: white !important;
}
.v-avatar {
  transition: none !important;
}

</style>