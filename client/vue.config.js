module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: "",
  css: {
    loaderOptions: {
      scss: {
        prependData: `
          @import "@/scss/_variables.scss";
        `
      }
    }
  }
};
