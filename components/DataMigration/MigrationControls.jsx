/**
 * Migration Controls Component
 * UI for controlling data migration operations
 */

import { useState } from 'react';

const MigrationControls = ({
  selectedCollections,
  sourceConnected,
  targetConnected,
  onMigrate,
  migrating,
  migrationProgress,
  onClearLogs,
  logs
}) => {
  const [deleteSource, setDeleteSource] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canMigrate = sourceConnected && 
                     targetConnected && 
                     selectedCollections.length > 0 && 
                     !migrating;

  const handleMigrateClick = () => {
    if (deleteSource && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    onMigrate(deleteSource);
    setShowConfirmation(false);
  };

  return (
    <div className="migration-controls">
      {/* Migration Info */}
      <div className="migration-info" style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>
              Migration Summary
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
              {selectedCollections.length} collection(s) selected
            </p>
          </div>
          <div className="migration-stats" style={{
            display: 'flex',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: sourceConnected ? '#34d399' : '#f87171'
              }}>
                {sourceConnected ? '✓' : '✕'}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Source</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: targetConnected ? '#34d399' : '#f87171'
              }}>
                {targetConnected ? '✓' : '✕'}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Target</div>
            </div>
          </div>
        </div>

        {/* Selected Collections Preview */}
        {selectedCollections.length > 0 && (
          <div className="selected-preview" style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '12px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#9ca3af', 
              marginBottom: '8px' 
            }}>
              Selected Collections:
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '6px' 
            }}>
              {selectedCollections.slice(0, 5).map(path => (
                <span key={path} style={{
                  background: 'rgba(129, 140, 248, 0.2)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  color: '#a5b4fc'
                }}>
                  {path}
                </span>
              ))}
              {selectedCollections.length > 5 && (
                <span style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  color: '#9ca3af'
                }}>
                  +{selectedCollections.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Migration Options */}
      <div className="migration-options" style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff' }}>
          Migration Options
        </h4>
        
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="checkbox"
            checked={deleteSource}
            onChange={(e) => {
              setDeleteSource(e.target.checked);
              setShowConfirmation(false);
            }}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#f87171'
            }}
          />
          <span style={{ color: '#fff', fontSize: '13px' }}>
            Delete source documents after migration
          </span>
        </label>

        {showConfirmation && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '8px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <p style={{ 
              margin: '0 0 8px 0', 
              color: '#fca5a5', 
              fontSize: '13px' 
            }}>
              ⚠️ This will permanently delete source documents!
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Migration Button */}
      <button
        className="btn btn-primary btn-migrate"
        onClick={handleMigrateClick}
        disabled={!canMigrate}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          background: canMigrate 
            ? 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
            : 'rgba(100,100,100,0.5)',
          opacity: canMigrate ? 1 : 0.6,
          cursor: canMigrate ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          marginBottom: '16px'
        }}
      >
        {migrating 
          ? `Migrating... ${migrationProgress}%`
          : deleteSource 
            ? 'Migrate & Delete Source'
            : 'Start Migration'}
      </button>

      {/* Progress Bar */}
      {migrating && (
        <div className="progress-container" style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>
              Progress
            </span>
            <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: 'bold' }}>
              {migrationProgress}%
            </span>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${migrationProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Log Section */}
      <div className="log-section" style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>
            Migration Logs
          </h4>
          <button
            onClick={onClearLogs}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Logs
          </button>
        </div>
        
        <div className="log-container" style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '12px',
          maxHeight: '200px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No logs yet. Start migration to see progress.
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                style={{
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: log.type === 'error' ? '#f87171' 
                    : log.type === 'success' ? '#34d399' 
                    : log.type === 'warning' ? '#fbbf24' 
                    : '#9ca3af'
                }}
              >
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationControls;
