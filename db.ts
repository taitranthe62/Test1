import { Slide } from './types';

const DB_NAME = 'PresentationDB';
const DB_VERSION = 1;
const STORE_NAME = 'slides';
const KEY = 'currentPresentation';

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(new Error('Failed to open IndexedDB.'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveSlides(slides: Slide[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(slides, KEY);

        request.onsuccess = () => {
        resolve();
        };

        request.onerror = () => {
        console.error('Failed to save slides to IndexedDB:', request.error);
        // Check for QuotaExceededError specifically
        if (request.error?.name === 'QuotaExceededError') {
            reject(new Error("Storage quota exceeded. Could not save presentation."));
        } else {
            reject(new Error('Failed to save presentation.'));
        }
        };
    } catch (error) {
        console.error('Transaction error on save:', error);
        reject(error);
    }
  });
}

export async function loadSlides(): Promise<Slide[] | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error('Failed to load slides from IndexedDB:', request.error);
      reject(new Error('Failed to load presentation.'));
    };
  });
}
