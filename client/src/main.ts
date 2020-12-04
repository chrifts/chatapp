import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import dotenv from 'dotenv';
import { axiosRequest } from './helpers/index'
import VueCookies, { CookiesOption } from "vue-cookies-ts"
Vue.use(VueCookies);
import VueSocketIOExt, { Socket } from 'vue-socket.io-extended'
import { io } from 'socket.io-client';
import { MAIN_APP_CONTACT_HANDLER, MAIN_APP_MESSAGES } from './constants';
import { defaultSocketEvents, customSocketEvents } from './helpers';

dotenv.config();

let app: Vue;
const urlApi: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_API! : process.env.VUE_APP_API_PROD!;
const socketUrl: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_SOCKET_URL! : process.env.VUE_APP_SOCKET_URL_PROD!;

function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
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
      }),
      beforeCreate: async function () {        
        this.$cookies.config(
          {
            expires: '30d',
            path: '/',
          }
        );
        store.commit("setMainLoading", true);
        const sessionToken = this.$cookies.get('jwt');
        const refreshToken = this.$cookies.get('refreshToken')
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
            return;
          }
          if(user.data.message == 'Session timed out,please login again') { 
            const _refreshToken = await axiosRequest('POST', urlApi + '/auth/refresh_token', {refreshToken: refreshToken})
            if (_refreshToken.data.message == 'jwt expired' || _refreshToken.data.error == 'Token expired!') {
              axiosRequest('POST', (this.$root as any).urlApi + '/auth/logout', {refreshToken: refreshToken} )
              this.$store.dispatch("LOGOUT_USER");
              this.$cookies.remove('jwt');
              this.$cookies.remove('refreshToken');
              store.commit("setUser", null);
              store.commit("setMainLoading", false);
              return;
            } else {
              //refresh cookie access token
              this.$cookies.set('jwt', _refreshToken.data.accessToken)
              store.commit("setMainLoading", false);
              location.reload();
              return;
            }
          }
        } else {
          store.commit("setUser", null);
          store.commit("setMainLoading", false);
        }

      },
      watch: {
        '$store.state.user': function(user, before) {
          console.log(user, before);
          if(user) {
            
            // store.commit("setUser", user);
            if(!this.$socket){
              //TODO MAKE FUNCTION OF THIS BLOCK
              const socket = io(socketUrl + '/user-'+user._id);
              const sessionToken = this.$cookies.get('jwt');
              Vue.use(VueSocketIOExt, socket, { store });
              defaultSocketEvents(socket, {store: store, context: 'mainSocket'});
              customSocketEvents(socket, MAIN_APP_CONTACT_HANDLER, store, { user: user.data, jwtKey: sessionToken })
              customSocketEvents(socket, MAIN_APP_MESSAGES, store)
              //END BLOCK
            }
            store.commit("setMainLoading", false);
            if(!store.getters.firstLoad) {
              router.push({ name: "Home" });
            }
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
init();