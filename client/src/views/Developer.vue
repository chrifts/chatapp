<template>
  <div :class="{'height' : $vuetify.breakpoint.mobile, 'heightDesktop':!$vuetify.breakpoint.mobile}" id="main-view">
    <v-container>
      <v-row >
        <v-col v-if="!$vuetify.breakpoint.mobile" sm=1 md=3 lg=3></v-col>
        <v-col xs=12 sm=10 md=6 lg=6>
          <!-- Contact -->
          <v-card 
            max-width="720"
            color="secondary"
            dark
            class="mx-auto mb-3"
            >
            <div class="d-flex justify-space-between"
            :class="{'flex-wrap' : $vuetify.breakpoint.mobile, 'flex-no-wrap' : $vuetify.breakpoint.mobile}">
              <div class="text--primary">
                <v-card-title class="pb-0">
                 <p class="text-h5 text- d-block mb-0">Cristihan Schweizer</p> 
                 
                </v-card-title>
                <v-card-title class="pt-0">
                 
                 <p class="text-h6 d-block mb-0">Full Stack Web Developer</p> 
                </v-card-title>

                <v-card-subtitle class="text-left pb-1 mt-1 text--primary" v-text="'Berlin, Alemania'"></v-card-subtitle>
                <p class="text-caption text-left ml-4 mb-1">+49 157 3392 1251</p>
                <p class="text-caption text-left ml-4">schweizercristian@gmail.com</p>                
              </div>
              <div :class="{'d-block w-100' : $vuetify.breakpoint.mobile}">
                <v-avatar
                  class="ma-3"
                  size="125"
                >
                  <v-img src="../assets/img.jpg"></v-img>
                  
                </v-avatar>
                <v-card-actions class="justify-center" :class="{'mr-7' : !$vuetify.breakpoint.mobile}">
                  <v-spacer v-if="!$vuetify.breakpoint.mobile"></v-spacer>
                  <v-btn target="_blank" href="https://github.com/chrifts" icon>
                    <v-icon color="icons">mdi-github</v-icon>
                  </v-btn>
                  <v-btn target="_blank" href="https://www.linkedin.com/in/cristian-schweizer-full-stack-developer/" icon>
                    <v-icon color="icons">mdi-linkedin</v-icon>
                  </v-btn>
                  
                </v-card-actions>
              </div>   
            </div>
            
          </v-card>
          <!-- Experience -->
          <v-expansion-panels class="mx-mw">
            <v-expansion-panel>
              <v-expansion-panel-header color="secondary">
                Experience
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card-text>
                  <v-timeline
                    align-top
                    dense
                  >
                    <v-timeline-item
                      v-for="(exp, ix) in experiences"
                      :key="ix"
                      :color="exp.color"
                      small
                    >
                      <div>
                        <div class="font-weight-normal">
                          <strong>{{ exp.title }}</strong> @ {{ exp.company }}
                        </div>
                        <div>{{ exp.location }}</div>
                        <div>{{ exp.data }}</div>
                        <div>{{ exp.from }} - {{ exp.to }}</div>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-expansion-panel-content>
            </v-expansion-panel>
            
          </v-expansion-panels >
          <!-- Education -->
          <v-expansion-panels class="mt-3 mx-mw">
            <v-expansion-panel>
              <v-expansion-panel-header color="secondary">
                Education
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card-text>
                  <v-timeline
                    align-top
                    dense
                  >
                    <v-timeline-item
                      v-for="(exp, ix) in educations"
                      :key="ix"
                      :color="exp.color"
                      small
                    >
                      <div>
                        <div class="font-weight-normal">
                          <strong>{{ exp.title }}</strong> @ {{ exp.company }}
                        </div>
                        <div>{{ exp.location }}</div>
                        <div>{{ exp.data }}</div>
                        <div>{{ exp.from }} - {{ exp.to }}</div>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
        <v-col v-if="!$vuetify.breakpoint.mobile" sm=1 md=3 lg=3></v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  name: 'Developer',
})
export default class Developer extends Vue {
  contact = {
    name: 'Cristihan Schweizer',
    img: "../assets/img.jpg"
  }
  experiences = [
    {
      title: 'Full stack web developer', 
      tpye: 'Porfolio',
      company: 'Proyecto personal',
      location: 'Berlin, Germany',
      data: 'Desarrollo de esta web, con VueJS, NodeJS, MongoDB & AWS',
      from: 'Nov 2020',
      to: 'Presente',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Full stack web developer', 
      tpye: 'Colaborador freelance remoto',
      company: 'Mediaelx',
      location: 'Elche, España',
      data: `Colaboración en villasamarillas.com & amayproperties.com`,
      from: 'Sep 2020',
      to: 'Nov 2020',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Full stack web developer', 
      tpye: 'Contract',
      company: 'Ministerio de Producción y Trabajo',
      location: 'Buenos Aires, Argentina',
      data: 'Laravel, PHP, MySQL, Apache, jQuery, Linux',
      from: 'Ene 2019',
      to: 'Ene 2020',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Full stack web developer', 
      tpye: 'Freelance collaboration',
      company: 'Bambox',
      location: 'Buenos Aires, Argentina',
      data: `Colaboración en desarrollo Front end and back end`,
      from: 'Ago 2018',
      to: 'Nov 2018',
      color: 'deep-purple lighten-1',
    }
  ]
  educations = [
    {
      title: 'Estudios y prácticas autodidacta', 
      tpye: 'Bootcamp',
      company: '',
      location: 'Berlin, Alemania',
      data: ``,
      from: 'Ene 2020',
      to: 'Sep 2020',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Certificado en Full stack web developer', 
      tpye: 'Bootcamp',
      company: 'Digital House',
      location: 'Buenos Aires, Argentina',
      data: ``,
      from: 'Feb 2018',
      to: 'Aug 2018',
      color: 'deep-purple lighten-1',
    },
  ]
  mounted() {
    const theme = localStorage.getItem("dark");
    if (theme) {
        if (theme == "true") {
            this.$vuetify.theme.dark = true;
        } else {
            this.$vuetify.theme.dark = false;
        }
    }
  }
}
</script>
<style lang="scss" scoped>
.height {
  height: calc(100vh - 397px);
  overflow-y: scroll;
}
.heightDesktop {
  height: 100%;
  overflow-y: scroll;
}
.w-100 {
  width: 100%;
}
.mx-mw {
  max-width: 720px;
  margin: 0 auto;
}
</style>