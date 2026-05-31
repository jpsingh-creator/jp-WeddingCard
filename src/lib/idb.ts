export function getIDB(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("WeddingCardDB", 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains("store")) {
        db.createObjectStore("store");
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains("store")) {
        resolve(null);
        return;
      }
      const tx = db.transaction("store", "readonly");
      const store = tx.objectStore("store");
      const getReq = store.get(key);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function setIDB(key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("WeddingCardDB", 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains("store")) {
        db.createObjectStore("store");
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      const tx = db.transaction("store", "readwrite");
      const store = tx.objectStore("store");
      const putReq = store.put(value, key);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function removeIDB(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("WeddingCardDB", 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains("store")) {
        db.createObjectStore("store");
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains("store")) {
        resolve();
        return;
      }
      const tx = db.transaction("store", "readwrite");
      const store = tx.objectStore("store");
      const delReq = store.delete(key);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}
