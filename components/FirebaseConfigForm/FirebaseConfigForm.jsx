/**
 * Firebase Configuration Form Component
 * Input form for Firebase connection configuration
 */

import { useState } from 'react';

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
  const [showJsonHelp, setShowJsonHelp] = useState(false);

  return (
    <div className="form-group">
      <label className="form-label">{label} Firebase Config (JSON)</label>
      <textarea
        className="form-textarea"
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        placeholder='Paste your Firebase config JSON here...'
        style={{ transition: 'all 0.3s ease' }}
        disabled={connectionStatus}
      />
      <div className="form-help">
        <span>💡</span>
        <span 
          onClick={() => setShowJsonHelp(!showJsonHelp)}
          style={{ cursor: 'pointer', color: '#60a5fa' }}
        >
          How to get config?
        </span>
      </div>
      
      {showJsonHelp && (
        <div className="json-help" style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '8px',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Get from: Firebase Console → Project Settings → Your Apps → Web App</p>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#9ca3af' }}>
{`{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}`}
          </pre>
        </div>
      )}

      <label className="form-label" style={{ marginTop: '16px' }}>
        Database ID (Optional)
      </label>
      <input
        type="text"
        className="form-input"
        value={databaseId || ''}
        onChange={(e) => setDatabaseId(e.target.value)}
        placeholder="e.g., fahis-db (leave empty for default database)"
        disabled={connectionStatus}
      />
      <div className="form-help">
        <span>ℹ️</span>
        <span>Leave empty to use default Firestore database</span>
      </div>

      <div className="btn-group" style={{ marginTop: '16px' }}>
        <button
          className="btn btn-primary"
          onClick={onConnect}
          disabled={loading || !config.trim() || connectionStatus}
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

export default FirebaseConfigInput;
