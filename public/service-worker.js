const APP_PREFIX = "BudgetTracker-";
const VERSION = "V-1";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = ["./index.html", "./js/index.js", "./css/styles.css"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Installing cache: " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeep = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeep.push(CACHE_NAME);
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeep.indexOf(key) === -1) {
            console.log("Deleting cache: " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

