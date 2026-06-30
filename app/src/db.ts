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

function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr(): string {
  return formatLocalDate(new Date())
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function shiftDate(dateStr: string, deltaDays: number): string {
  const d = parseLocalDate(dateStr)
  d.setDate(d.getDate() + deltaDays)
  return formatLocalDate(d)
}
