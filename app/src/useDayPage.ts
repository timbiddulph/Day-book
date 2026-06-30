import { useLiveQuery } from 'dexie-react-hooks'
import { db, todayStr, type Action, type Note } from './db'

export interface DayPage {
  today: string
  note: Note | undefined
  openActions: Action[]
  completedTodayActions: Action[]
}

export function useDayPage(): DayPage | undefined {
  return useLiveQuery(async () => {
    const today = todayStr()

    const note = await db.notes.where('noteDate').equals(today).first()

    const allActions = await db.actions.toArray()
    const openActions = allActions
      .filter((a) => a.completedOn === null)
      .sort((a, b) => a.createdOn.localeCompare(b.createdOn))
    const completedTodayActions = allActions
      .filter((a) => a.completedOn === today)
      .sort((a, b) => a.createdAt - b.createdAt)

    return { today, note, openActions, completedTodayActions }
  }, [])
}
