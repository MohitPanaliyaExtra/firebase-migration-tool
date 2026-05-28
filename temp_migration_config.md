# Firebase Migration App - Production Ready

## Date Updated: 2026-03-20

## Project Structure

```
Migration/
├── app/
│   ├── page.js           # Main application page
│   ├── layout.js         # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── FirebaseConfigForm/    # Firebase configuration input form
│   │   ├── FirebaseConfigForm.jsx
│   │   └── index.js
│   ├── CollectionTree/        # Collection tree display components
│   │   ├── CollectionTreeItem.jsx
│   │   └── index.js
│   ├── DataMigration/         # Migration controls UI
│   │   ├── MigrationControls.jsx
│   │   └── index.js
│   └── common/                # Common/shared components
├── lib/
│   └── firebase.js       # Firebase configuration and utilities
├── hooks/
│   └── useFirebase.js   # Custom React hooks for Firebase operations
└── temp_migration_config.md
```

## Features Implemented

### 1. Modular Component Architecture
- **FirebaseConfigForm**: Reusable form component for entering Firebase configuration
- **CollectionTreeItem**: Tree view component for displaying collections
- **MigrationControls**: UI for controlling migration operations

### 2. Custom Hooks (`hooks/useFirebase.js`)
- `useFirebaseConnection`: Handle Firebase connection state
- `useCollections`: Manage collection discovery
- `useMigration`: Handle data migration logic
- `useScrollAnimation`: Scroll animation hook

### 3. Firebase Library (`lib/firebase.js`)
- Centralized Firebase app initialization
- Database instance management with named database support
- CRUD operations for Firestore documents
- Default configuration exports

### 4. Database ID Support
Both Source and Target now have optional database ID fields:
- Leave empty → Uses default Firestore database
- Enter name (e.g., `fahis-db`) → Uses that named database

## Current Configuration

### Source Firebase (fahis-70b8b)
- Project ID: fahis-70b8b
- API Key: AIzaSyC_sF71vZSHSvSltYpwFKnxTJzm6yupsvw

### Target Firebase (fahmbiotechproject)
- Project ID: fahmbiotechproject
- API Key: AIzaSyCFQ87vlmzSt2igXXikONePJuUPY_ZUytE
- Database: fahis-db (if specified in the database ID field)

## Usage

1. Enter Firebase config JSON for Source
2. Optionally enter Source Database ID (leave empty for default)
3. Click "Connect to Source"
4. Enter Firebase config JSON for Target
5. Optionally enter Target Database ID (e.g., fahis-db)
6. Click "Connect to Target"
7. Add collections to migrate
8. Click "Start Migration"

## To Delete After Migration (revert to original)

The Target config in app/page.js can be reverted to:
```javascript
const defaultTargetConfig = {
  apiKey: "AIzaSyC3M1uYEn2-vNOaeqcuA96xYJlEOrWENXg",
  authDomain: "fahis-migration-check.firebaseapp.com",
  projectId: "fahis-migration-check",
  storageBucket: "fahis-migration-check.firebasestorage.app",
  messagingSenderId: "851479523675",
  appId: "1:851479523675:web:d4d5c6c647f20dd9ebaa7e"
};
```

---

**Note**: This is a production-ready architecture with proper separation of concerns. The components, hooks, and utilities can be easily maintained and extended.
