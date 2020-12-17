<template>
  <div class="profile" id="main-view">
    <v-avatar color="indigo" class="mt-5" size="70" >
      <img src="https://media-exp1.licdn.com/dms/image/C4D35AQFVZliIFSUTEQ/profile-framedphoto-shrink_400_400/0/1605282359140?e=1608300000&v=beta&t=woBcUkkHRSuIE91TL_snDNFPv7T-ivBXI-Aoi7-jUsM" alt="">
    </v-avatar>
    <h3 class="text--primary">Cristihan Schweizer</h3>
    <v-container>
      <v-row >
        <v-col v-if="!$vuetify.breakpoint.mobile" md=3></v-col>
        <v-col xs=12 md=6>
          <!-- Experience -->
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header color="secondary">
                Experience
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card-text :class="{'height' : $vuetify.breakpoint.mobile}">
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
</style>