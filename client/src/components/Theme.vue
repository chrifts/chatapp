<template>
    <v-btn color="icons" text @click="changeTheme">
        {{ $vuetify.breakpoint.mobile ? '' : 'Switch Theme' }}
        <v-icon center color="icons">
          mdi-theme-light-dark
        </v-icon>
      </v-btn>
</template>
<script lang="ts">

import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from 'vue-property-decorator';

@Component({
    name: 'Theme',
})
export default class Theme extends Vue{ 
  changeTheme(){
    const val = this.$vuetify.theme.dark ? false : true
    this.$vuetify.theme.dark = val;
    localStorage.setItem("dark", val.toString());
  }
}
</script>