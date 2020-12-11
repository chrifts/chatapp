<template>
    <v-switch color="success" 
        :loading="loading"
        :disabled="loading"
        value
        @click="clicked(switchSocket)"
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
    loading = true;
    debugSwitch = true;

    get mainAppSocketStatus() {
        return this.$store.getters.mainAppSocketStatus;
    }

    @Watch('$store.state.mainAppSocketStatus')
    onSocketStatusChange(ss: any) {
        if(ss == 'connected' || ss == 'disconnected') {
            this.loading = false;
            ss == 'connected' ? this.switchSocket = true : this.switchSocket = false;
        } else {
            this.loading = true;
        }
    }

    clicked(val){
        if(val) {
            this.$store.commit('setMainAppSocketStatus', 'connecting...')
            this.$root.$emit('connectToMainSocket');
        } else {
            this.$root.$emit('disconnectAllSockets');
        }
    }

    // @Watch('switchSocket')
    // onSwitchSocket(val){
    //     if(this.debugSwitch) {
    //         this.loading = true;
            
    //     }   
    // }
}
</script>
<style lang="scss" scoped>
.v-input--selection-controls {
    margin-top: 12px;
}
</style>