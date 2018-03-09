Danby
===================

Lightweight approach to grpc microservices in the browser.

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
  --cert     path to ssl/tls cert file
  --key      path to ssl/tls private key 
  --debug    debug output to console 
```


Example
-------
Let's say you want to serve some static files in your website directory with access to the canonical grpc Greeter interface.
Add this into the head tag of your chosen html file:


```html
<script src="/api"></script>
```

Then from the console:

```shell
$ cd website
$ danby --grpc localhost:50051 --proto helloworld.proto --service Greeter --pkg helloworld --port 3000
```

Now in the browser: 

```js
//For grpc interceptor call creds set the metedata eg. Greeter.metadata["token"] = ...
Greeter.SayHello({name: 'user'}).then(function(resp) { console.log(resp); });
```


