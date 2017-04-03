<div align="center">
  <h1>Introduce</h1>
  <p>we realize packaging the program with webpack and gulp.what you need to do is that setting a root directory in config.js ,and then it will find the html files.All the script file which has a relative path will be added into webpack entries.<p>
</div>

<h2 align="center">How to begin</h2>

```bash
cd testbuild && npm install
```

> If you have install the node_modules successfully,then you can run gulp to start the server.

<h2 align="center">main function</h2>

### 1. watch the html with gulp
	If we remove the script which has a relative path ,the base config of webpack will change. So we will reload server with gulp.

### 2. reload when the static resources change
	When the static resources change, browser will reload the resources.It is very convenient for us to code.

### 3. bundle mutiple entries
	It will add all the js file into entries only if the file has a relative paht.