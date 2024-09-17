const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/Movie/'  // Đường dẫn repo trên GitHub Pages
    : '/',
});
