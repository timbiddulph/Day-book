import Dexie, { type EntityTable } from 'dexie'

export interface Note {
  id: number
  noteDate: string // YYYY-MM-DD
  content: string
  createdAt: number
  updatedAt: number
}

export interface Action {
  id: number
  title: string
  createdOn: string // YYYY-MM-DD
  completedOn: string | null // null = still open, rolls forward
  createdAt: number
  updatedAt: number
}

export const db = new Dexie('daybook') as Dexie & {
  notes: EntityTable<Note, 'id'>
  actions: EntityTable<Action, 'id'>
}

db.version(1).stores({
  notes: '++id, noteDate',
  actions: '++id, createdOn, completedOn',
})

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}
