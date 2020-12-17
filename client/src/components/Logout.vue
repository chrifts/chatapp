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
import { Prop } from "vue-property-decorator";
@Component({
    name: 'Logout',
})
export default class Logout extends Vue {
    @Prop() reload?: any; 
    public lgout() {
        axiosRequest('POST', (this.$root as any).urlApi + '/auth/logout', {refreshToken: this.$cookies.get('refreshToken')} )
        store.commit("setMainLoading", true);
        if(this.$socket && this.$socket.client) {
            this.$socket.client.disconnect();
        }
        console.log(this.reload)
        this.$store.dispatch("LOGOUT_USER", this.reload);
        this.$cookies.remove('jwt');
        this.$cookies.remove('refreshToken');
    }
}

</script>
