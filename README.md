# Couch Async

Interact with CouchDB in javascript asynchronously.

## Quickstart

Install the package

```
npm i couch-async
```

Use it in your code

```js
import CouchDB from "couch-async";

const couch = CouchDB.fromUri(
    "https://admin:password@couchdb.mywebsite.com:5984"
);

// OR

const couch = new CouchDB("couchdb.mywebsite.com", 5984, "admin", "passw0rd");
```

## No documentation yet

Currently, there isn't any sort of online docs for this library, but it is documented using docstrings in javascript.

![Hover over the file in VSCode](couch-test.png)
