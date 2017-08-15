var fileSystem;

self.addEventListener('install', function(event) {
  console.log("Install event: ", event);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(event) {
  console.log("Fetch event on url: ", event.request.url);

  var loc = event.request.url.indexOf("/dist/");
  if (loc != -1) {
    console.log(`found dist at: ${loc}`);
    var path = event.request.url.slice(loc);
    console.log(`path to check is: ${path}`);
    if (fileSystem && fileSystem[path]) {
      console.log(`found path: `, fileSystem[path]);
      event.respondWith(new Response(fileSystem[path].text));
      return;
    }
    else {
      console.log(`path not found`);
    }
  }
});

self.addEventListener('message', function(event) {
  console.log("Handling message event: ", event);

  if (event.data.fileSystem) {
    fileSystem = event.data.fileSystem;
  }

  event.ports[0].postMessage({
    error: null,
    foo: "bar"
  })
});
