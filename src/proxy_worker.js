var fileSystem;

self.addEventListener('install', function (event) {
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
