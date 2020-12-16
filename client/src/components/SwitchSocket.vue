<template>
    <div class="switch-mobile">
        <v-switch 
            color="success" 
            :loading="loading"
            :disabled="loading"
            value
            @click="clicked(switchSocket)"
            :input-value="switchSocket"
            v-model="switchSocket"/>
    </div>
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

    mounted() {
        this.switchSocket = this.mainAppSocketStatus == 'connected' ? true : false;
        this.loading = false;
    }

    clicked(val){
        if(val) {
            this.$store.commit('setMainAppSocketStatus', 'connecting...')
            this.$root.$emit('connectToMainSocket');
        } else {
            this.$root.$emit('disconnectAllSockets');
        }
    }
}
</script>

<style lang="scss" scoped>
.v-input--selection-controls {
    margin-top: 12px;
}
.switch-mobile {
    display: block;
    width: fit-content;
    margin: 0 auto;
}

</style>