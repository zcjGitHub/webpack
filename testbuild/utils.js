var fs = require("fs");
var path = require("path");

var utils = {
  'getFileFromPath' : getFileFromPath,
  'getEntry'        : getEntry,
  'getRelatLabel'   : getRelatLabel,
  'isArrayEqual'    : isArrayEqual
}
module.exports = utils;

//遍历文件夹，当前文件夹下的所有文件名以及路径
function getFileFromPath(rootPath){
  var result = []
  function loop(_path){
    var names = fs.readdirSync(_path);
    names.forEach(function(name){
      var filepath = path.join(_path, name)
      if(fs.statSync(filepath).isDirectory()){
        loop(filepath)
      }else{
          result.push({
              filename: name,
              path: filepath
          })
      }
    })
  }
  loop(rootPath)
  return result
}

//通过文件路径（非文件夹）来判断当前文件是否是HTML文件，
//如果是HTML文件，则读取文件内容，通过读取script标签，
//判断如果标签的src指向路径为相对路径，则判断为当前页面的入口脚本
//srcDir:文件路径（非文件夹路径）
//files :文件名
function getEntry(srcDir) {
    var htmlPath = path.resolve(srcDir);
    var dirs = fs.readdirSync(htmlPath);
    var matchs = [], files = {};

    dirs.forEach(function (item) {

        matchs = item.match(/(.+)\.html$/);

        if (matchs) {

          var thisHtmlPath = path.resolve(srcDir, item);
          var text = fs.readFileSync(thisHtmlPath, 'utf8');
          var reg = /<script.*?src="(\.+.*?\.js)"><\/script>/g;//匹配包含相对路径的script,排除绝对路径
          var srcReg = /src=([",'])(.+)\1/; //匹配script标签中src的值，如"<script src='../../index2321.js'></script>"匹配结果是'../../index2321.js'
          var resArr = text.match(reg);
          var resArrLen = resArr.length;

          for (var i = 0; i < resArrLen; i++) {
            var srcVal = resArr[i].match(srcReg)[2];
            var fileNameStr = getFileName(srcVal);
            files[fileNameStr] = srcVal;
          };
        }
    });

    return files;
}

/*
 * 通过路径获取HTML文件中包含相对路径标签，
 */
function getRelatLabel(htmlPath){

  var matchs = [], files = {};
  var text = fs.readFileSync(htmlPath, 'utf8');
  var reg = /<script.*?src="(\.+.*?\.js)"><\/script>/g;//匹配包含相对路径的script,排除绝对路径
  var srcReg = /src=([",'])(.+)\1/; //匹配script标签中src的值，如"<script src='../../index2321.js'></script>"匹配结果是'../../index2321.js'
  var resArr = text.match(reg);

  if(resArr){
    var resArrLen = resArr.length;
    for (var i = 0; i < resArrLen; i++) {
      var srcVal = resArr[i].match(srcReg)[2];
      var fileNameStr = getFileName(srcVal);
      files[fileNameStr] = srcVal;
    };
  }

  return files;
}

/*
 * 通过相对路径获取文件名称，
 * 比如'../file.v.js'、'file.v.js'、'../..file.v.js',
 * 获取结果file.v
 */
function getFileName(relaPath){
  var reg = /(.+)\.js/;
  var resArr = relaPath.match(reg);
  var res = resArr[1].split('/');
  var len = res.length;
  return res[len-1];
}
/*
 * 判断两个数组中的值是否相等
 * 通过将数组排序后，转换为字符串，对比字符串
 */
function isArrayEqual(arr1,arr2){
  return arr1.sort().toString() === arr2.sort().toString()
}
