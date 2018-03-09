Danby
===================

Use grpc microservices from the browser. 

Usage
--------
```shell
npm install -g danby
```

Add this into the head tag of your html file:


```html
<script src="/api"></script>
```

For example, to launch the webserver and serve up the files located in the website folder:

```shell
cd website
danby --grpc localhost:50051 --proto helloworld.proto --service Greeter --pkg helloworld --port 3000
```

Browser
-------
```js
//For grpc interceptor call creds set the metedata eg. Greeter.metadata["token"] = ...

Greeter.SayHello({name: 'user'}).then(function(resp) { console.log(resp); });
```


