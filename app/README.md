# Daybook

Phase 1 of the Daybook PRD (`../PRD.md`): a local-only, single-user proof of concept.

- Today's page is assembled live: today's note + every open action (regardless of when it was created) + actions completed today.
- Completing an action sets `completedOn`; leaving it open means it keeps rolling forward to every new day automatically.
- All data lives in IndexedDB (via Dexie) — no backend, no auth.

## Run

```bash
npm install
npm run dev
```

## Keyboard

- `n` — focus the notes textarea
- `a` — focus the add-action input
- `Enter` in the action input adds it to today's checklist
