var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlPluginRemove  = require("html-webpack-plugin-remove");
var webpack = require('webpack');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var utils = require("./utils.js");
var config = require("./config.js");
var path = require("path");
var glob = require("glob");

//定位到源文件目录当前目录下的所有的HTML会生成到目标文件
var rootPath = path.resolve(__dirname,'..','src/app') || config.build.rootPath;
var outputPath = path.resolve(__dirname,'../dest');
//var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
var hotMiddlewareScript = path.resolve(__dirname,'./dev-client.js');

//var rootPath = 'src/app/demo/',

var entry = {};//存放遍历的所有入口文件
var entries = {};
var chunks = [];
//var confPublicPath = '/dest/';
var confPublicPath = 'http://localhost:8081/';

var conf = {
    // entry : {
    //   index : 'index.js'
    // },
    entry : entries,
    output : {
        path : outputPath,
        publicPath: confPublicPath,
        filename : 'static/[name].js'
    },
    module: {
        loaders: [

            {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
            {test: /.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")}
            //,
            //{test: /\.html$/, loader: 'file-loader?name=[path][name].[ext]!extract-loader!html-loader'}
        ]
    },

    plugins: [
        new HtmlPluginRemove(/<script.*?src="\.+.*?\.js"><\/script>/g),//删除HTML中包含相对路径的script标签
        new CleanWebpackPlugin(["../dest/*"],{
            "root": "",
            "verbose": true,
            "dry": false
        }),
/*        new CommonsChunkPlugin({
            name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
            chunks: chunks,
            minChunks: chunks.length // 提取所有entry共同依赖的模块
        }),*/
        // new HtmlWebpackPlugin({
        //   title: 'Myfdsafdsafd',
        //   filename: 'demo/admin.html'
        // }),
        new ExtractTextPlugin('static/[name].css'),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()

    ]
}

var result = [];



utils.getFileFromPath(rootPath).forEach(function(file){

  var relativePath = path.relative(rootPath, file.path);//当前文件相对根目录的路径
  var dirName = path.dirname(relativePath);//文件路径
  var extname = path.extname(file.filename);//文件扩展名
  var baseName = path.basename(file.filename,extname);//文件名称，去除扩展名
  var pathName = path.join(dirName, baseName);//包含文件名称的相对文件路径

    //如果当前文件是HTML文件，
    //则需要读取文件中相对路径的脚本
    if('.html' == extname){

        var resObj = utils.getRelatLabel(file.path);//如果没有获取到包含相对路径的script标签，值为{}
        var length = Object.keys(resObj).length;
        var forChunk = [];

        if(length > 0){

          for(key in resObj){

            var absolutePath = path.resolve(path.dirname(file.path), resObj[key]);//将HTML文件中相对路径的script标签换为绝对路径
            var existInEntry = false;//entry对象中某个属性的值与绝对路径相等为true，不等为false

            //获取相对文件路径，作为入口的key值，防止脚本命名相同
            var tempRelaPath = path.relative(rootPath,absolutePath);
            var tempDirName = path.dirname(tempRelaPath);
            var tempExtName = path.extname(absolutePath);
            var tempBaseName = path.basename(absolutePath,tempExtName);
            var tempPathName = path.join(tempDirName,tempBaseName);


            // 会出现不同页面引用同一个脚本的情况，
            // 此时它们的绝对路径相同，需要排除
            for(item in entry){

              if(entry[item] == absolutePath){

                existInEntry = true;

                var hasCommon = false;//是否已经添加过vendors;
                for(var i = 0;i < forChunk.length;i++){
                  if(forChunk[i] == 'vendors'){
                    hasCommon = true;
                  }
                }
                if(!hasCommon){
                  forChunk.push('vendors');
                }

                break;
              }
            }

            if(!existInEntry){
              entry[tempPathName] = absolutePath;
            }

            forChunk.push(tempPathName.replace(/['\\','\/']/g,'.'));

          }
        }

        var config = {
          filename: path.join('./views/',relativePath), //生成的html存放路径，相对于path
          template: file.path, //html模板路径
          inject: true,    //js插入的位置，true/'head'/'body'/false
          chunks: forChunk
          /*
          * 压缩这块，调用了html-minify，会导致压缩时候的很多html语法检查问题，
          * 如在html标签属性上使用{{...}}表达式，所以很多情况下并不需要在此配置压缩项，
          * 另外，UglifyJsPlugin会在压缩代码的时候连同html一起压缩。
          * 为避免压缩html，需要在html-loader上配置'html?-minimize'，见loaders中html-loader的配置。
           */
          // minify: { //压缩HTML文件
          //     removeComments: true, //移除HTML中的注释
          //     collapseWhitespace: false //删除空白符与换行符
          // }

        }

        conf.plugins.push(new HtmlWebpackPlugin(config));
    }
});

//
for(var entryKey in entry){
  entries[entryKey.replace(/['\\','\/']/g,'.')] = [entry[entryKey],hotMiddlewareScript];
}

chunks = Object.keys(entry);//所有脚本中提取公共模块


module.exports = conf;
