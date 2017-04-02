// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    index: path.resolve(__dirname, 'dist/index.html'),
    assetsRoot: path.resolve(__dirname, 'dist'),
    assetsSubDirectory: 'dest',
    assetsPublicPath: '/',
    productionSourceMap: true,
    hash: false, //
    defaultVersion: '0.0.0',
    dev: {
      hash: false,
      version: '0.0.0',
      assetsPublicPath: 'http://61.155.159.109:8038/dujia/js/ebk/v/'
    },
    prod: {
      hash: true,
      version: '',
      assetsPublicPath: 'http://61.155.159.109:8038/dujia/js/ebk/v/'
    },
    pageRoot: path.resolve(__dirname, './src/app')
  },
  dev: {
    port: 8081,
    proxyTable: {
      //'/ivacation': {
      //  target: '',
      //  changeOrigin: true,
      //  pathRewrite: {
      //
      //  }
      //}
    }
  }
}
