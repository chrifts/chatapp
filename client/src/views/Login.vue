<template>
    <v-container fluid v-if="!loading" style="padding: 0 !important">
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4 style="position: relative; top: 0px"> 
          <v-card class="elevation-12">
            <v-toolbar color="primary">
              <v-toolbar-title>Login</v-toolbar-title>
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
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn :disabled="!valid" color="success" @click="login"
                >Login</v-btn
              >
              <!-- <v-btn color="error" @click="reset">Reset</v-btn> -->
            </v-card-actions>
            <v-alert
              v-model="alert"
              border="left"
              dismissible
              color="warning darken-2"
            > 
                  {{ error.message ? error.message : error.error }}
                </v-alert>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from 'vue-property-decorator';
import { axiosRequest, setCookie } from '../helpers/index'
import router from "../router";
import store from '../store/index'

@Component({
  name: 'Login',
})
export default class Login extends Vue {
  loading = this.$store.getters.mainLoading;
  alert = false;
  error: {} | string = ''; 
  public passwordShow = false;
  public valid = false;
  public email = "";
  public emailRules = [
    (v: any) => !!v || "E-mail is required",
    (v: any) => /.+@.+/.test(v) || "E-mail must be valid"
  ];
  public password = "";
  public passwordRules = [(v: any) => !!v || "Password Required"];

  public async login() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      await this.loginUser();
    }
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

  async loginUser() {
    store.commit("setMainLoading", true);
    try {
      const user = await axiosRequest('POST', (this.$root as any).urlApi + '/auth/login', {
        email: this.email,
        password: this.password
      })
      if(user.data.error) {
        user.data.error == 'No user found!' ? user.data.error = 'Invalid credentials' : null;
        this.alert = true;
        this.error = user.data
        store.commit("setMainLoading", false);
        return;
      }
      // console.log(user);
      this.$cookies.set('jwt', user.data.accessToken, {
        secure: false
      });
      this.$cookies.set('refreshToken', user.data.refreshToken, {
        secure: false
      });
          
      this.$store.dispatch('SET_USER', user.data.user);
      
      router.push({ name: "Home" });
      return;
    } catch (error) {
      this.alert = true;
      this.error = error;
      throw new Error(error);
    }
  }
  @Watch('$store.state.mainLoading')
  onMainLoading(val: any) {
    this.loading = val;
  }
}
</script>
<style lang="scss" scoped>

</style>
