import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        options: { customProperties: true }, 
        dark: true,
        themes: {
            light: {
                primary: '#f0f0f0',
                secondary: '#f7f7f7',
                accent: '#8c9eff',
                error: '#b71c1c',
                icons: '#636363',
                text: '#000',
                shadow: '#777777',
                chatright: '#dfffcd',
                chatleft: '#ededed'
            },
            dark: {
                primary: '#505050',
                secondary: '#292a2c',
                accent: '#8c9eff',
                error: '#b71c1c',
                icons: '#f3f3f3',
                text: '#fff',
                shadow: '#000',
                chatleft: '#272727',
                chatright: '#0d0d0d'
            },
        },
    },
    breakpoint: {
        mobileBreakpoint: 599
    }
});
