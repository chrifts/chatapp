<template>
    <v-col :cols="$vuetify.breakpoint.mobile ? 12 : 4" class="col-contacts" backgroundColor="primary">
      <v-row class="bg-header">
        <v-col cols=12>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header color="primary">
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
              <v-expansion-panel-content color="secondary lighten-3">
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
                  :color="addContactResponseMessage == 'Success' ? 'green lighten-2' : 'red lighten-2'"> 
                  {{ addContactResponseMessage }}
                </v-alert>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols=12 style="padding: 0">
          <template v-if="contactError != null">
            {{contactError}}
          </template>
          <v-list three-line v-if="!contactsLoading">
            <Contact v-if="!hideDev && !contacts.some(e => e.email === 'schweizercristian@gmail.com')" 
              v-on:add-dev="addContact('schweizercristian@gmail.com')"
              v-on:remove="hideDevCard()"
              />
            <template  v-for="(item, index) in contacts">
              <v-list-item
                v-if="item.status != 'rejected_by_me'"
                :key="index"
                v-on="item.status == 'connecteds' && !loadingChat && !item.active ? { click: (evt) => selectChat(evt, item, index) } : {}"
                :class="{'darken' : loadingChat, 'selected':item.active}"
                >
                <v-list-item-avatar>
                  {{dt(item)}}
                  <v-img v-if="item.email == 'schweizercristian@gmail.com'" src="../../assets/img.jpg" ></v-img>
                  <img v-else :src=" 'https://cdn.vuetifyjs.com/images/lists/1.jpg'">
                  
                </v-list-item-avatar>
                
                <v-badge v-if="Object.keys(mainNotifications).length > 0 && mainNotifications.hasOwnProperty(NEW_MESSAGE) && mainNotifications[NEW_MESSAGE][item._id] "
                  :content="mainNotifications[NEW_MESSAGE][item._id] ? mainNotifications[NEW_MESSAGE][item._id].length : null"
                  :value="mainNotifications[NEW_MESSAGE][item._id] ? mainNotifications[NEW_MESSAGE][item._id].length : null"
                  color="green"
                  overlap
                ></v-badge>
                <v-list-item-content class="text--primary">
                  <v-list-item-title v-html="item.profile.name +' '+ item.profile.lastName" />
                  <v-list-item-subtitle v-if="item.status == 'requested_by'"  > New contact request </v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.status == 'sent'"> Pending </v-list-item-subtitle>
                  <div v-else-if="item.status == 'rejected_by_contact'">
                    <v-list-item-subtitle > Request rejected </v-list-item-subtitle>
                    <v-btn 
                      :loading="item.loading"
                      :disabled="item.loading"
                      elevation="2"
                      class="px-2 mr-1 mt-2"
                      outlined
                      small
                      @click="handleContactRequest(item._id, 'RESEND', index)">resend
                        <v-icon>
                          mdi-arrow-top-right
                        </v-icon>
                      </v-btn>
                    <v-btn 
                      :loading="item.loading"
                      :disabled="item.loading"
                      elevation="2"
                      class="px-2 mr-1 mt-2"
                      outlined
                      small
                      @click="handleContactRequest(item._id, 'RESEND_CANCEL', index)">cancel
                        <v-icon>
                          mdi-close
                        </v-icon>
                      </v-btn>
                  </div>
                  <v-list-item-subtitle v-if="item.status == 'connecteds'"> {{item.lastMessage ? item.lastMessage.message : 'Start chat'}} </v-list-item-subtitle>
                  <v-sheet color="primary">
                    <v-btn 
                      v-if="item.status == 'requested_by'" 
                      @click="handleContactRequest(item._id, 'ACCEPTED', index)"
                      elevation="2"
                      class="px-2 mr-1 mt-2"
                      outlined
                      small
                    >
                      accept
                      <v-icon>
                        mdi-check
                      </v-icon>
                    </v-btn>
                    
                    <v-btn 
                      v-if="item.status == 'requested_by'" 
                      elevation="2"
                      class="px-2 ml-1 mt-2"
                      outlined
                      small
                      @click="handleContactRequest(item._id, 'REJECTED', index)"
                    >
                    cancel
                      <v-icon>
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </v-sheet>
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
                    <template>
                      <span class="light-blue--text lighten-5">In development</span>
                    </template>
                  </v-menu>
                  
              </v-list-item>
            </template>
          </v-list>
          <v-list v-else>
            <v-progress-linear
              indeterminate
              color="yellow darken-2"
            ></v-progress-linear>
          </v-list>
        </v-col>
      </v-row>
    </v-col>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { axiosRequest, emailRegex } from '../../helpers'
