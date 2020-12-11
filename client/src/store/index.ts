import { CONTACT_REQUEST, NEW_MESSAGE } from "@/constants";
import { axiosRequest } from "@/helpers";
import Vue from "vue";
import Vuex from "vuex";
import router from "../router";

Vue.use(Vuex);

interface Notifications { 
  [type: string]: { 
    [from: string]: Array<[]>; 
  }; 
}
const notif: Notifications = { };

export default new Vuex.Store({
  state: {
    firstLoad: false,
    user: null,
    status: null,
    selectedChat: null,
    mainLoading: false,
    mainNotifications: notif,
    contactsLoading: true,
    allContacts: [{
      _id: String,
      status: String,
      lastMessage: {},
      notifications: {},
    }],
    mainAppSocketStatus: 'connecting...'
  },
  mutations: {
    readNotifications(state, payload) {
      const notifications = payload;
      Object.entries(notifications).forEach(([ix, el])=>{
          Object.entries((el as {})).forEach(([i, e])=>{ 
              (e as []).forEach(notf => {
                  (notf as any).status = 'read'
              });
          })
      })
      state.mainNotifications = notifications;
      state.mainNotifications = {...state.mainNotifications}
    },
    readChat(state, payload) {
      if(state.mainNotifications[NEW_MESSAGE] && state.mainNotifications[NEW_MESSAGE][payload]){
        delete state.mainNotifications[NEW_MESSAGE][payload]
        state.mainNotifications = {...state.mainNotifications}
      }
      
    },
    updateNotifications(state, payload){
      if(payload == 'logout') {
        state.mainNotifications = {};
        state.mainNotifications = {...state.mainNotifications}
        return;
      }
      if(payload.notification) {
        
        const contacto = state.allContacts.filter(contact => contact._id == payload.from);
        const _cont = (contacto[0] as any)
        
        if(state.mainNotifications[payload.type]) {
          state.mainNotifications[payload.type][_cont._id] ? null : state.mainNotifications[payload.type][_cont._id] = [];
          switch (payload.type) {
            case NEW_MESSAGE:
              state.mainNotifications[payload.type][_cont._id].push(payload)    
              break;
            case CONTACT_REQUEST:
              state.mainNotifications[payload.type][_cont._id] = []  
              state.mainNotifications[payload.type][_cont._id].push(payload)
              break;
            default:
              break;
          }
          
          state.mainNotifications = {...state.mainNotifications}
        } else {
          state.mainNotifications[payload.type] = {}
          state.mainNotifications[payload.type][_cont._id] = []
          switch (payload.type) {
            case NEW_MESSAGE:
              state.mainNotifications[payload.type][_cont._id].push(payload)    
              break;
            case CONTACT_REQUEST:
              state.mainNotifications[payload.type][_cont._id] = []  
            state.mainNotifications[payload.type][_cont._id].push(payload)
              break;
            default:
              break;
          }
          state.mainNotifications = {...state.mainNotifications}
        }
      }
      if(payload.notifications) {
        state.mainNotifications = payload.notifications; 
      }
    },
    updateContactLastMessage(state, payload) {
      state.allContacts.forEach((contact: any, index) => {
        if(contact._id == payload.to || contact._id == payload.from) {
          state.allContacts[index].lastMessage = { message: payload.message, timestamp: payload.timestamp}
          state.allContacts = [...state.allContacts];
        }
      })
    },
    setMainAppSocketStatus(state, payload) {
      state.mainAppSocketStatus = payload;
    },
    setFirstLoad(state, payload) {
      state.firstLoad = payload
    },
    SOCKET_setContacts(state, payload) {
      state.allContacts = payload;
    },
    addContact(state, payload) {
      if(payload.extraDataFrom) {
        state.allContacts.push(payload.extraDataFrom)
      } else {
        state.allContacts.push(payload)
      }
      
    },
    updateContactStatus(state, payload) {
      //console.log(payload);
      switch (payload.event) {
        case 'ACCEPTED':
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.contactId) {
              state.allContacts[index].status = payload.status
            }
          })
          break;
        case 'RESEND':
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.contactId) {
              state.allContacts[index].status = payload.status
            }
          })
          break;
        case 'RESEND_BY_REJECTOR':
          console.log(payload)
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.payload.from) {
              state.allContacts[index].status = payload.payload.message.requestStatus
            }
          })
          break;
        case 'REJECTED':
          state.allContacts.forEach((contact: any, index) => {
            if(contact._id == payload.contactId) {
              state.allContacts[index].status = payload.status
            }
          })
          break;
        default:
          break;
      }
    },
    setUser(state, payload) {
      state.user = payload;
    },
    setStatus(state, payload) {
      state.status = payload;
    },
    setSelectedChat(state, payload) {
      state.selectedChat = payload;
    },
    setMainLoading(state, payload) {
      state.mainLoading = payload;
    },
    setContactsLoading(state, payload) {
      state.contactsLoading = payload
    }
  },
  actions: {
    
    async GET_CONTACTS({commit}, payload) {
      console.log(payload);
      const urlApi: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_API! : process.env.VUE_APP_API_PROD!;
      const res = await axiosRequest('POST', urlApi + '/user/get-contacts', {}, {headers: {"x-auth-token": payload.jwtKey}})
      commit('SOCKET_setContacts', res.data.contacts);
      commit('setContactsLoading', false)
      return res;
    },
    SET_USER({commit}, payload) {
      
      commit('setUser', payload)
      if(payload.notifications) {
        this.dispatch('UPDATE_NOTIF', payload)
      }
    },
    UPDATE_NOTIF({commit}, payload) {
      commit('updateNotifications', payload)
    },
    REGISTER_USER({ commit }, payload) {
      commit("setStatus", "busy");
      commit("setUser", payload);
      commit("setStatus", "success");
      router.push("/");
        
    },
    LOGOUT_USER({ commit }) {
      commit('setFirstLoad', false);
      commit("setStatus", "busy");
      commit("setUser", null);
      commit('updateNotifications', 'logout')
      commit("SOCKET_setContacts", []);
      commit("setStatus", "success");
      router.push("/login");
    }
  },
  getters: {
    contactsLoading(state) {
      return state.contactsLoading;
    },
    contactData: (state) => (_id) => {
      
      const contacto = state.allContacts.filter(contact => contact._id == _id);
      
      (contacto[0] as any).notifications = {};
      // (contacto[0] as any).lastMessage = {};
      return contacto[0];
      // return state.allContacts[_]
    },
    
    mainNotifs(state) {
      return state.mainNotifications;
    },
    mainAppSocketStatus(state) {
      return state.mainAppSocketStatus;
    },
    firstLoad(state) {
      return state.firstLoad
    },
    allContacts(state) {
      return state.allContacts;
    },
    selectedChat(state) {
      return state.selectedChat;
    },
    mainLoading(state) {
      return state.mainLoading
    },
    status(state) {
      return state.status;
    },
    user(state) {
      return state.user;
    }
  },
  modules: {}
});
