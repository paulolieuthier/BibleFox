var bibleFox = {};
bibleFox.database = {};
bibleFox.database.db = null;
bibleFox.database.open = function() {
    var version = 2;
    var request = indexedDB.open("bibles", version);

    request.onupgradeneeded = function(e) {
        var db = e.target.result;
        e.target.transaction.onerror = bibleFox.database.onerror;

        if (db.objectStoreNames.contains("bibles")) {
            db.deleteObjectStore("bibles");
        }

        var store = db.createObjectStore("bibles", { keyPath: "abbreviation" });
    };

    request.onsuccess = function(e) {
        bibleFox.database.db = e.target.result;
        bibleFox.database.updateDatabase();
    };

    request.onerror = function(e) {
        bibleFox.database.onerror();
    }
};

bibleFox.database.updateDatabase = function() {
    var trans = bibleFox.database.db.transaction(["bibles"], "readwrite");
    var store = trans.objectStore("bibles");
    var request = store.put(bible_ra);

    request.onsuccess = function(e) {
        bibleFox.initApp();
    };

    request.onerror = function(e) {
        console.log(e.value);
    };
};
