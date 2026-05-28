/**
 * Custom Firebase Hooks
 * Reusable hooks for Firebase operations
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  getFirebaseApp, 
  getFirestoreDb,
  getCollectionDocuments,
  setDocument,
  deleteDocument
} from '@/lib/firebase';

/**
 * Hook for connecting to Firebase
 * @returns {Object} Connection state and methods
 */
export const useFirebaseConnection = () => {
  const [db, setDb] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async (config, databaseId = null, appName = 'default') => {
    if (!config) {
      setError('Configuration is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      let configObj;
      
      // Parse config if it's a string
      if (typeof config === 'string') {
        try {
          configObj = new Function('return ' + config)();
        } catch (parseError) {
          throw new Error('Invalid JSON format in Firebase config');
        }
      } else {
        configObj = config;
      }

      if (!configObj.apiKey || !configObj.projectId) {
        throw new Error('Invalid Firebase config: apiKey and projectId are required');
      }

      const app = getFirebaseApp(configObj, appName);
      const firestoreDb = getFirestoreDb(app, databaseId || null);
      
      setDb(firestoreDb);
      setConnected(true);
      
      return firestoreDb;
    } catch (err) {
      setError(err.message);
      setConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setDb(null);
    setConnected(false);
    setError(null);
  }, []);

  return {
    db,
    connected,
    loading,
    error,
    connect,
    disconnect
  };
};

/**
 * Hook for managing collections
 * @param {Object} db - Firestore instance
 * @returns {Object} Collection management methods
 */
export const useCollections = (db) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const discoverCollections = useCallback(async (collectionNames) => {
    if (!db || !collectionNames || collectionNames.length === 0) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const collectionsData = [];
      
      for (const collName of collectionNames) {
        const documents = await getCollectionDocuments(db, collName);
        
        collectionsData.push({
          name: collName,
          path: collName,
          documentCount: documents.length,
          documents: documents.slice(0, 10), // Sample documents for preview
          subcollections: []
        });
      }

      setCollections(collectionsData);
      return collectionsData;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [db]);

  const discoverAllNested = useCallback(async (collectionNames) => {
    if (!db || !collectionNames || collectionNames.length === 0) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const allCollections = [];
      
      const discoverRecursively = async (path, level = 0) => {
        if (level > 3) return; // Max depth to prevent infinite recursion

        try {
          const documents = await getCollectionDocuments(db, path);
          
          if (documents.length > 0) {
            allCollections.push({
              name: path.split('/').pop(),
              path: path,
              documentCount: documents.length,
              documents: documents,
              level: level
            });
          }
        } catch (e) {
          // Collection might not exist or be empty
        }
      };

      for (const collName of collectionNames) {
        await discoverRecursively(collName, 0);
      }

      setCollections(allCollections);
      return allCollections;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [db]);

  return {
    collections,
    loading,
    error,
    discoverCollections,
    discoverAllNested
  };
};

/**
 * Hook for data migration
 * @param {Object} sourceDb - Source Firestore instance
 * @param {Object} targetDb - Target Firestore instance
 * @returns {Object} Migration methods and state
 */
export const useMigration = (sourceDb, targetDb) => {
  const [migrationStatus, setMigrationStatus] = useState({
    migrating: false,
    progress: 0,
    total: 0,
    current: 0,
    errors: [],
    completed: false
  });

  const migrateCollection = useCallback(async (collectionPath, options = {}) => {
    if (!sourceDb || !targetDb) {
      return { success: false, error: 'Both source and target databases must be connected' };
    }

    const {
      onProgress,
      onDocumentMigrated,
      onError,
      deleteSource = false,
      transformData = null
    } = options;

    setMigrationStatus(prev => ({
      ...prev,
      migrating: true,
      errors: []
    }));

    try {
      const documents = await getCollectionDocuments(sourceDb, collectionPath);
      const total = documents.length;
      
      setMigrationStatus(prev => ({
        ...prev,
        total,
        current: 0
      }));

      let errors = [];
      let migrated = 0;

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        try {
          let data = { ...doc.data };
          
          // Apply transformation if provided
          if (transformData) {
            data = transformData(data, doc.id);
          }
          
          await setDocument(targetDb, collectionPath, doc.id, data);
          
          // Delete source document if requested
          if (deleteSource) {
            await deleteDocument(sourceDb, collectionPath, doc.id);
          }
          
          migrated++;
          
          setMigrationStatus(prev => ({
            ...prev,
            current: migrated,
            progress: Math.round((migrated / total) * 100)
          }));

          if (onDocumentMigrated) {
            onDocumentMigrated(doc.id, migrated, total);
          }
        } catch (docError) {
          errors.push({
            documentId: doc.id,
            error: docError.message
          });
          
          if (onError) {
            onError(doc.id, docError);
          }
        }
      }

      const success = migrated > 0;
      
      setMigrationStatus(prev => ({
        ...prev,
        migrating: false,
        completed: success,
        errors
      }));

      return {
        success,
        migrated: migrated,
        failed: errors.length,
        errors
      };
    } catch (err) {
      setMigrationStatus(prev => ({
        ...prev,
        migrating: false,
        errors: [{ error: err.message }]
      }));

      return {
        success: false,
        error: err.message
      };
    }
  }, [sourceDb, targetDb]);

  const migrateMultipleCollections = useCallback(async (collections, options = {}) => {
    if (!sourceDb || !targetDb) {
      return { success: false, error: 'Both source and target databases must be connected' };
    }

    const {
      onProgress,
      onCollectionComplete,
      onError,
      deleteSource = false,
      transformData = null
    } = options;

    setMigrationStatus(prev => ({
      ...prev,
      migrating: true,
      progress: 0,
      current: 0,
      total: collections.length,
      errors: [],
      completed: false
    }));

    const results = [];
    let totalMigrated = 0;
    let totalErrors = [];

    for (let i = 0; i < collections.length; i++) {
      const collPath = collections[i];
      
      const result = await migrateCollection(collPath, {
        deleteSource,
        transformData,
        onDocumentMigrated: (docId, current, collectionTotal) => {
          if (onProgress) {
            onProgress(collPath, docId, current, collectionTotal, i + 1, collections.length);
          }
        },
        onError: (docId, error) => {
          if (onError) {
            onError(collPath, docId, error);
          }
        }
      });

      results.push({
        collection: collPath,
        ...result
      });

      totalMigrated += result.migrated || 0;
      totalErrors = [...totalErrors, ...(result.errors || [])];

      setMigrationStatus(prev => ({
        ...prev,
        current: i + 1,
        progress: Math.round(((i + 1) / collections.length) * 100)
      }));

      if (onCollectionComplete) {
        onCollectionComplete(collPath, result, i + 1, collections.length);
      }
    }

    setMigrationStatus(prev => ({
      ...prev,
      migrating: false,
      completed: true,
      errors: totalErrors
    }));

    return {
      success: totalErrors.length === 0,
      totalMigrated,
      totalErrors: totalErrors.length,
      results
    };
  }, [sourceDb, targetDb, migrateCollection]);

  const resetMigration = useCallback(() => {
    setMigrationStatus({
      migrating: false,
      progress: 0,
      total: 0,
      current: 0,
      errors: [],
      completed: false
    });
  }, []);

  return {
    migrationStatus,
    migrateCollection,
    migrateMultipleCollections,
    resetMigration
  };
};

/**
 * Hook for scroll animations
 * @returns {Array} ref and isVisible state
 */
export const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node) => {
    if (node !== null) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(node);
      
      return () => observer.disconnect();
    }
  }, []);

  return [ref, isVisible];
};

import { useCallback, useRef } from 'react';
