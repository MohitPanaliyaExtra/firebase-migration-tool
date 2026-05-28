/**
 * Collection Tree Item Component
 * Displays a collection in a tree structure with expand/collapse functionality
 */

import { useState } from 'react';

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
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CollectionTreeItem;
