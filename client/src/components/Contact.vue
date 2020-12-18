<template>
    <v-list-item>
        <v-list-item-avatar>
            <v-img src="../assets/img.jpg"></v-img>
        </v-list-item-avatar>
        <v-list-item-content class="text--primary">
            <v-list-item-title v-html="'Cristihan Schweizer'" />
            <v-list-item-subtitle> 
                <v-btn color="green" text @click="_emit('add-dev')">
                    Contact the developer! 
                </v-btn>
                

            </v-list-item-subtitle>
           
        </v-list-item-content>
        <v-btn icon @click="removeDev">
            <v-icon>
                mdi-close
            </v-icon>
        </v-btn>
        </v-list-item>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  name: 'Contact',
})
export default class Contact extends Vue {
    _emit(evt) {
        this.$emit(evt)
    }
    removeDev() {
        localStorage.setItem('hideDev', 'true')
        this.$emit('remove')
    }
}
</script>

