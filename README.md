# Firebase Migration Tool

A web-based tool to migrate data between Firebase Firestore projects — supporting nested subcollections, named databases, and real-time progress tracking.

## Features

- **Dual Firebase connection** — Connect source and target independently with optional database IDs
- **Collection discovery** — Add collections by name and discover their subcollections recursively
- **Global subcollection search** — Search for a subcollection name across ALL documents in ALL collections
- **Nested subcollection migration** — Recursively migrates subcollections at any depth using `listCollections`
- **Real-time progress** — Live migration logs, progress bar, and stats (collections, documents, errors)
- **Toast notifications** — In-app notifications for success, warnings, and errors
- **Markdown report export** — Download or copy migration reports
- **Security-first** — You provide your own Firebase configs; nothing is stored server-side

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Firebase SDK 10** (Firestore)
- **Tailwind CSS 3**

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Paste your **Source** Firebase project config JSON and click *Connect to Source*
2. Optionally enter a database ID (leave empty for default database)
3. Add collection names (comma-separated) to discover their structure
4. Paste your **Target** Firebase project config JSON and click *Connect to Target*
5. Select collections to migrate
6. Click *Start Migration*
