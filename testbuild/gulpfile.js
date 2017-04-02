// 依赖项：指当前项目下包含所有HTML文件，及其文件里包含的相对路径的脚本及样式，
// 设定格式如：{'dirName/childDirName/a':{'js':['./a1.js','../a2.js'],'css':['./a1.css','../a2.css']}}
// 通过gulp来监听入口HTML的改变以及是否涉及到依赖项的改变

var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    node;
var utils = require("./utils.js");
var config = require("./config.js");
var path = require('path');

var htmlfiles = [];//存放用于监听的HTML文件路径

// 存放每个HTML文件目录，以及对应的包含相对路径的js、css
// "{"dirName/childDirName/a":{"js":["./a1.js","../a2.js"],"css":["./a1.css","../a2.css"]},"dirName/childDirName/b":{"js":["./a1.js","../a2.js"],"css":["./a1.css","../a2.css"]}}"
// 如果监听HTML中的相对路径有改变的话，此值需要修改
var dependenceFiles = {};

//定位到源文件目录当前目录下的所有的HTML会生成到目标文件
var rootPath = path.resolve(__dirname,'..','src/app') || config.build.rootPath;

/**
 * 运行gulp前，首先要获取整个项目下HTML文件，
 * 通过HTML文件找到其相对路径的脚本及样式，保存到对象中。
 */
utils.getFileFromPath(rootPath).forEach(function(file){

  var relativePath = path.relative(rootPath, file.path);//当前文件相对根目录的路径
  var dirName = path.dirname(relativePath);//文件路径
  var extname = path.extname(file.filename);//文件扩展名
  var baseName = path.basename(file.filename,extname);//文件名称，去除扩展名
  var pathName = path.join(dirName, baseName);//包含文件名称的相对文件路径

  //如果当前文件是HTML文件，
  //则需要读取文件中相对路径的脚本
  if('.html' == extname){

    htmlfiles.push(file.path);//用于监听HTML的变化
    dependenceFiles[pathName] = {};//每个HTML第一一个对象，用于存放js和css依赖
    var jsInHtml = dependenceFiles[pathName]['js'] = [];//定义js对象，存放script相对路径依赖
    var cssInHtml = dependenceFiles[pathName]['css'] = [];//定义css对象，存放样式相对路径依赖

    var resObj = utils.getRelatLabel(file.path);//如果没有获取到包含相对路径的script标签，值为{}
    var length = Object.keys(resObj).length;
    var forChunk = [];

    if(length > 0){

      for(key in resObj){

        var absolutePath = path.resolve(path.dirname(file.path), resObj[key]);//将HTML文件中相对路径的script标签换为绝对路径
        jsInHtml.push(absolutePath);

      }
    }
  }
});


/**
 * 启动服务，如果已经存在服务，关闭后重启
 */
gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['dev.server.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

/**
 * 启动开发环境，当监听文件改变时触发启动事件
 */
gulp.task('default', function() {
  gulp.run('server')

  gulp.watch(htmlfiles, function(a,b,c) {

    var changedHtml = a.path;
    var changedScript = utils.getRelatLabel(changedHtml);

    var relativePath = path.relative(rootPath, changedHtml);//当前文件相对根目录的路径
    var dirName = path.dirname(relativePath);//文件路径
    var extname = path.extname(changedHtml);//文件扩展名
    var baseName = path.basename(changedHtml,extname);//文件名称，去除扩展名
    var pathName = path.join(dirName, baseName);//包含文件名称的相对文件路径

    var length = Object.keys(changedScript).length;
    var jsArr = [];

    if(length > 0){

      for(key in changedScript){

        var absolutePath = path.resolve(path.dirname(changedHtml), changedScript[key]);//将HTML文件中相对路径的script标签换为绝对路径
        jsArr.push(absolutePath);

      }
    }

    var dependJsArr = dependenceFiles[pathName]['js'];//依赖项中当前HTML中的js

    //当保存的依赖项中当前HTML的相对路径和刚获取取的相对路径不一致时
    //重启当前服务，并把当前的相对路径保存到依赖项中
    if(!utils.isArrayEqual(dependJsArr,jsArr)){
      dependenceFiles[pathName]['js'] = jsArr;
      gulp.run('server');
    }

    //gulp.run('server');
  })

})

// 当出现错误退出时，关闭服务
process.on('exit', function() {
    if (node) node.kill()
})

