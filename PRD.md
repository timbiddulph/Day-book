# Daybook — Product Requirements Document

## 1. Overview

A virtual daybook: a notes-and-actions app organised around the metaphor of a physical day book — **new day, new page** — but without the paper hassle. Each day gets a fresh page for freeform notes and a checklist of actions. The defining behaviour is **automatic roll-forward**: unfinished actions follow you to the next day so nothing is lost, while completed work stays archived on the day it was done.

Cross-device from the start (PC + mobile), installable as a PWA, and built multi-tenant so it can be opened up to other users.

## 2. Problem

- Paper day books work well but are a hassle and don't travel or search.
- General note tools (e.g. Obsidian) become messy — a web of links with no enforced daily rhythm.
- Notes are sometimes captured away from the PC, so capture must work on mobile too.

The daybook stays clean because it's **chronological, not a graph**, and the day-page rhythm is enforced rather than optional.

## 3. Goals & non-goals

**Goals**
- Frictionless daily capture of notes and actions, keyboard-first on desktop.
- Auto roll-forward of open actions.
- Seamless sync across PC and mobile.
- Searchable history across all days.
- Safe to open up to other users (per-user data isolation).

**Non-goals (for now)**
- Merging with the existing task prioritiser (kept separate; revisit later if it proves out).
- Collaboration / shared pages between users.
- Rich Obsidian-style linking, tags, or graph views.
- Native mobile apps (PWA only).

## 4. Core concept — the data model that makes it work

**A "page" is a view, not a container.** Actions and notes are first-class records carrying dates; "Today" is assembled live rather than stored as a fixed page.

- A **note** belongs to a single day (`note_date`).
- An **action** is a standalone record with `created_on` and a nullable `completed_on`.
- **Today's page** = today's notes + *every* action where `completed_on` is null (regardless of `created_on`) + any action completed today.

Auto roll-forward then comes for free: an open action simply keeps appearing on each new day until `completed_on` is set. Because actions are already standalone records, a future merge with the prioritiser is a data question, not a rebuild.

## 5. Features by phase

### Phase 1 — Local single-user (prove the feel)
- Auto-created day page; date as the title, nothing to set up.
- Two zones: freeform notes (markdown) and an actions checklist.
- Keyboard-first capture; distinct quick-add for note vs action.
- Tick to complete; completed actions move out of the live list.
- Local storage only (IndexedDB). No auth, no backend.
- **Done when:** daily capture feels faster and cleaner than paper/Obsidian.

### Phase 2 — Sync & auth
- Supabase backend; tables multi-tenant (`user_id` + RLS) from the first migration.
- Magic-link email auth (passwordless).
- PWA: installable, offline-capable, syncs on reconnect.
- **Done when:** a note added on mobile appears on the PC and vice-versa.

### Phase 3 — History & search
- Scroll back through past days.
- Full-text search across all notes and actions.
- See an action's lineage (created on / completed on).

### Phase 4 — Open it up
- Onboarding polish for new users.
- Privacy notice and self-service account deletion (delete-my-data).
- Roll-forward tuning based on real use (e.g. auto-carry vs morning triage).

## 6. Proposed data model (Phase 2+)

```
users            (managed by Supabase auth)

notes
  id            uuid pk
  user_id       uuid  -> auth.users
  note_date     date
  content       text          -- markdown
  created_at    timestamptz
  updated_at    timestamptz

actions
  id            uuid pk
  user_id       uuid  -> auth.users
  title         text
  created_on    date
  completed_on  date null     -- null = still open, rolls forward
  created_at    timestamptz
  updated_at    timestamptz
```

Indexes on `(user_id, note_date)` and `(user_id, completed_on)` for the live-page assembly and history queries.

## 7. Auth & security

- **Row Level Security on every table**, enabled from the first migration. Policy pattern: a user may only select/insert/update/delete rows where `user_id = auth.uid()`. Security lives in the database, not the app code.
- Magic-link auth — no passwords to store or leak.
- `user_id` is non-nullable and set server-side / from the session, never trusted from the client.
- Even in Phase 1 (single user, local), design schemas as if multi-tenant so opening up is a switch, not a rewrite.

## 8. Privacy & compliance (before Phase 4)

- Other users' notes are personal data — a privacy notice and a working account-deletion path are required before opening up, not optional.
- Account deletion must remove all of a user's notes and actions.
- Document the lawful basis and data handling before inviting anyone.

## 9. Tech stack

- **Frontend:** React + Vite (existing familiarity), PWA.
- **Backend:** Supabase (Postgres, auth, RLS, real-time sync).
- **Hosting:** static host for the frontend; Supabase managed for data.
- **Offline:** service worker + local cache, reconcile on reconnect.

## 10. Open questions

- Roll-forward behaviour: auto-carry everything open, or a morning triage step? (Decide through use.)
- Conflict handling when the same record is edited offline on two devices.
- Whether notes need any light structure later (headings, simple lists) or stay pure freeform markdown.
- If/when to bridge actions to the task prioritiser, and in which direction.

## 11. Success criteria

- You stop reaching for paper or Obsidian for daily notes.
- Nothing falls through the cracks — open actions reliably resurface.
- Capture works as easily on the phone as on the PC.
- A second user can sign up, use it, and delete their account cleanly — with no access to anyone else's data.
