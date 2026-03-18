# Broadcast SaaS

A multi-tenant SaaS messaging platform built with **React**, **TypeScript**, **Vite**, **Firebase Authentication**, and **Cloud Firestore**.

This project was implemented as a technical assessment and focuses on:

- clean structure
- functional programming style
- multi-tenant data isolation
- realtime Firestore listeners
- good user experience with loading, feedback, and confirmations
- no subcollections in Firestore

## Overview

The application allows each tenant to manage its own:

- connections
- contacts
- messages

Each authenticated user belongs to a tenant, and users cannot access data from other tenants.

Messages can be created as immediate sends or scheduled sends. Scheduled messages are reconciled in the application layer and automatically move from `scheduled` to `sent` when the page is active and the scheduled time is reached.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Material UI
- Tailwind CSS
- React Router DOM

### Backend Platform

- Firebase Authentication
- Cloud Firestore
- Firestore Security Rules
- Firebase Emulator Suite

### Development Tools

- Node.js 24.13.1
- Firebase CLI

---

## Main Features

### Authentication

- email/password registration
- email/password login
- logout

### Multi-Tenant SaaS Flow

- each user gets a tenant during registration
- each user gets a membership linked to that tenant
- all business data is scoped by `tenantId`
- Firestore Security Rules enforce tenant isolation

### Connections

- create connection
- list connections in realtime
- update connection
- delete connection

### Contacts

- create contact
- list contacts in realtime
- update contact
- delete contact
- contacts are scoped to a connection

### Messages

- create fake outbound messages
- select one or more contacts
- send immediately or schedule for later
- list messages in realtime
- update message
- delete message
- filter messages by status
- show recipient names on message cards

### Dashboard

- tenant name
- tenant id
- membership role
- total connections
- total contacts
- total messages
- total scheduled messages
- total sent messages

### UX

- global snackbar feedback
- reusable confirmation dialog
- loading states
- empty states
- responsive dashboard shell with sidebar and top bar

---

## Architecture Decisions

## 1. No Firestore Subcollections

All data is stored in top-level collections only.

Collections used:

- `tenants`
- `memberships`
- `connections`
- `contacts`
- `messages`

This keeps the Firestore model aligned with the assessment requirements and simplifies tenant-scoped queries.

## 2. Functional Programming Style

The project avoids object-oriented patterns and uses:

- plain functions
- hooks for UI logic
- services for Firebase access
- small reusable modules

## 3. Firestore Rules as Real Security

The frontend always filters data by `tenantId`, but the real protection is in Firestore Security Rules.

This ensures one tenant cannot access another tenant's data even if someone manipulates requests manually.

---

## Folder Structure

```text
multi-tenant-broadcast-saas/
  .firebaserc
  firebase.json
  firestore.rules
  firestore.indexes.json
  README.md
  web/
    src/
      app/
      components/
      constants/
      hooks/
      layouts/
      lib/
      pages/
        auth/
        dashboard/
        connections/
        contacts/
        messages/
      router/
      services/
        auth/
        tenants/
        memberships/
        connections/
        contacts/
        messages/
      theme/
      types/
      utils/
```

### Structure Notes

- `pages/` contains route-level screens
- `services/` contains Firebase/Auth/Firestore operations
- `hooks/` contains reusable stateful UI logic
- `constants/` contains collection names, statuses, roles, and routes
- `layouts/` contains the application shell
- `theme/` contains the Material UI theme

---

## Firestore Data Model

### tenants

```ts
{
  name: string;
  ownerUserId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### memberships

Document id:

```text
memberships/{userId}
```

```ts
{
  tenantId: string;
  userId: string;
  role: "owner" | "member";
  createdAt: Timestamp;
}
```

### connections

```ts
{
  tenantId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### contacts

```ts
{
  tenantId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### messages

```ts
{
  tenantId: string;
  connectionId: string;
  content: string;
  contactIds: string[];
  scheduledAt: Timestamp | null;
  status: "draft" | "scheduled" | "sent";
  sentAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## Routing

Main routes:

- `/login`
- `/register`
- `/`
- `/connections`
- `/connections/:connectionId/contacts`
- `/connections/:connectionId/messages`

---

## How Scheduled Messages Work

Flow:

1. user creates a message with a future datetime
2. message is saved with status `scheduled`
3. when the messages page loads, subscribes, or reaches polling interval:
   - the app checks scheduled messages
   - if `scheduledAt <= now`
   - the message is updated to `sent`
   - `sentAt` and `updatedAt` are updated

---

## Security Model

Security Rules enforce:

- only authenticated users can access protected data
- tenant access is validated through the authenticated user's membership document
- all reads and writes for connections, contacts, and messages require tenant membership

Membership strategy used by rules:

```text
memberships/{request.auth.uid}
```

This makes membership lookup deterministic and compatible with Firestore Security Rules.

---

## Environment Variables

Create `web/.env.local` with your Firebase project values:

```env
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
VITE_USE_FIREBASE_EMULATORS=true
```

---

## Running the Project Locally

## 1. Install dependencies

At the project root:

```bash
npm install -g firebase-tools
```

Inside the frontend:

```bash
cd web
npm install
```

## 2. Start Firebase emulators

From the project root:

```bash
firebase emulators:start
```

Recommended persistent mode:

```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

## 3. Start the frontend

From `web/`:

```bash
npm run dev
```

## 4. Open the app

```text
http://localhost:5173
```

## 5. Open Emulator UI

Usually:

```text
http://localhost:4000
```

There you can inspect:

- Authentication users
- Firestore collections
- emulator logs

---

## Firebase Emulator Notes

When using emulators:

- Auth users are local only
- Firestore data is local only
- Firebase Console will not show emulator-only users/data

If you need a clean reset:

1. stop the emulators
2. delete the `emulator-data` folder if you are using import/export
3. start again
4. register fresh users

---

## Firestore Indexes

The project includes composite indexes to support the main query patterns, including:

- connections by `tenantId` ordered by `createdAt`
- contacts by `tenantId + connectionId` ordered by `createdAt`
- messages by `tenantId + connectionId` ordered by `createdAt`
- messages filtered by status
- scheduled message reconciliation queries

If Firestore Emulator reports a missing index during development, update `firestore.indexes.json` accordingly.

---

## Suggested Manual Test Plan

### Authentication

- register a new user
- confirm user appears in Auth emulator
- log out
- log in again

### Tenant Onboarding

- confirm `tenants` document is created
- confirm `memberships/{userId}` is created

### Tenant Isolation

- create User A and User B
- confirm User A cannot see User B data
- confirm User B cannot see User A data

### Connections

- create, update, delete connections
- confirm realtime updates across tabs

### Contacts

- create, update, delete contacts
- confirm contacts are scoped to the correct connection

### Messages

- create an immediate message
- create a scheduled message
- filter by sent and scheduled
- confirm recipient names display correctly

### Scheduled Reconciliation

- create a scheduled message with a near-future datetime
- keep the messages page open
- confirm the message moves from `scheduled` to `sent`

---

## Project Strengths

- explicit multi-tenant structure
- no subcollections
- realtime Firestore usage
- clean separation of services, hooks, pages, and layout
- free-tier friendly architecture
- clear UX feedback with snackbar and confirmation dialog
- aligned with requested stack and constraints

---

## Possible Future Improvements

- friendlier Firebase error mapping
- stronger form validation with `react-hook-form` and `zod`
- rollback handling during registration if tenant creation fails after auth succeeds
- invite additional members to a tenant
- per-recipient delivery simulation
- dashboard charts or richer analytics
- automated tests for hooks and services

