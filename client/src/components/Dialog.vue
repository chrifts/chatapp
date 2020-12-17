<template>
    <v-dialog
      v-model="dialog"
      width="500"
      persistent
    >
      <!-- <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="red lighten-2"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Click Me
        </v-btn>
      </template> -->

      <v-card>
        <v-card-title class="headline secondary">
          Info
        </v-card-title>

        <v-card-text>
            <p>
                <strong>English:</strong>
                This website is for portfolio purposes, show the work of the developer. It is hosted entirely on an "EC2" instance of "Amanzon Web Services" located in the Eastern United States (Ohio), therefore the data entered will be stored there. If you continue to use this website, we assume that you accept these conditions. 
                Responsible for this website: <a class="blue--text" href="/cristihanschweizer">Cristihan Schweizer.</a> 
            </p>
            <p>
                <strong>Español:</strong>
                
                Esta web es para fines de portfolio, mostrar el trabajo del desarrollador. Esta está alojada en su totalidad en una instancia "EC2" de "Amanzon Web Services" ubicada en EE.UU. Este (Ohio), por lo tanto los datos ingresados serán almacenados allí. Si continúa utilizando esta web, damos por sentado que acepta estas condiciones. 
                Responsable de esta web: <a class="blue--text" href="/cristihanschweizer">Cristihan Schweizer.</a> 
            </p>
            
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color="success"
            text
            @click="acceptConditions()"
          >
            I accept
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script lang="ts">

import Vue from "vue";
import Component from "vue-class-component";

@Component({
    name: 'Dialog',
})
export default class Dialog extends Vue {
    dialog = localStorage.getItem('mainDialog') == 'accepted' ? false : true;
    acceptConditions() {
        localStorage.setItem('mainDialog', 'accepted')
        this.dialog = false;
    }
}

</script>