import { Socket } from 'vue-socket.io-extended'
import { CONTACT_REQUEST, NEW_MESSAGE } from "../../constants";
import _ from 'lodash';
import Contact from '@/components/Contact.vue'

@Component({
  name: 'Contacts',
  components: {
    Contact
  }
})
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
  contactsLoading = this.$store.getters.contactsLoading;
  mainNotifications = this.mainNotif;
  contactError = null;
  loadingChat = false;
  hideDev = localStorage.getItem('hideDev') == 'true' ? true : false;

  defineContactEmail(val: string) {
    this.newContactEmail = val;
  }

  dt(q){
    console.log(q)
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

  hideDevCard(){
    this.hideDev = true;
  }

  @Watch('$store.state.loadingChat')
  onLoadedChat(val: any) {
    this.loadingChat = val;
  }

  beforeDestroy(){
    this.contacts.forEach(e=>{
      e.active = false;
    })
    this.contacts = [...this.contacts]
  }

  selectChat(event, item: any, index) {
    this.contacts.forEach(e=>{
      e.active = false;
    })
    this.contacts[index].active = true
    this.contacts = [...this.contacts]
    this.$emit('chatSelected', item)
    //this.$store.commit('readChat', item._id);
  }

  orderBy(array, element, type) {
    return this.lodash.orderBy(array, [element], [type]);
  }

  async handleContactRequest(contactId: string, event: string, index: any) {
    this.contacts[index].loading = true;
    this.contacts = [...this.contacts]
    const myId = this.mydata._id;

    try {
      const response = await axiosRequest('POST', this.api+'/user/handle-contact-request', 
        {
          contactId: contactId,
          event: event
        }, 
        { 
          headers: {"x-auth-token": this.$cookies.get('jwt')
        }
      })

      if(response.status == 500) {
        this.contactsLoading = false;
        this.contacts[index].loading = false;
        this.contacts = [...this.contacts]
        this.contactError = response.data;
      
      }
      
      this.$store.commit('readNotifications', this.mainNotifications)
      this.contactsLoading = false;
        
    } catch (error) {
      this.contactsLoading = false;
      this.contacts[index].loading = false;
      this.contacts = [...this.contacts]
      this.contactError = error;
      throw new Error(error)
    }
  }
  mounted() {
    
    this.contacts = this.orderBy(this.allContacts, 'lastMessage.timestamp', 'desc');
    console.log(this.contacts);
  }

  @Watch('$store.state.allContacts', { deep: true })
  onChangeContacts(val: any) {
    const sorted = this.orderBy(val, 'lastMessage.timestamp', 'desc');
    this.contacts = sorted
    console.log(this.contacts)
    this.contactsLoading = false;
  }

  async addContact(email: string) {
    console.log(email)
    if(email == 'schweizercristian@gmail.com') {
      this.newContactEmail = email
    }
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
        { contactEmail: this.newContactEmail }, 
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
          this.addContactResponseMessage = response.data.error;
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
<style lang="scss" scoped>
.v-expansion-panel::before {
  box-shadow: none;
}
.v-expansion-panels{
  border: 2px solid var(--v-secondary-darken3)
}
.v-menu__content {
  background-color: var(--v-primary-base);
  padding: 10px;
}
</style>
<style lang="scss">
.v-list {
  transition: all 0.9s ease-out;
}

.col-contacts {
  overflow-y: scroll;
  background-color: var(--v-primary-base);
  border-right: 1px solid var(--v-secondary-base);
  padding-top: 0 !important;
  .v-list {
    background-color: transparent !important;
    .v-list-item__content {
      font-weight: 600;
    }
    .v-list-item__subtitle {
      font-weight: 100;
    }
  }
}
.darken {
  background-color: rgba(0, 0, 0, 0.1);
}
.bg-header {
  background-color: var(--v-primary-base);
}
.selected {
  background-color: #0000001c;
}
.v-list {
  padding: 0 !important;
}
.theme--light.v-expansion-panels .v-expansion-panel {
  background-color: var(--v-primary-base);
  color: var(--text);
}
.v-avatar {
  transition: none !important;
}

</style>