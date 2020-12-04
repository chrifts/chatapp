<template>
    <v-sheet class="pa-4" color="primary">
        <v-switch
        color="success"
        v-model="switchSocket"
        ></v-switch>
    </v-sheet>
</template>
<script lang="ts">

import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from 'vue-property-decorator';

@Component({})
export default class SwitchSocket extends Vue{
    
    switchSocket = this.mainAppSocketStatus == 'connected' ? true : false;
    mainSocketStatus = this.mainAppSocketStatus;
    debugSwitch = true;

    get mainAppSocketStatus() {
        return this.$store.getters.mainAppSocketStatus;
    }

    @Watch('$store.state.mainAppSocketStatus')
    onSocketStatusChange(ss: any) {
        this.mainSocketStatus = ss;
        if(ss == 'connected') {
            this.switchSocket = true;
        } else {
            this.switchSocket = false;
        }
    }

    @Watch('switchSocket')
    onSwitchSocket(val){
        if(this.debugSwitch) {
            if(val) {
                this.$root.$emit('connectToMainSocket');
            } else {
                //this.$socket.client.disconnect()
                this.$root.$emit('disconnectAllSockets');
            }
        }   
    }
}
</script>
<style lang="scss" scoped>

</style>