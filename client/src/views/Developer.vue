<template>
  <div :class="{'height' : $vuetify.breakpoint.mobile, 'heightDesktop':!$vuetify.breakpoint.mobile}" id="main-view">
    <!-- <v-avatar color="indigo" class="mt-5" size="70" >
      <img src="https://media-exp1.licdn.com/dms/image/C4D35AQFVZliIFSUTEQ/profile-framedphoto-shrink_400_400/0/1605282359140?e=1608300000&v=beta&t=woBcUkkHRSuIE91TL_snDNFPv7T-ivBXI-Aoi7-jUsM" alt="">
    </v-avatar>
    <h3 class="text--primary">Cristihan Schweizer</h3> -->
    <v-container>
      <v-row >
        <v-col v-if="!$vuetify.breakpoint.mobile" md=3></v-col>
        <v-col xs=12 md=6>
          <!-- Contact -->
          <v-card
            color="gray"
            dark
            class="mb-3"
            
          >
            <div class="d-flex justify-space-between"
            :class="{'flex-wrap' : $vuetify.breakpoint.mobile, 'flex-no-wrap' : $vuetify.breakpoint.mobile}">
              <div>
                <v-card-title class="pb-0">
                 <p class="text-h5 d-block mb-0">Cristihan Schweizer</p> 
                 
                </v-card-title>
                <v-card-title class="pt-0">
                 
                 <p class="text-h6 d-block mb-0">Full Stack Web Developer</p> 
                </v-card-title>

                <v-card-subtitle class="text-left pb-1 mt-1" v-text="'Berlin, Germany'"></v-card-subtitle>
                <p class="text-caption text-left ml-4 mb-1">+49 157 3392 1251</p>
                <p class="text-caption text-left ml-4">schweizercristian@gmail.com</p>                
              </div>
              <div :class="{'d-block w-100' : $vuetify.breakpoint.mobile}">
                <v-avatar
                  class="ma-3"
                  size="125"
                  tile
                >
                  <v-img src="../assets/img.jpg"></v-img>
                  
                </v-avatar>
                <v-card-actions class="justify-center">
                  <v-spacer v-if="!$vuetify.breakpoint.mobile"></v-spacer>
                  <v-btn target="_blank" href="https://github.com/chrifts" icon>
                    <v-icon>mdi-github</v-icon>
                  </v-btn>
                  <v-btn target="_blank" href="https://www.linkedin.com/in/cristian-schweizer-full-stack-developer/" icon>
                    <v-icon>mdi-linkedin</v-icon>
                  </v-btn>
                  
                </v-card-actions>
              </div>   
            </div>
            
          </v-card>
          <!-- Experience -->
          <v-expansion-panels>
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
                        <div>{{ exp.data }}</div>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-expansion-panel-content>
            </v-expansion-panel>
            
          </v-expansion-panels>
          <!-- Education -->
          <v-expansion-panels class="mt-3">
            <v-expansion-panel>
              <v-expansion-panel-header color="secondary">
                Education
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card-text :class="{'height' : $vuetify.breakpoint.mobile}">
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
                        <div>{{ exp.data }}</div>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>

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
      company: 'Personal projects',
      location: 'Berlin, Germany',
      data: `This web. VueJS, NodeJS, MongoDB, AWS`,
      from: 'Jan 2020',
      to: 'Present',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Full stack web developer', 
      tpye: 'Remote freelance collaboration',
      company: 'Mediaelx',
      location: 'Berlin, Germany',
      data: `Collaboration in villasamarillas.com & amayproperties.com`,
      from: 'Sep 2020',
      to: 'Nov 2020',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Full stack web developer', 
      tpye: 'Contract',
      company: 'Ministerio de Producción y Trabajo',
      location: 'Buenos Aires, Argentina',
      data: `Laravel, PHP, MySQL, Apache, jQuery, Linux`,
      from: 'Jan 2019',
      to: 'Jan 2020',
      color: 'deep-purple lighten-1',
    },
    {
      title: 'Full stack web developer', 
      tpye: 'Freelance collaboration',
      company: 'Bambox',
      location: 'Buenos Aires, Argentina',
      data: `Front end and back end collaborations`,
      from: 'Ago 2018',
      to: 'Nov 2018',
      color: 'deep-purple lighten-1',
    }
  ]
  educations = [
    {
      title: 'Full stack web developer Certified', 
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
</style>