var fileSystem;

self.addEventListener('install', function (event) {
  console.log('install event!');
});

self.addEventListener('activate', function (event) {
  console.log("Activate event: ", event);
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", function (event) {
  // console.log("Fetch event on url: ", event.request.url);

  // if its in /dist/, return straight from the file system
  var loc = event.request.url.indexOf("/dist/");
  if (loc != -1) {
    var path = event.request.url.slice(loc);
    if (path.indexOf("ngsummary") >= 0 &&  path.indexOf(".js") == -1) {
      path += ".json";
    }
    if (fileSystem && fileSystem[path]) {

      let init = {
        status: 200,
        statusText: "OK"
      }

      // if .html, set appropriate response type
      if (path.indexOf(".html") >= 0) {
        init['headers'] = {'Content-Type': "text/html"};
      }

      let response = new Response(fileSystem[path].text, init);
      event.respondWith(response);
      return;
    }
  }

  /*  if we're an ngfactory file, we have to route to the file system
      This is a hack to get around the current SystemJS config.
      The compiled template can reference an ngfactory file compiled from a
      dependency (e.g. @angular/material). With the current SystemJS config
      (see the default /index.html file written in virtual-fs.service.ts), SystemJS
      attempts to resolve these ngfactory files from unpkg, rather than from
      some rewritten location that allows the previous /dist/ rule to load it
      from the virtual file system.

      TODO: Modify the default SystemJS config  written in virtual-fs.service.ts
      to properly load ngfactory files from a /dist/ location, rather than from unpkg.
      Rob Wormald (robwormald@) is probably the person to ask for help on this
    */

  if (event.request.url.indexOf("ngfactory") >= 0 || event.request.url.indexOf("ngsummary") >= 0) {
    const path = event.request.url.split("/").slice(3);
    let i;
    for(i = 0; i < path.length; i++) { if (path[i].indexOf(".umd.js") >= 0) break; }
    const resolvedParts = path.slice(0,2).concat(path.slice(i + 1));

    for(i = 0; i < resolvedParts.length; i++) {if (path[i] === "@angular") break;}
    const moduleNameIndex = i + 1;
    resolvedParts[moduleNameIndex] = resolvedParts[moduleNameIndex].split("@")[0];

    let init = {
      status: 200,
      statusText: "OK"
    }

    let resolved = "/dist/node_modules/" + resolvedParts.join("/");

    if (event.request.url.indexOf("ngfactory") >= 0) {
      resolved += ".js";
    } else if (event.request.url.indexOf("ngsummary") >= 0) {
      resolved += ".json";
    }

    let response = new Response(fileSystem[resolved].text, init);
    event.respondWith(response);
    return;
  }

  // if we're an unpkg dependency, cache it
  // if (event.request.url.indexOf("https://unpkg.com") == 0 || event.request.url.indexOf("compiler_bundle.json") >= 0) {
  if (event.request.url.indexOf("https://unpkg.com") == 0) {
    event.respondWith(
      caches.match(event.request).then(function (resp) {
        // console.log(`got a match of: `, resp);
        return resp || fetch(event.request).then(function (response) {
          return caches.open('v1').then(function (cache) {
            // console.log(`cached ${event.request.url}`);
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

self.addEventListener('message', function (event) {
  if (event.data.fileSystem) {
    fileSystem = event.data.fileSystem;
    event.ports[0].postMessage({
      error: null,
      ack: true
    });
  }
});
