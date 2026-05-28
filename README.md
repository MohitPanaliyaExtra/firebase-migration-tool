# Firebase Migration Tool

A web-based tool to migrate data between Firebase Firestore projects — supporting nested subcollections, named databases, and real-time progress tracking.

## Problem

Migrating data between Firebase projects is tedious. You need to manually export/import or write custom scripts that often break with nested subcollections. When moving data across projects with different database IDs, most tools fall short.

## Solution

This tool provides a clean UI to connect source and target Firebase projects, discover collection structures, and migrate data with full nested subcollection support.

## Features

- **Dual Firebase connection** — Independent source/target with optional named database IDs
- **Collection discovery** — Add collections by name, recursively discover subcollections
- **Global subcollection search** — Search for a subcollection name across ALL documents in ALL collections
- **Nested subcollection migration** — Recursively migrates subcollections at any depth using Firestore's `listCollections`
- **Real-time progress** — Live migration logs with timestamps, progress bar, and stats
- **Toast notifications** — Non-blocking notifications for success, warnings, and errors
- **Security-first** — You provide your own Firebase configs; nothing is stored server-side

## Tech Stack

- **Next.js 14** (App Router)
- **React 18** with functional components and hooks
- **Firebase SDK 10** (Firestore)
- **Tailwind CSS 3**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste **Source** Firebase config JSON → *Connect to Source*
2. Optionally enter a **Source Database ID** (leave empty for default)
3. Add collection names (comma-separated) to discover structure and subcollections
4. Paste **Target** Firebase config JSON → *Connect to Target*
5. Select collections to migrate
6. Click *Start Migration* and monitor progress

## License

MIT
