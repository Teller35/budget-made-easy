if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
    .then(() => console.log("Service worker registered success!"))
    .catch(error => console.log("Service worker failed to register!", error))
  }