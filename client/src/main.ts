import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import dotenv from 'dotenv';
import { axiosRequest, getCookies } from './helpers/index'
import VueCookies from "vue-cookies-ts"
Vue.use(VueCookies);
import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client';
import { MAIN_APP_CONTACT_HANDLER, MAIN_APP_MESSAGES } from './constants';
import { defaultSocketEvents, customSocketEvents } from './helpers';
dotenv.config();
import { Plugins } from '@capacitor/core';
import '@capacitor-community/http';


let app: Vue;
const urlApi: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_API! : process.env.VUE_APP_API_PROD!;
const socketUrl: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_SOCKET_URL! : process.env.VUE_APP_SOCKET_URL_PROD!;

async function auth() {
  store.commit("setMainLoading", true);
  const sessionToken = Vue.cookies.get('jwt');
  const refreshToken = Vue.cookies.get('refreshToken')
  if(sessionToken) {
    const user = await axiosRequest('POST', urlApi + '/get-user', {}, {headers: {"x-auth-token": sessionToken}})
    if(user.data.email) {
      //join main socket namespace
      const socket = io(socketUrl + '/user-'+user.data._id);
      Vue.use(VueSocketIOExt, socket, { store });
      defaultSocketEvents(socket, {store: store, context: 'mainSocket'});
      customSocketEvents(socket, MAIN_APP_CONTACT_HANDLER, store, { user: user.data, jwtKey: sessionToken })
      customSocketEvents(socket, MAIN_APP_MESSAGES, store)
      store.commit("setUser", user.data);
      store.commit("setMainLoading", false);
      return true;
    }
    if(user.data.message == 'Session timed out,please login again') { 
      const _refreshToken = await axiosRequest('POST', urlApi + '/auth/refresh_token', {refreshToken: refreshToken})
      if (_refreshToken.data.message == 'jwt expired' || _refreshToken.data.error == 'Token expired!') {
        axiosRequest('POST', urlApi + '/auth/logout', {refreshToken: refreshToken} )
        store.dispatch("LOGOUT_USER");
        Vue.cookies.remove('jwt');
        Vue.cookies.remove('refreshToken');
        store.commit("setMainLoading", false);
        return false;
      } else {
        //refresh cookie access token
        Vue.cookies.set('jwt', _refreshToken.data.accessToken)
        store.commit("setMainLoading", false);
        location.reload();
        return true;
      }
    }
  } else {
    console.log('ELSE')
    store.commit("setUser", null);
    store.commit("setMainLoading", false);
    return false;
  }
}



const init = () => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      components: {
        App,
      },
      data: ()=>({
        urlApi: urlApi,
        platform: {}
      }),
      beforeCreate: async function () {        
        this.$cookies.config(
          {
            expires: '30d',
            path: '/',
          }
        );
        const { Device } = Plugins;
        const info = await Device.getInfo();
        this.$data.platform = info;
      },
      watch: {
        '$store.state.user': async function(user) {
          if(user) {
            if(!this.$socket){
              //TODO MAKE FUNCTION OF THIS BLOCK
              const socket = io(socketUrl + '/user-'+user._id);
              const sessionToken = this.$cookies.get('jwt');
              Vue.use(VueSocketIOExt, socket, { store });
              defaultSocketEvents(socket, {store: store, context: 'mainSocket'});
              customSocketEvents(socket, MAIN_APP_CONTACT_HANDLER, store, { user: user.data, jwtKey: sessionToken })
              customSocketEvents(socket, MAIN_APP_MESSAGES, store)
              //END BLOCK
            } else {
              this.$socket.client.connect();
            }
            store.commit("setMainLoading", false);

          } else {
            store.commit("setUser", null);
            store.commit("setMainLoading", false);
            router.push({ name: "Login" });
          }
          
        }        
      },
      render: function (createElement) {
        return createElement('App');
      }
    }).$mount("#app");
  }
};    

auth().then((logged)=> {
  init();
})