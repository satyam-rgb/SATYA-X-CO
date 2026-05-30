/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { Product, Order } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase statically as per guidelines
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: Firestore initialization with database ID
export const auth = getAuth(app);
export const storage = getStorage(app);
export const isFirebaseReady = true;

// Validate the connection to the database
const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
};
testConnection();

// Error handling enum and interface as per Firebase Skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Operational Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// LOCAL STORAGE & MEMORY FALLBACK DATA FOR SATYA X CO (LUXURY)
// -------------------------------------------------------------

const DEFAULT_PRODUCTS: Product[] = [];

// Initialize local storage databases if not existing
if (!localStorage.getItem('satya_products')) {
  localStorage.setItem('satya_products', JSON.stringify(DEFAULT_PRODUCTS));
}
if (!localStorage.getItem('satya_orders')) {
  localStorage.setItem('satya_orders', JSON.stringify([]));
}

// -------------------------------------------------------------
// UNIVERSAL API BRIDGE (FIREBASE / LOCALSTORAGE FALLBACK)
// -------------------------------------------------------------

export const getProducts = async (): Promise<Product[]> => {
  const path = 'products';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        price: Number(data.price) || 0,
        category: data.category || '',
        images: Array.isArray(data.images) ? data.images : [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    // Fallback if db has no products to make demo stunning
    if (list.length === 0) {
      try {
        for (const prod of DEFAULT_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), {
            name: prod.name,
            description: prod.description,
            price: prod.price,
            category: prod.category,
            images: prod.images,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        // Query again to get the fresh documents with server timestamps/metadata
        const reSnapshot = await getDocs(q);
        const reList: Product[] = [];
        reSnapshot.forEach((doc) => {
          const data = doc.data();
          reList.push({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: Number(data.price) || 0,
            category: data.category || '',
            images: Array.isArray(data.images) ? data.images : [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        if (reList.length > 0) {
          return reList;
        }
      } catch (seedErr) {
        console.warn("Auto-seeding default products failed, using clean fallbacks:", seedErr);
      }
      return DEFAULT_PRODUCTS;
    }
    return list;
  } catch (err) {
    console.warn("Firestore count list error, falling back to local database:", err);
    const local = localStorage.getItem('satya_products');
    return local ? JSON.parse(local) : DEFAULT_PRODUCTS;
  }
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  const path = 'products';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await setDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    return;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
  const path = 'orders';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  const path = 'orders';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: Order[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone || '',
        customerAddress: data.customerAddress || '',
        items: Array.isArray(data.items) ? data.items : [],
        totalAmount: Number(data.totalAmount) || 0,
        status: data.status || 'pending',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    return list;
  } catch (err) {
    console.warn("Could not query orders from Firebase, reading local storage:", err);
    const local = localStorage.getItem('satya_orders');
    return local ? JSON.parse(local) : [];
  }
};

// -------------------------------------------------------------
// SECURE IMAGE UPLOAD (FIREBASE STORAGE / BASE64 RESILIENT)
// -------------------------------------------------------------

export const uploadProductImage = async (file: File): Promise<string> => {
  const API_KEY = "143ce2b550f1b48fe3f14f91ffdbf9c5";

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  console.log("IMGBB RESPONSE:", data);

  if (!data.success) {
    throw new Error(data.error?.message || "ImgBB upload failed");
  }

  return data.data.url;
};