const APP_PREFIX = "BudgetTracker-";
const VERSION = "V-1";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE = APP_PREFIX + "data-V1";

const FILES_TO_CACHE = [
  "./index.html",
  "./js/index.js",
  "./css/styles.css",
  "./js/idb.js",
  "./icons/icon-192x192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Installing Cache: " + CACHE_NAME);
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.log("Error caching files: ", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE) {
              console.log("Deleting cache: " + key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .catch((err) => console.log(err))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api")) {
    event.respondWith(
      caches
        .open(DATA_CACHE)
        .then((cache) => {
        //   console.log(cache);
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              console.log(err);
              return cache.match(event.target);
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
