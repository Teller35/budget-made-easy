const APP_PREFIX = "BudgetTracker-";
const VERSION = "V-1";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = APP_PREFIX + "Data_Cache" + VERSION;

const FILES_TO_CACHE = [
  "/",
  "./index.html",
  "./js/index.js",
  "./js/idb.js",
  "./css/styles.css",
  "./manifest.json",
  "./icons/icon-192x192.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log("Installing cache : " + CACHE_NAME);
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.log("Error caching files" + err))
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keyList) {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .catch((err) => console.log(err))
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              console.log(err);
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
  } else {
    event.respondWith(
      fetch(event.request).catch((err) => {
        console.log(err);
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          } else if (
            event.request.headers.get("accept").includes("text/html")
          ) {
            return caches.match(event.request.url);
          }
        });
      })
    );
  }
});
