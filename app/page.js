'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Import our modular components (keeping inline components for now)
// The modular structure exists in /components, /hooks, /lib for future use

// Scroll Animation Hook
const useScrollAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// Collection Tree Item Component
const CollectionTreeItem = ({ 
  collection, 
  selectedCollections, 
  onToggleSelect,
  level = 0,
  isTarget = false,
  onAddSubcollection,
  addingTo,
  setAddingTo,
  subcollectionInput,
  setSubcollectionInput,
  onAddSubcollectionConfirm,
  discoverAllNested,
  onRemove
}) => {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = collection.subcollections && collection.subcollections.length > 0;
  const isSelected = selectedCollections.includes(collection.path);
  const isAddingTo = addingTo === collection.path;

  return (
    <li className="collection-item" style={{ animation: 'slideIn 0.3s ease forwards', animationDelay: `${level * 50}ms` }}>
      <div 
        className={`collection-header ${isSelected ? 'selected' : ''} ${isTarget ? 'target-item' : ''}`}
        style={{ paddingLeft: `${level * 24 + 14}px` }}
        title={collection.path}
      >
        {/* Connector line for tree structure */}
        {level > 0 && (
          <div className="tree-connector" style={{ 
            position: 'absolute', 
            left: `${(level - 1) * 24 + 14}px`,
            width: '20px',
            height: '100%',
            borderLeft: '2px solid rgba(255,255,255,0.1)',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            borderBottomLeftRadius: '6px'
          }} />
        )}
        
        <input
          type="checkbox"
          className="collection-checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(collection.path)}
          style={{ transition: 'all 0.2s ease' }}
        />
        
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <span 
            className="collection-expand"
            onClick={(e) => { 
              e.stopPropagation(); 
              setExpanded(!expanded); 
            }}
            style={{ 
              transition: 'transform 0.2s ease',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'
            }}
          >
            ▶
          </span>
        ) : (
          <span className="collection-icon" style={{ opacity: 0.5 }}>●</span>
        )}
        
        {/* Collection Name */}
        <span className="collection-name">
          <span className="collection-folder-name">{collection.name}</span>
        </span>
        
        {/* Document Count Badge */}
        <span className="collection-count" title={`${collection.documentCount || 0} documents`}>
          {collection.documentCount || 0}
        </span>
        
        {/* Add Subcollection Button */}
        {!isTarget && (
          <button
            className="subcollection-btn"
            onClick={(e) => {
              e.stopPropagation();
              setAddingTo(isAddingTo ? null : collection.path);
            }}
            style={{
              transition: 'all 0.2s ease',
              transform: isAddingTo ? 'rotate(45deg)' : 'scale(1)',
              background: isAddingTo ? 'rgba(248, 113, 113, 0.3)' : 'rgba(129, 140, 248, 0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              marginLeft: '8px'
            }}
            title="Add subcollection"
          >
            {isAddingTo ? '✕' : '+'}
          </button>
        )}

        {/* Remove Button */}
        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove(collection.path);
          }}
          style={{
            transition: 'all 0.2s ease',
            background: 'rgba(248, 113, 113, 0.2)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fca5a5',
            fontSize: '12px',
            fontWeight: 'bold',
            marginLeft: '6px'
          }}
          title="Remove collection"
        >
          ✕
        </button>

        {/* Subcollection Input */}
        {isAddingTo && (
          <div className="subcollection-input-container" style={{ 
            display: 'flex', 
            gap: '6px', 
            marginLeft: '8px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <input
              type="text"
              value={subcollectionInput}
              onChange={(e) => setSubcollectionInput(e.target.value)}
              placeholder="documentId/subcollection OR just name"
              className="subcollection-input"
              onKeyPress={(e) => e.key === 'Enter' && onAddSubcollectionConfirm(collection.path)}
              autoFocus
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                color: '#fff',
                width: '120px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSubcollectionConfirm(collection.path);
              }}
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Add
            </button>
          </div>
        )}
        
        {/* Path Badge */}
        {level > 0 && (
          <span className="collection-path-badge" title={collection.path}>
            {collection.path}
          </span>
        )}
      </div>
      
      {/* Subcollections */}
      {hasChildren && expanded && (
        <ul className="collection-children collection-tree">
          {collection.subcollections.map(sub => (
            <CollectionTreeItem
              key={sub.path}
              collection={sub}
              selectedCollections={selectedCollections}
              onToggleSelect={onToggleSelect}
              level={level + 1}
              isTarget={isTarget}
              onAddSubcollection={onAddSubcollection}
              addingTo={addingTo}
              setAddingTo={setAddingTo}
              subcollectionInput={subcollectionInput}
              setSubcollectionInput={setSubcollectionInput}
              onAddSubcollectionConfirm={onAddSubcollectionConfirm}
              discoverAllNested={discoverAllNested}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Firebase Config Input Component
const FirebaseConfigInput = ({ 
  config, 
  setConfig, 
  onConnect, 
  loading, 
  label, 
  connectionStatus,
  databaseId,
  setDatabaseId
}) => {
  return (
    <div className="form-group">
      <label className="form-label">{label} Firebase Config (JSON)</label>
      <textarea
        className="form-textarea"
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        placeholder='Paste your Firebase config JSON here...'
        style={{ transition: 'all 0.3s ease' }}
      />
      <div className="form-help">
        <span>💡</span>
        <span>Get from: Firebase Console &gt; Project Settings &gt; Your Apps &gt; Web App</span>
      </div>
      <label className="form-label">Database ID (Optional - leave empty for default)</label>
      <input
        type="text"
        className="form-input"
        value={databaseId || ''}
        onChange={(e) => setDatabaseId(e.target.value)}
        placeholder="e.g., fahis-db (leave empty for default database)"
      />
      <div className="btn-group">
        <button
          className="btn btn-primary"
          onClick={onConnect}
          disabled={loading || !config.trim()}
          style={{ transition: 'all 0.3s ease' }}
        >
          {loading ? 'Connecting...' : `Connect to ${label}`}
        </button>
        <div className="connection-status" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          transition: 'all 0.3s ease'
        }}>
          <span 
            className={`status-dot ${connectionStatus ? 'connected' : 'disconnected'}`}
            style={{
              transition: 'all 0.3s ease',
              boxShadow: connectionStatus ? '0 0 15px #34d399' : 'none'
            }}
          />
          <span style={{ transition: 'all 0.3s ease' }}>
            {connectionStatus ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ value, label, delay }) => {
  return (
    <div className="stat-card" style={{ 
      animationDelay: `${delay}ms`,
      transition: 'all 0.3s ease'
    }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// Log Entry Component
const LogEntry = ({ log, index }) => {
  return (
    <div 
      className={`log-entry ${log.type}`}
      style={{ 
        animation: 'slideIn 0.3s ease forwards', 
        animationDelay: `${index * 50}ms`,
        opacity: 0 
      }}
    >
      <span className="log-time">[{log.time}]</span>
      <span className="log-message">{log.message}</span>
    </div>
  );
};

// Main App Component
export default function Home() {
  // Default Firebase configs - users should enter their own credentials
  const defaultSourceConfig = {};
  
  const defaultTargetConfig = {};

  const [sourceConfig, setSourceConfig] = useState('');
  const [sourceDb, setSourceDb] = useState(null);
  const [sourceConnected, setSourceConnected] = useState(false);
  const [sourceDatabaseId, setSourceDatabaseId] = useState('');
  const [sourceCollections, setSourceCollections] = useState([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [collectionInput, setCollectionInput] = useState('');
  
  // For adding subcollections
  const [addingSubcollectionTo, setAddingSubcollectionTo] = useState(null);
  const [subcollectionInput, setSubcollectionInput] = useState('');

  const [targetConfig, setTargetConfig] = useState('');
  const [targetDb, setTargetDb] = useState(null);
  const [targetConnected, setTargetConnected] = useState(false);
  const [targetDatabaseId, setTargetDatabaseId] = useState('');
  const [targetLoading, setTargetLoading] = useState(false);

  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationLogs, setMigrationLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [migrationStats, setMigrationStats] = useState({ 
    collections: 0, 
    documents: 0, 
    errors: 0 
  });

  const addLog = useCallback((message, type = 'info') => {
    setMigrationLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  }, []);

  // Toast notification system
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const connectFirebase = async (configJson, setDb, setConnected, setLoading, dbName, databaseId = null) => {
    try {
      setLoading(true);
      
      if (!configJson || configJson.trim() === '') {
        addLog(`Please enter Firebase config for ${dbName}`, 'error');
        showToast(`Please enter Firebase config for ${dbName}`, 'error');
        setLoading(false);
        return null;
      }
      
      let config;
      try {
        config = JSON.parse(configJson);
      } catch (parseError) {
        try {
          let fixedJson = configJson
            .replace(/([\w]+)\s*:/g, '"$1":')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*\]/g, ']');
          config = JSON.parse(fixedJson);
        } catch (二次Error) {
          try {
            config = new Function('return ' + configJson)();
          } catch (三次Error) {
            addLog(`Invalid format. Please check your config and try again`, 'error');
            showToast('Invalid JSON format in Firebase config', 'error');
            setLoading(false);
            return null;
          }
        }
      }
      
      if (!config.apiKey || !config.projectId) {
        addLog(`Invalid Firebase config. Please provide apiKey and projectId`, 'error');
        setLoading(false);
        return null;
      }
      
      const appName = dbName === 'Source' ? 'sourceApp' : 'targetApp';
      const existingApp = getApps().find(a => a.name === appName);
      const app = existingApp || initializeApp(config, appName);
      // Use databaseId if provided, otherwise use default Firestore database
      const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
      
      setDb(db);
      setConnected(true);
      addLog(`Connected to ${dbName} Firebase successfully!`, 'success');
      showToast(`Successfully connected to ${dbName} Firebase!`, 'success');
      return db;
    } catch (error) {
      addLog(`Failed to connect to ${dbName}: ${error.message}`, 'error');
      console.error('Connection error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Discover collections and their subcollections (recursive)
  const discoverCollections = async (db, collectionNames) => {
    const collections = [];
    
    try {
      for (const collName of collectionNames) {
        try {
          const collRef = collection(db, collName);
          const docSnap = await getDocs(collRef);
          
          const collectionObj = {
            name: collName,
            path: collName,
            documentCount: docSnap.size,
            subcollections: []
          };
          
            // Recursively discover all nested subcollections
          if (docSnap.size > 0) {
            collectionObj.subcollections = await findNestedSubcollections(db, collName, 5);
          }
          
          // Only add collection if it has at least 1 document
          if (docSnap.size > 0) {
            collections.push(collectionObj);
          } else {
            console.log(`Skipping collection '${collName}' - no documents found`);
          }
        } catch (e) {
          console.log(`Error checking collection ${collName}:`, e);
        }
      }
    } catch (error) {
      console.log('Collection discovery error:', error);
    }
    
    return collections;
  };

  const addCollection = async () => {
    if (!sourceDb || !collectionInput.trim()) return;
    
    const names = collectionInput.split(',').map(n => n.trim()).filter(n => n);
    if (names.length === 0) return;
    
    setSourceLoading(true);
    try {
      addLog(`Discovering collections: ${names.join(', ')}...`, 'info');
      const collections = await discoverCollections(sourceDb, names);
      
      const requestedCount = names.length;
      const addedCount = collections.length;
      
      if (addedCount === 0 && requestedCount > 0) {
        addLog(`No documents found in any of the requested collection(s)`, 'warning');
        showToast('No documents found in any of the requested collection(s)', 'warning');
      } else if (addedCount < requestedCount) {
        addLog(`Found ${addedCount} collection(s) with documents (${requestedCount - addedCount} had no documents)`, 'success');
        showToast(`Found ${addedCount} collection(s) with documents`, 'success');
      } else {
        addLog(`Found ${addedCount} collection(s)`, 'success');
        showToast(`Added ${addedCount} collection(s)`, 'success');
      }
      
      setSourceCollections(prev => [...prev, ...collections]);
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setSourceLoading(false);
      setCollectionInput('');
    }
  };

  // Remove a collection or subcollection by path
  const removeCollection = (pathToRemove) => {
    // Helper function to recursively remove from nested structure
    const removeFromNested = (collections) => {
      return collections
        .filter(c => c.path !== pathToRemove && !c.path.startsWith(pathToRemove + '/'))
        .map(c => ({
          ...c,
          subcollections: c.subcollections ? removeFromNested(c.subcollections) : []
        }));
    };
    
    const updatedCollections = removeFromNested(sourceCollections);
    setSourceCollections(updatedCollections);
    
    // Also remove from selected collections if selected
    setSelectedCollections(prev => 
      prev.filter(p => p !== pathToRemove && !p.startsWith(pathToRemove + '/'))
    );
    
    showToast(`Removed: ${pathToRemove}`, 'info');
    addLog(`Removed: ${pathToRemove}`, 'info');
  };

  // Add subcollection by name - finds it from any document in parent
  const addSubcollection = async (parentPath) => {
    if (!sourceDb || !subcollectionInput.trim()) return;
    
    const input = subcollectionInput.trim();
    
    setSourceLoading(true);
    try {
      // Check if input contains a slash (documentId/subcollection format)
      if (input.includes('/')) {
        // User provided "documentId/subcollection" format
        const parts = input.split('/');
        const docId = parts[0];
        const subColName = parts.slice(1).join('/'); // Handle nested like "a/b"
        const fullPath = `${parentPath}/${docId}/${subColName}`;
        
        addLog(`Trying path: ${fullPath}...`, 'info');
        
        try {
          const collRef = collection(sourceDb, fullPath);
          const docs = await getDocs(collRef);
          
          // Only add if there are documents
          if (docs.size === 0) {
            addLog(`Subcollection "${fullPath}" is empty (0 documents) - not adding`, 'error');
            setSourceLoading(false);
            return;
          }
          
          const nestedSubcollections = await findNestedSubcollections(sourceDb, fullPath, 3);
          
          const updateCollections = (cols) => {
            return cols.map(col => {
              if (col.path === parentPath) {
                return {
                  ...col,
                  subcollections: [...col.subcollections, {
                    name: `${docId}/${subColName}`,
                    path: fullPath,
                    documentCount: docs.size,
                    subcollections: nestedSubcollections
                  }]
                };
              }
              return col;
            });
          };
          
          setSourceCollections(prev => updateCollections(prev));
          addLog(`Added: ${fullPath} (${docs.size} documents)`, 'success');
          setSubcollectionInput('');
          setAddingSubcollectionTo(null);
          setSourceLoading(false);
          return;
        } catch (e) {
          addLog(`Path "${fullPath}" not found: ${e.message}`, 'error');
          setSourceLoading(false);
          return;
        }
      }
      
      // Just subcollection name - search all documents in parent
      addLog(`Searching for "${input}" in all documents under ${parentPath}...`, 'info');
      
      const parentCollRef = collection(sourceDb, parentPath);
      const parentDocs = await getDocs(parentCollRef);
      
      if (parentDocs.empty) {
        addLog(`No documents in "${parentPath}"`, 'error');
        setSourceLoading(false);
        return;
      }
      
      addLog(`Checking ${parentDocs.size} documents...`, 'info');
      
      // Try to find subcollection in EACH document - check all documents
      const foundSubCols = new Map();
      
      // Check EVERY document in the collection
      for (const doc of parentDocs.docs) {
        try {
          // Try to directly access the potential subcollection path
          const testPath = `${parentPath}/${doc.id}/${input}`;
          const testRef = collection(sourceDb, testPath);
          const testSnap = await getDocs(testRef);
          
          // Only add if there are documents in the subcollection
          if (testSnap.size > 0) {
            foundSubCols.set(testPath, {
              path: testPath,
              name: input,
              documentCount: testSnap.size
            });
            addLog(`Found "${input}" in document: ${doc.id} (${testSnap.size} docs)`, 'success');
          }
        } catch (e) {
          // This document doesn't have this subcollection, continue
        }
      }
      
      if (foundSubCols.size === 0) {
        addLog(`Subcollection "${input}" not found in any documents`, 'error');
        setSourceLoading(false);
        setSubcollectionInput('');
        setAddingSubcollectionTo(null);
        return;
      }
      
      // Add all found subcollections
      for (const [path, info] of foundSubCols) {
        const nestedSubcollections = await findNestedSubcollections(sourceDb, path, 3);
        
        const updateCollections = (cols) => {
          return cols.map(col => {
            if (col.path === parentPath) {
              // Check if already exists
              const exists = col.subcollections.some(s => s.path === path);
              if (!exists) {
                return {
                  ...col,
                  subcollections: [...col.subcollections, {
                    name: input,
                    path: path,
                    documentCount: info.documentCount,
                    subcollections: nestedSubcollections
                  }]
                };
              }
            }
            // Check nested collections
            if (col.subcollections && col.subcollections.length > 0) {
              return {
                ...col,
                subcollections: updateCollections(col.subcollections)
              };
            }
            return col;
          });
        };
        
        setSourceCollections(prev => updateCollections(prev));
      }
      
      addLog(`Added ${foundSubCols.size} subcollection(s) found across documents`, 'success');
      
      setSubcollectionInput('');
      setAddingSubcollectionTo(null);
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setSourceLoading(false);
    }
  };
  
  // Recursively find nested subcollections
  const findNestedSubcollections = async (db, parentPath, depth = 3) => {
    if (depth <= 0) return [];
    
    const subcollections = [];
    
    try {
      const collRef = collection(db, parentPath);
      const docs = await getDocs(collRef);
      
      if (docs.empty) return [];
      
      const foundSubCols = new Map();
      
      // Check more documents for subcollections
      for (const doc of docs.docs.slice(0, 30)) {
        try {
          if (typeof doc.ref.listCollections === 'function')
          {
            const subColRefs = await doc.ref.listCollections();
            for (const subColRef of subColRefs) {
              if (!foundSubCols.has(subColRef.id)) {
                foundSubCols.set(subColRef.id, subColRef);
              }
            }
          }
        } catch (e) {}
      }
      
      for (const [subColName, subColRef] of foundSubCols) {
        try {
          const subDocSnap = await getDocs(subColRef);
          const nested = await findNestedSubcollections(db, subColRef.path, depth - 1);
          subcollections.push({
            name: subColName,
            path: subColRef.path,
            documentCount: subDocSnap.size,
            subcollections: nested
          });
        } catch (e) {}
      }
    } catch (e) {}
    
    return subcollections;
  };
  
  // Discover all nested subcollections for ALL documents at a path
  const discoverAllNested = async (parentPath) => {
    if (!sourceDb) return;
    
    setSourceLoading(true);
    try {
      addLog(`Discovering all nested subcollections under ${parentPath}...`, 'info');
      
      // Get all documents in this collection
      const collRef = collection(sourceDb, parentPath);
      const docs = await getDocs(collRef);
      
      if (docs.empty) {
        addLog(`No documents found in ${parentPath}`, 'error');
        setSourceLoading(false);
        return;
      }
      
      addLog(`Checking ${docs.size} documents for nested subcollections...`, 'info');
      
      // Find all unique subcollections across ALL documents
      const allSubCols = new Map();
      
      // For EACH document, try to find all possible subcollections
      for (const doc of docs.docs) {
        try {
          // Method 1: Try listCollections
          const docRef = doc.ref;
          if (typeof docRef.listCollections === 'function') {
            try {
              const subColRefs = await docRef.listCollections();
              for (const subColRef of subColRefs) {
                if (!allSubCols.has(subColRef.path)) {
                  allSubCols.set(subColRef.path, subColRef);
                }
              }
            } catch (e) {}
          }
          
        } catch (e) {
          console.log('Error checking document:', e);
        }
      }
      
      if (allSubCols.size === 0) {
        addLog(`No nested subcollections found in ${parentPath}`, 'info');
        setSourceLoading(false);
        return;
      }
      
      addLog(`Found ${allSubCols.size} unique subcollection(s)`, 'success');
      
      // Add each found subcollection with its nested structure
      for (const [path, subColRef] of allSubCols) {
        try {
          const subColRefActual = collection(sourceDb, path);
          const subDocSnap = await getDocs(subColRefActual);
          const nested = await findNestedSubcollections(sourceDb, path, 3);
          
          const addToCollections = (cols, targetPath) => {
            return cols.map(col => {
              if (col.path === targetPath) {
                const exists = col.subcollections.some(s => s.path === path);
                if (!exists) {
                  return {
                    ...col,
                    subcollections: [...col.subcollections, {
                      name: subColRef.id || path.split('/').pop(),
                      path: path,
                      documentCount: subDocSnap.size,
                      subcollections: nested
                    }]
                  };
                }
              }
              if (col.subcollections && col.subcollections.length > 0) {
                return {
                  ...col,
                  subcollections: addToCollections(col.subcollections, targetPath)
                };
              }
              return col;
            });
          };
          
          setSourceCollections(prev => addToCollections(prev, parentPath));
        } catch (e) {
          console.log('Error adding subcollection:', e);
        }
      }
      
      addLog(`Added ${allSubCols.size} nested subcollection(s)`, 'success');
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setSourceLoading(false);
    }
  };
  
  // Global search - adds subcollection to ALL documents in ALL collections at once
  const globalSearchSubcollections = async () => {
    if (!sourceDb || !subcollectionInput.trim() || sourceCollections.length === 0) return;
    
    const searchName = subcollectionInput.trim();
    
    setSourceLoading(true);
    try {
      addLog(`Searching for "${searchName}" in all collections...`, 'info');
      
      // Find all collections (not just those with subcollections)
      const allCollections = [];
      
      const findAllCollections = (cols) => {
        for (const col of cols) {
          allCollections.push({
            parentPath: col.path,
            parentName: col.name
          });
          if (col.subcollections) {
            findAllCollections(col.subcollections);
          }
        }
      };
      
      findAllCollections(sourceCollections);
      
      if (allCollections.length === 0) {
        addLog(`No collections found.`, 'error');
        setSourceLoading(false);
        return;
      }
      
      let totalAdded = 0;
      
      // Add to ALL collections at once
      for (const parent of allCollections) {
        // Use a temporary subcollectionInput to make addSubcollection work
        setSubcollectionInput(searchName);
        const result = await addSubcollectionForGlobalSearch(parent.parentPath, searchName);
        totalAdded += result;
      }
      
      if (totalAdded > 0) {
        addLog(`Added "${searchName}" to ${totalAdded} location(s)`, 'success');
      } else {
        addLog(`No "${searchName}" subcollection found in any documents`, 'error');
      }
      
      setSubcollectionInput('');
      
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setSourceLoading(false);
    }
  };
  
  // Add subcollection for global search (uses the searchName directly)
  const addSubcollectionForGlobalSearch = async (parentPath, searchName) => {
    let addedCount = 0;
    
    try {
      const parentCollRef = collection(sourceDb, parentPath);
      const parentDocs = await getDocs(parentCollRef);
      
      if (parentDocs.empty) return 0;
      
      const foundSubCols = new Map();
      
      // Check EVERY document in the collection
      for (const doc of parentDocs.docs) {
        try {
          const testPath = `${parentPath}/${doc.id}/${searchName}`;
          const testRef = collection(sourceDb, testPath);
          const testSnap = await getDocs(testRef);
          
          // Only add if there are documents
          if (testSnap.size > 0) {
            foundSubCols.set(testPath, {
              path: testPath,
              name: searchName,
              documentCount: testSnap.size
            });
          }
        } catch (e) {
          // Subcollection doesn't exist
        }
      }
      
      // Add all found subcollections
      for (const [path, info] of foundSubCols) {
        const nestedSubcollections = await findNestedSubcollections(sourceDb, path, 3);
        
        const updateCollections = (cols) => {
          return cols.map(col => {
            if (col.path === parentPath) {
              const exists = col.subcollections.some(s => s.path === path);
              if (!exists) {
                addedCount++;
                return {
                  ...col,
                  subcollections: [...col.subcollections, {
                    name: searchName,
                    path: path,
                    documentCount: info.documentCount,
                    subcollections: nestedSubcollections
                  }]
                };
              }
            }
            if (col.subcollections && col.subcollections.length > 0) {
              return {
                ...col,
                subcollections: updateCollections(col.subcollections)
              };
            }
            return col;
          });
        };
        
        setSourceCollections(prev => updateCollections(prev));
      }
      
    } catch (e) {
      // Error accessing parent collection
    }
    
    return addedCount;
  };

  const connectSource = async () => {
    const db = await connectFirebase(sourceConfig, setSourceDb, setSourceConnected, setSourceLoading, 'Source', sourceDatabaseId || null);
    if (db) {
      addLog('Connected. Add collections manually using the input field below.', 'info');
    }
  };

  const connectTarget = async () => {
    await connectFirebase(targetConfig, setTargetDb, setTargetConnected, setTargetLoading, 'Target', targetDatabaseId || null);
  };

  const toggleCollectionSelection = (path) => {
    setSelectedCollections(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path);
      } else {
        return [...prev, path];
      }
    });
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCollections([]);
    } else {
      const allPaths = getAllCollectionPaths(sourceCollections);
      setSelectedCollections(allPaths);
    }
    setSelectAll(!selectAll);
  };

  const getAllCollectionPaths = (collections) => {
    let paths = [];
    for (const coll of collections) {
      paths.push(coll.path);
      if (coll.subcollections) {
        paths = [...paths, ...getAllCollectionPaths(coll.subcollections)];
      }
    }
    return paths;
  };

  // Recursively get document count for a collection path
  const getDocumentCount = async (db, collPath) => {
    try {
      const collRef = collection(db, collPath);
      const docSnap = await getDocs(collRef);
      return docSnap.size;
    } catch (e) {
      return 0;
    }
  };

  const migrateData = async () => {
    if (!sourceDb || !targetDb || selectedCollections.length === 0) {
      addLog('Please connect both databases and select collections to migrate', 'error');
      showToast('Please connect both databases and select at least one collection to migrate', 'error');
      return;
    }

    setMigrating(true);
    setMigrationProgress(0);
    setMigrationStats({ collections: 0, documents: 0, errors: 0 });
    setMigrationLogs([]);

    const totalCollections = selectedCollections.length;
    let migratedDocs = 0;
    let errors = 0;

    try {
      for (let i = 0; i < selectedCollections.length; i++) {
        const collectionPath = selectedCollections[i];
        addLog(`Migrating collection: ${collectionPath}...`, 'info');

        try {
          const querySnapshot = await getDocs(collection(sourceDb, collectionPath));
          
          for (const docSnapshot of querySnapshot.docs) {
            try {
              const docData = docSnapshot.data();
              
              await setDoc(doc(targetDb, collectionPath, docSnapshot.id), {
                ...docData
              });
              
              // Migrate subcollections using listCollections
              await migrateSubCollections(collectionPath, docSnapshot.id);

              migratedDocs++;
              setMigrationProgress(Math.round(((i + 1) / totalCollections) * 100));
            } catch (docError) {
              errors++;
              console.log('Error migrating document:', docError);
            }
          }
          
          setMigrationStats(prev => ({
            ...prev,
            collections: prev.collections + 1,
            documents: migratedDocs,
            errors
          }));
          
          addLog(`Completed ${collectionPath}: ${querySnapshot.size} documents`, 'success');
        } catch (collError) {
          errors++;
          addLog(`Error migrating ${collectionPath}: ${collError.message}`, 'error');
        }
      }
      
      addLog(`Migration complete! ${migratedDocs} documents migrated, ${errors} errors`, 'success');
      showToast(`Migration complete! ${migratedDocs} documents migrated`, errors > 0 ? 'warning' : 'success');
      
      // Remove migrated collections from the list
      setSourceCollections(prev => prev.filter(col => !selectedCollections.includes(col.path)));
      setSelectedCollections([]);
    } catch (error) {
      addLog(`Migration failed: ${error.message}`, 'error');
    } finally {
      setMigrating(false);
    }
  };

  // Helper to recursively migrate subcollections
  const migrateSubCollections = async (parentPath, parentDocId) => {
    try {
      const parentDocRef = doc(sourceDb, parentPath, parentDocId);
      
      if (typeof parentDocRef.listCollections === 'function') {
        const subColRefs = await parentDocRef.listCollections();
        
        for (const subColRef of subColRefs) {
          const subColPath = subColRef.path;
          const subDocsSnap = await getDocs(subColRef);
          
          for (const subDocSnap of subDocsSnap.docs) {
            try {
              const subDocData = subDocSnap.data();
              await setDoc(doc(targetDb, subColPath, subDocSnap.id), {
                ...subDocData
              });
              
              await migrateSubCollections(subColPath, subDocSnap.id);
            } catch (e) {
              console.log('Error migrating subdoc:', e);
            }
          }
        }
      }
    } catch (e) {
      console.log('Error getting subcollections:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="toast-notification"
              onClick={() => removeToast(toast.id)}
              style={{
                background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 
                          toast.type === 'warning' ? 'rgba(245, 158, 11, 0.95)' :
                          toast.type === 'success' ? 'rgba(34, 197, 94, 0.95)' :
                          'rgba(59, 130, 246, 0.95)',
                color: '#fff',
                padding: '14px 20px',
                borderRadius: '10px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3), 0 0 20px rgba(59,130,246,0.3)',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '350px',
                animation: 'slideInRight 0.3s ease forwards, fadeOut 0.3s ease 3.7s forwards',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <span style={{ fontSize: '18px' }}>
                {toast.type === 'error' ? '⛔' : 
                 toast.type === 'warning' ? '⚠️' : 
                 toast.type === 'success' ? '✅' : 'ℹ️'}
              </span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="glass mb-8 px-9 py-7 flex items-center justify-between animate-slide-up">
        <div>
          <h1>Firebase Migration Tool</h1>
          <p className="header-subtitle">Transfer data between Firebase projects seamlessly</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {sourceConnected && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSourceConfig('');
                setSourceConnected(false);
                setSourceCollections([]);
                setSelectedCollections([]);
              }}
              style={{ transition: 'all 0.3s ease' }}
            >
              Disconnect Source
            </button>
          )}
          {targetConnected && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setTargetConfig('');
                setTargetConnected(false);
              }}
              style={{ transition: 'all 0.3s ease' }}
            >
              Disconnect Target
            </button>
          )}
          {!sourceConnected && !targetConnected && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSourceConfig('');
                setSourceConnected(false);
                setSourceCollections([]);
                setSelectedCollections([]);
                setMigrationLogs([]);
                setMigrationStats({ collections: 0, documents: 0, errors: 0 });
              }}
              style={{ transition: 'all 0.3s ease' }}
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ 
        gridTemplateColumns: !sourceConnected && !targetConnected ? '1fr 1fr' : 
                           sourceConnected && targetConnected ? '1fr' :
                           '2fr 1fr'
      }}>
        
        {/* Source Panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon source">📤</div>
              <span className="card-title-text">Source Firebase</span>
            </div>
            {sourceConnected && (
              <button
                onClick={() => {
                  setSourceConfig('');
                  setSourceConnected(false);
                  setSourceCollections([]);
                  setSelectedCollections([]);
                }}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            )}
          </div>
          <div className="card-body">
            {!sourceConnected ? (
              <FirebaseConfigInput
                config={sourceConfig}
                setConfig={setSourceConfig}
                onConnect={connectSource}
                loading={sourceLoading}
                label="Source"
                connectionStatus={sourceConnected}
                databaseId={sourceDatabaseId}
                setDatabaseId={setSourceDatabaseId}
              />
            ) : (
              <>
                {/* Connection Status Banner */}
                <div 
                  className="connection-banner"
                  style={{
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  <span style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: '#34d399',
                    boxShadow: '0 0 15px #34d399'
                  }} />
                  <span style={{ color: '#34d399', fontWeight: 500 }}>Connected</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Add Collection</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={collectionInput}
                      onChange={(e) => setCollectionInput(e.target.value)}
                      placeholder="e.g., users, products, orders"
                      onKeyPress={(e) => e.key === 'Enter' && addCollection()}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <button 
                      className="btn btn-primary"
                      onClick={addCollection}
                      disabled={sourceLoading || !collectionInput.trim()}
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Search for subcollection across ALL documents and ALL nested levels */}
                <div className="form-group slide-in-up">
                  <label className="form-label">
                    Global Search Subcollection
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input glow-effect"
                      value={subcollectionInput}
                      onChange={(e) => setSubcollectionInput(e.target.value)}
                      placeholder="e.g., thermalScans, aiInferenceResults"
                      onKeyPress={(e) => e.key === 'Enter' && globalSearchSubcollections()}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <button 
                      className="btn btn-secondary glow-effect"
                      onClick={globalSearchSubcollections}
                      disabled={sourceLoading || !subcollectionInput.trim() || sourceCollections.length === 0}
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="form-help" style={{ marginTop: '6px' }}>
                    <span>Adds this subcollection to ALL documents in ALL collections at once</span>
                  </div>
                </div>
                
                {sourceCollections.length > 0 && (
                  <>
                    <div className="collection-tree-header">
                      <span className="collection-tree-title">
                        Collections ({sourceCollections.length})
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={handleSelectAll}
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '12px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {selectAll ? 'Deselect All' : 'Select All'}
                        </button>
                        {sourceCollections.length > 0 && (
                          <button 
                            className="btn" 
                            onClick={() => {
                              setSourceCollections([]);
                              setSelectedCollections([]);
                              addLog('All collections cleared', 'info');
                            }}
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '12px',
                              background: 'rgba(248, 113, 113, 0.2)',
                              border: '1px solid rgba(248, 113, 113, 0.3)',
                              color: '#f87171',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <ul className="collection-tree">
                      {sourceCollections.map((coll, index) => (
                        <CollectionTreeItem
                          key={coll.path}
                          collection={coll}
                          selectedCollections={selectedCollections}
                          onToggleSelect={toggleCollectionSelection}
                          isTarget={false}
                          onAddSubcollection={addSubcollection}
                          addingTo={addingSubcollectionTo}
                          setAddingTo={setAddingSubcollectionTo}
                          subcollectionInput={subcollectionInput}
                          setSubcollectionInput={setSubcollectionInput}
                          onAddSubcollectionConfirm={addSubcollection}
                          discoverAllNested={discoverAllNested}
                          onRemove={removeCollection}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Target Panel - Minimal indicator when connected */}
        {targetConnected ? (
          <div 
            className="card"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              padding: '16px 24px',
              zIndex: 100,
              animation: 'fadeIn 0.5s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: '#34d399',
                boxShadow: '0 0 15px #34d399'
              }} />
              <span style={{ color: '#34d399', fontWeight: 500 }}>Target Connected</span>
              <button
                onClick={() => {
                  setTargetConfig('');
                  setTargetConnected(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Change
              </button>
            </div>
          </div>
        ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon target">📥</div>
              <span className="card-title-text">Target Firebase</span>
            </div>
            {targetConnected && (
              <button
                onClick={() => {
                  setTargetConfig('');
                  setTargetConnected(false);
                }}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            )}
          </div>
          <div className="card-body">
            {!targetConnected ? (
              <FirebaseConfigInput
                config={targetConfig}
                setConfig={setTargetConfig}
                onConnect={connectTarget}
                loading={targetLoading}
                label="Target"
                connectionStatus={targetConnected}
                databaseId={targetDatabaseId}
                setDatabaseId={setTargetDatabaseId}
              />
            ) : (
              <div 
                className="empty-state"
                style={{
                  animation: 'fadeIn 0.5s ease'
                }}
              >
                <div 
                  className="empty-icon"
                  style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  ✓
                </div>
                <div className="empty-title">Target Connected</div>
                <div className="empty-description" style={{ color: '#34d399' }}>Ready to receive migrated data</div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Migration Controls */}
      {sourceConnected && targetConnected && selectedCollections.length > 0 && (
        <div className="card" style={{ marginTop: '24px', animation: 'fadeIn 0.5s ease' }}>
          <div className="card-body">
            {/* Stats */}
            <div className="stats-grid">
              <StatCard value={selectedCollections.length} label="Collections" delay={0} />
              <StatCard value={migrationStats.documents} label="Documents" delay={50} />
              <StatCard value={migrationStats.errors} label="Errors" delay={100} />
              <StatCard value={`${migrationProgress}%`} label="Progress" delay={150} />
            </div>
            
            {/* Migrate Button */}
            <button
              className="btn btn-success btn-full"
              onClick={migrateData}
              disabled={migrating || selectedCollections.length === 0}
              style={{ 
                padding: '18px', 
                fontSize: '15px',
                transition: 'all 0.3s ease',
                transform: migrating ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {migrating ? `Migrating... ${migrationProgress}%` : `Start Migration (${selectedCollections.length} collections)`}
            </button>
            
            {/* Logs */}
            {migrationLogs.length > 0 && (
              <div className="logs-container" style={{ marginTop: '20px' }}>
                {migrationLogs.map((log, index) => (
                  <LogEntry key={index} log={log} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
