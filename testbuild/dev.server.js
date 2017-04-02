var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('../config')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

var reload = require('reload');
var http = require('http');

//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',webpackConfig);

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  lazy: false,
  stats: false,
  // stats: {
  //   colors: true,
  //   chunks: false
  // }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes

compiler.plugin('compilation', function (compilation) {

/*  compilation.plugin('html-webpack-plugin-before-html-generation', function (data, cb) {
    var json = JSON.parse(data.plugin.assetJson);
    json.splice(json.length - 1,1);
    data.plugin.assetJson = JSON.stringify(json);
    //data.plugin.assetJson.splice(data.plugin.assetJson.length - 1,1);
    console.log('------------html-after:',data);
  });
*/
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    console.log('llllllllllllll-----------');
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
// path.posix.join:compatile writing
var staticPath = path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory)
//console.log('-------',staticPath);
app.use(staticPath, express.static('./static'))

var server = http.createServer(app)

// Reload code here
reload(server, app)

module.exports = server.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
