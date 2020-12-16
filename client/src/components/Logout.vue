<template>
    <v-btn text color="icons" @click="lgout">
          Logout
          <v-icon color="icons" center>exit_to_app</v-icon>
    </v-btn>
</template>
<script lang="ts">

import Vue from "vue";
import Component from "vue-class-component";
import store from '../store/index'
import { axiosRequest } from '../helpers';
@Component({
    name: 'Logout',
})
export default class Logout extends Vue {
    
    public lgout() {
        axiosRequest('POST', (this.$root as any).urlApi + '/auth/logout', {refreshToken: this.$cookies.get('refreshToken')} )
        store.commit("setMainLoading", true);
        if(this.$socket.client) {
            this.$socket.client.disconnect();
        }
        this.$store.dispatch("LOGOUT_USER");
        this.$cookies.remove('jwt');
        this.$cookies.remove('refreshToken');
    }
}

</script>
