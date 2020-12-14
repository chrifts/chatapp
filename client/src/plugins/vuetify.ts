import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
    theme: { 
        dark: true,
        themes: {
            light: {
                primary: '#f0f0f0',
                secondary: '#b0bec5',
                accent: '#8c9eff',
                error: '#b71c1c',
                icons: '#636363'
            },
            dark: {
                primary: '#505050',
                secondary: '#b0bec5',
                accent: '#8c9eff',
                error: '#b71c1c',
                icons: '#f3f3f3'
            },
        },
    },
    breakpoint: {
        mobileBreakpoint: 599
    }
});
