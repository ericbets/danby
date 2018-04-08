Danby
===================

Lightweight approach to grpc microservices in the browser. No client side lib required.

Usage
--------
```shell
$ npm install danby

$ danby
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --grpc     grpc-server:port                                         [required]
  --service  service name                                             [required]
  --pkg      package namespace                                        [required]
  --port     http port                                                [required]
  --proto    path to .proto file                                      [required]
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

Then from the console, cd into the folder you want to serve:

```shell
$ cd website
$ danby --grpc localhost:50051 --proto helloworld.proto --service Greeter --pkg helloworld --port 3000
```

Now in the browser: 

```js
//Manage call creds by setting the metadata eg. Greeter.metadata["token"] = ...
Greeter.SayHello({name: 'user'}).then(function(resp) { console.log(resp); });
```


Todo
------
* Streaming support
* Support multiple grpc services 

