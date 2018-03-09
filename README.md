Danby
===================

Use grpc microservices from the browser. 

Usage
--------
```shell
$ npm install -g danby

$ danby
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --grpc     grpc-server:port                                         [required]
  --service  service name                                             [required]
  --pkg      package namespace                                        [required]
  --port     http port                                                [required]
  --proto    path to .proto file                                      [required]
  --cert     path to cert file
  --key      path to private key for ssl/tls
  --debug    debug output to console for ssl/tls
```

For example, to launch the webserver and serve up the files located in the website folder with the grpc Greeter sample:
First add this into the head tag of your html file:


```html
<script src="/api"></script>
```

Then from the console

```shell
$ cd website
$ danby --grpc localhost:50051 --proto helloworld.proto --service Greeter --pkg helloworld --port 3000
```

Browser
-------
```js
//For grpc interceptor call creds set the metedata eg. Greeter.metadata["token"] = ...
Greeter.SayHello({name: 'user'}).then(function(resp) { console.log(resp); });
```


