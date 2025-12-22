
import { Page, Block } from '../types';
import { openDatabase, getObjectStore, promisifyRequest } from './idb';

const DB_NAME = 'gid_db_v1';
const DB_VERSION = 1;

const migrations = [
  (db: IDBDatabase) => {
    if (!db.objectStoreNames.contains('pages')) {
      const pages = db.createObjectStore('pages', { keyPath: 'id' });
      pages.createIndex('updatedAt', 'updatedAt');
    }
    if (!db.objectStoreNames.contains('blocks')) {
      const blocks = db.createObjectStore('blocks', { keyPath: 'id' });
      blocks.createIndex('pageId', 'pageId');
    }
    if (!db.objectStoreNames.contains('meta')) {
      db.createObjectStore('meta', { keyPath: 'key' });
    }
  }
];

let cachedDB: IDBDatabase | null = null;

async function getDB() {
  if (cachedDB) return cachedDB;
  cachedDB = await openDatabase(DB_NAME, DB_VERSION, migrations);
  return cachedDB;
}

export const savePages = async (pages: Page[]) => {
  const db = await getDB();
  const { store, tx } = getObjectStore(db, 'pages', 'readwrite');
  const blockStore = db.transaction('blocks', 'readwrite').objectStore('blocks');

  // clear and repopulate (simple migration-friendly approach)
  const clearPagesReq = store.clear();
  const clearBlocksReq = blockStore.clear();
  await Promise.all([promisifyRequest(clearPagesReq), promisifyRequest(clearBlocksReq)]);

  for (const page of pages) {
    store.add({ id: page.id, title: page.title, updatedAt: page.updatedAt });
    for (let i = 0; i < page.blocks.length; i++) {
      const block = page.blocks[i];
      blockStore.add({
        id: block.id,
        pageId: page.id,
        type: block.type,
        content: block.content,
        checked: !!block.checked,
        schedule: block.schedule || null,
        lastEditedAt: block.lastEditedAt || Date.now(),
        metadata: block.metadata || {},
        sortOrder: i
      });
    }
  }

  // wait for tx complete
  await promisifyRequest(tx);
};

export const loadPages = async (): Promise<Page[]> => {
  const db = await getDB();
  const pages: Page[] = [];
  const { store, tx } = getObjectStore(db, 'pages', 'readonly');

  const getAllReq = store.getAll();
  const pageList = await promisifyRequest(getAllReq) as any[];

  // load blocks per page via index
  for (const p of pageList.sort((a, b) => b.updatedAt - a.updatedAt)) {
    const blocksStore = db.transaction('blocks', 'readonly').objectStore('blocks');
    const idx = blocksStore.index('pageId');
    const range = IDBKeyRange.only(p.id);
    const req = idx.getAll(range);
    const blockRows = await promisifyRequest(req) as any[];
    const blocks: Block[] = blockRows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(b => ({
      id: b.id,
      type: b.type,
      content: b.content,
      checked: !!b.checked,
      schedule: b.schedule,
      lastEditedAt: b.lastEditedAt,
      metadata: b.metadata || {}
    }));

    pages.push({ id: p.id, title: p.title, updatedAt: p.updatedAt, blocks });
  }

  await promisifyRequest(tx);
  return pages;
};

// CRUD helpers
export const createPage = async (page: Page) => {
  const db = await getDB();
  const { store, tx } = getObjectStore(db, 'pages', 'readwrite');
  store.add(page);
  await promisifyRequest(tx);
};

export const updatePage = async (page: Page) => {
  const db = await getDB();
  const { store, tx } = getObjectStore(db, 'pages', 'readwrite');
  store.put({ id: page.id, title: page.title, updatedAt: page.updatedAt });

  // update blocks: simple approach remove existing for page and add new
  const btx = db.transaction('blocks', 'readwrite');
  const bstore = btx.objectStore('blocks');
  const idx = bstore.index('pageId');
  const existingReq = idx.getAllKeys(IDBKeyRange.only(page.id));
  const keys = await promisifyRequest(existingReq) as any[];
  for (const k of keys) bstore.delete(k);
  for (let i = 0; i < page.blocks.length; i++) {
    const block = page.blocks[i];
    bstore.add({
      id: block.id,
      pageId: page.id,
      type: block.type,
      content: block.content,
      checked: !!block.checked,
      schedule: block.schedule || null,
      lastEditedAt: block.lastEditedAt || Date.now(),
      metadata: block.metadata || {},
      sortOrder: i
    });
  }

  await Promise.all([promisifyRequest(tx), promisifyRequest(btx)]);
};

export const deletePage = async (pageId: string) => {
  const db = await getDB();
  const ptx = db.transaction('pages', 'readwrite');
  ptx.objectStore('pages').delete(pageId);
  const btx = db.transaction('blocks', 'readwrite');
  const idx = btx.objectStore('blocks').index('pageId');
  const keys = await promisifyRequest(idx.getAllKeys(IDBKeyRange.only(pageId))) as any[];
  for (const k of keys) btx.objectStore('blocks').delete(k);
  await Promise.all([promisifyRequest(ptx), promisifyRequest(btx)]);
};

export const getDBBlob = async () => {
  // export entire DB as JSON for backup
  const db = await getDB();
  const pages = await loadPages();
  return new Blob([JSON.stringify({ pages, exportedAt: Date.now() })], { type: 'application/json' });
};

