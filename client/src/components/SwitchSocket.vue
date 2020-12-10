<template>
    <v-switch color="success" 
        :loading="loading"
        :disabled="loading"
        value
        :input-value="switchSocket"
        v-model="switchSocket"/>
</template>
<script lang="ts">

import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from 'vue-property-decorator';

@Component({
    name: 'SwitchSocket',
})
export default class SwitchSocket extends Vue{
    
    switchSocket = this.mainAppSocketStatus == 'connected' ? true : false;
    mainSocketStatus = this.mainAppSocketStatus;
    loading = true;
    debugSwitch = true;
    firstLoad = true;

    get mainAppSocketStatus() {
        return this.$store.getters.mainAppSocketStatus;
    }

    @Watch('$store.state.mainAppSocketStatus')
    onSocketStatusChange(ss: any) {
        this.mainSocketStatus = ss;
        if(ss == 'connected') {
            this.loading = false;
            this.switchSocket = true;
            
        } else {
            this.loading = false;
            this.switchSocket = false;
        }
    }

    @Watch('switchSocket')
    onSwitchSocket(val){
        if(!this.firstLoad){
            this.loading = true;
        }
        if(this.debugSwitch) {
            if(val) {
                this.firstLoad = false;
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
.v-input--selection-controls {
    margin-top: 12px;
}
</style>