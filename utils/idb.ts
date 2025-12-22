// Lightweight IndexedDB promisified helper with versioning and migrations
export type Migration = (db: IDBDatabase) => void;

export async function openDatabase(name: string, version: number, migrations: Migration[] = []) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      try {
        // run provided migrations for the new version
        migrations.forEach(m => m(db));
      } catch (e) {
        console.error('Migration error', e);
      }
    };
  });
}

export function promisifyRequest<T = any>(req: IDBRequest<T> | IDBTransaction) {
  return new Promise<T>((resolve, reject) => {
    if ((req as IDBTransaction).oncomplete !== undefined) {
      const tx = req as IDBTransaction;
      tx.oncomplete = () => resolve(undefined as unknown as T);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    } else {
      const r = req as IDBRequest<T>;
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    }
  });
}

export function getObjectStore<T = any>(db: IDBDatabase, storeName: string, mode: IDBTransactionMode = 'readonly') {
  const tx = db.transaction(storeName, mode);
  return { store: tx.objectStore(storeName), tx } as { store: IDBObjectStore; tx: IDBTransaction };
}
