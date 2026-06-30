import { useLiveQuery } from 'dexie-react-hooks'
import { db, todayStr, type Action, type Note } from './db'

export interface DayPage {
  date: string
  isToday: boolean
  note: Note | undefined
  openActions: Action[]
  completedActions: Action[]
}

export function useDayPage(viewedDate: string): DayPage | undefined {
  return useLiveQuery(async () => {
    const isToday = viewedDate === todayStr()

    const note = await db.notes.where('noteDate').equals(viewedDate).first()

    const allActions = await db.actions.toArray()
    const openActions = isToday
      ? allActions
          .filter((a) => a.completedOn === null)
          .sort((a, b) => a.createdOn.localeCompare(b.createdOn))
      : []
    const completedActions = allActions
      .filter((a) => a.completedOn === viewedDate)
      .sort((a, b) => a.createdAt - b.createdAt)

    return { date: viewedDate, isToday, note, openActions, completedActions }
  }, [viewedDate])
}
