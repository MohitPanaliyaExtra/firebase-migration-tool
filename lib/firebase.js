/**
 * Firebase Configuration Module
 * Centralized Firebase initialization and configuration
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  CACHE_SIZE_UNLIMITED,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot
} from 'firebase/firestore';

// Firebase app instances cache
const appInstances = new Map();

/**
 * Initialize or get existing Firebase app
 * @param {Object} config - Firebase configuration object
 * @param {string} appName - Unique name for the app instance
 * @returns {Object} Firebase app instance
 */
export const getFirebaseApp = (config, appName = 'default') => {
  if (appInstances.has(appName)) {
    return appInstances.get(appName);
  }

  const existingApps = getApps();
  const existingApp = existingApps.find(app => app.name === appName);
  
  if (existingApp) {
    appInstances.set(appName, existingApp);
    return existingApp;
  }

  const newApp = initializeApp(config, appName);
  appInstances.set(appName, newApp);
  return newApp;
};

/**
 * Get Firestore instance with optional database ID
 * @param {Object} app - Firebase app instance
 * @param {string} [databaseId] - Optional database ID for named databases
 * @returns {Object} Firestore instance
 */
export const getFirestoreDb = (app, databaseId = null) => {
  if (databaseId) {
    return getFirestore(app, databaseId);
  }
  return getFirestore(app);
};

/**
 * Discover collections in a Firestore database
 * @param {Object} db - Firestore instance
 * @returns {Promise<Array<string>>} Array of collection names
 */
export const discoverCollections = async (db) => {
  const collections = [];
  // Note: Firestore doesn't have a direct API to list all collections
  // This is a placeholder - actual discovery happens through document references
  return collections;
};

/**
 * Get all documents in a collection
 * @param {Object} db - Firestore instance
 * @param {string} collectionPath - Path to the collection
 * @returns {Promise<Array<Object>>} Array of document data
 */
export const getCollectionDocuments = async (db, collectionPath) => {
  const snapshot = await getDocs(collection(db, collectionPath));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    data: doc.data()
  }));
};

/**
 * Get all subcollections of a document
 * @param {Object} db - Firestore instance
 * @param {string} documentPath - Path to the document
 * @returns {Promise<Array<string>>} Array of subcollection names
 */
export const getDocumentSubcollections = async (db, documentPath) => {
  // This requires listing collections under a document
  // Firebase doesn't have a direct API for this
  return [];
};

/**
 * Create or update a document
 * @param {Object} db - Firestore instance
 * @param {string} collectionPath - Path to the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @returns {Promise<void>}
 */
export const setDocument = async (db, collectionPath, docId, data) => {
  await setDoc(doc(db, collectionPath, docId), {
    ...data,
    migratedAt: serverTimestamp()
  }, { merge: true });
};

/**
 * Delete a document
 * @param {Object} db - Firestore instance
 * @param {string} collectionPath - Path to the collection
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (db, collectionPath, docId) => {
  await deleteDoc(doc(db, collectionPath, docId));
};

// Export Firebase services
export { 
  initializeApp, 
  getApps, 
  getApp,
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot
};

// Default configurations for Source and Target (empty - users must provide their own)
export const defaultSourceConfig = {};
export const defaultTargetConfig = {};
