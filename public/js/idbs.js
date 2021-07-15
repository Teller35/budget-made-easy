// global variable to hold connection
let db;

// establish connection to IndexedDB
const request = indexedDB.open("budget_tracker", 1);

// if database version changes
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_budget", { autoIncrement: true });
};

// upon success
request.onsuccess = function (event) {
  db = event.target.result;
  // check if back on line
  if (navigator.onLine) {
    uploadBudget();
  }
};

// if error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// function to handle promise if now internet connection
function saveBudget(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_budget");
  budgetObjectStore.add(record);
}

// function to add to database when service is restored
function uploadBudget() {
  const transaction = db.transaction(["new_budget"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_budget");
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
        fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(transaction),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new_budget"], "readwrite");
          const budgetObjectStore = transaction.objectStore("new_budget");
          budgetObjectStore.clear();
          alert("Budget has been updated!");
        })
        .catch((err) => console.log(err));
    }
  };
}

window.addEventListener("online", uploadBudget);
