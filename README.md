Danby
===================

Lightweight approach to grpc microservices in the browser. No client side lib required.


Features
--------
* Bare minimum configuration required.
* Uses helmet.js to set HTTP headers to sane defaults.
* Proxy any number of grpc microservices on different hosts/ports, as long as they have unique service names.


Usage
--------
```shell
$ npm install danby

$ danby
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --port     http port                                                [required]
  --cfg      path to json config file
  --cert     path to ssl/tls cert file
  --key      path to ssl/tls private key 
  --webroot  path to webroot, defaults to $PWD 
  --debug    debug output to console 
```


Example
-------
Let's say you want to serve some static files with access to the grpc Greeter interface.
Add this into the head tag of your chosen html file:

```html
<script src="/grpc-api"></script>
```

Now modify config.json.sample to suit your local environment. Then from the console, cd into the folder you want to serve:

```shell
$ cd website
$ danby --port 3000 --cfg config.json
```

Now in the browser: 

```js
//Manage call creds by setting the metadata eg. Greeter.metadata["token"] = ...
Greeter.SayHello({name: 'user'}).then(function(resp) { console.log(resp); });
```

In your config file, try to use absolute paths for your .proto files otherwise the paths will be relative to the folder you started the webserver in, not the config file. Or start the webserver from your config folder, and use --webroot.


Todo
------
* Streaming support
* Proxy support (eg. map '/' to a react webpack hot reloading webserver)
