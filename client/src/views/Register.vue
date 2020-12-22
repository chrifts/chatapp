<template>
  <v-container fluid v-if="!loading" style="overflow-y: scroll; padding: 0 !important">
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 style="position: relative; top: 0px" class="mb-10 pb-4">
        <v-card class="elevation-12">
          <v-toolbar color="primary">
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                prepend-icon="person"
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
              ></v-text-field>
              <v-text-field
                prepend-icon="person"
                v-model="firstName"
                label="Name"
                required
              ></v-text-field>
              <v-text-field
                prepend-icon="person"
                v-model="lastName"
                label="Last name"
                required
              ></v-text-field>
              <v-text-field
                prepend-icon="lock"
                v-model="password"
                :rules="passwordRules"
                label="Password"
                required
                :append-icon="
                  passwordShow ? 'visibility' : 'visibility_off'
                "
                :type="passwordShow ? 'text' : 'password'"
                @click:append="passwordShow = !passwordShow"
              ></v-text-field>
              <v-text-field
                prepend-icon="lock"
                v-model="confirmPassword"
                label="Confirm Password"
                :rules="passwordRules"
                required
                :append-icon="confirmPasswordShow ? 'visibility' : 'visibility_off'"
                :type="confirmPasswordShow ? 'text' : 'password'"
                @click:append="confirmPasswordShow = !confirmPasswordShow"
              ></v-text-field>
              <v-checkbox
              inline
              :class="{'required' : requireCheck}"
              :label="requireCheck ? textConsent + ' Consent is required' : textConsent"
              v-model="checkbox" 
            >{{textConsent}}</v-checkbox>
            </v-form>
          </v-card-text>
          <v-btn icon class="mx-1" small outlined @click="lang = 'ES'">ES</v-btn>
          <v-btn icon class="mx-1" small outlined @click="lang = 'EN'">EN</v-btn>
          <br>
          <v-btn :disabled="!valid" color="success" class="my-3" @click="register"
              >Register</v-btn
            >
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>

</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Model, Prop } from 'vue-property-decorator';
import store from '../store/index'
import { axiosRequest } from '../helpers/index'
import router from '../router';

@Component({
  name: 'Register',
})
export default class Register extends Vue {
  
  loading = this.$store.getters.mainLoading;

  public passwordShow = false;
  public confirmPasswordShow = false;
  public valid = false;
  public email = "";
  public firstName = "";
  public lastName = "";
  //PHONE
  public emailRules = [
    (v: any) => !!v || "E-mail is required",
    (v: any) => /.+@.+/.test(v) || "E-mail must be valid"
  ];
  public password = "";
  public confirmPassword = "";
  public passwordRules = [
    (v: any) => !!v || "Password and Confirm password Required"
  ];
  lang = 'EN'
  checkbox = false;
  textConsent = this.textC(this.lang)
  requireCheck = false;
  
  @Watch('checkbox')
  onCheckChange(val) {
    if(val == true) {
      this.requireCheck = false
    } else {
      this.requireCheck = true
    }
  }
  
  @Watch('lang')
  onChange(val) {
    this.textConsent = this.textC(val)
  }

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

  textC(lang) {
    let text = '';
    switch (lang) {
      case 'ES':
        text = 'Confirmo que los datos ingresados son ficticios y no he ingresado ningún dato personal. El uso de esta web es a modo de prueba.'
        break;
      case 'EN':
        text = 'I confirm that the data entered are fictitious and I have not entered any personal data. The usage of this web is for testing purpose.'
        break;
      default:
        text = 'Confirmo que los datos ingresados son ficticios a modo de prueba y no he ingresado ningún dato personal'
        break;
    }
    return text;
  }
  public register() {
    if (
      (this.$refs.form as Vue & { validate: () => boolean }).validate() &&
      this.confirmPassword == this.password &&
      this.checkbox
    ) {
      console.log("Form is valid");
      this.createUser();
    } else {
      this.requireCheck = true;
    }
  }
  

  async createUser() {
    // store.commit("setMainLoading", true);
    const res = await axiosRequest('POST', (this.$root as any).urlApi + '/auth/signup', {
      email: this.email,
      password: this.password,
      profile: {
        name: this.firstName,
        lastName: this.lastName,
      }
    })
    console.log(res);
    if(res.status == 201) {
     router.push('/')
    }
  }
  @Watch('$store.state.mainLoading')
  onMainLoading(val: any) {
    
    this.loading = val;
  }
}
</script>

<style lang="scss">
  .mt-10 {
    margin-top: 15rem;
  }
  .required {
    .v-label{
      color: red !important;
    }
  }
</style>