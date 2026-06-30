import { useState, type FormEvent } from 'react'
import { db, todayStr, type Action } from './db'

interface ActionsZoneProps {
  openActions: Action[]
  completedTodayActions: Action[]
}

export function ActionsZone({ openActions, completedTodayActions }: ActionsZoneProps) {
  const [draft, setDraft] = useState('')

  async function addAction(e: FormEvent) {
    e.preventDefault()
    const title = draft.trim()
    if (title === '') return
    const now = Date.now()
    await db.actions.add({
      id: undefined as unknown as number,
      title,
      createdOn: todayStr(),
      completedOn: null,
      createdAt: now,
      updatedAt: now,
    })
    setDraft('')
  }

  async function complete(action: Action) {
    await db.actions.update(action.id, {
      completedOn: todayStr(),
      updatedAt: Date.now(),
    })
  }

  async function reopen(action: Action) {
    await db.actions.update(action.id, {
      completedOn: null,
      updatedAt: Date.now(),
    })
  }

  return (
    <section className="actions-zone">
      <h2>Actions</h2>
      <form className="action-quick-add" onSubmit={addAction}>
        <input
          className="action-input"
          type="text"
          placeholder="Add an action and press Enter..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </form>
      <ul className="action-list">
        {openActions.map((action) => (
          <li key={action.id} className="action-item">
            <label>
              <input
                type="checkbox"
                checked={false}
                onChange={() => complete(action)}
              />
              <span>{action.title}</span>
            </label>
            {action.createdOn !== todayStr() && (
              <span className="action-rolled-from">since {action.createdOn}</span>
            )}
          </li>
        ))}
        {openActions.length === 0 && (
          <li className="action-empty">Nothing open. Add one above.</li>
        )}
      </ul>

      {completedTodayActions.length > 0 && (
        <>
          <h3>Completed today</h3>
          <ul className="action-list action-list-done">
            {completedTodayActions.map((action) => (
              <li key={action.id} className="action-item action-item-done">
                <label>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => reopen(action)}
                  />
                  <span>{action.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export function focusActionInput() {
  const el = document.querySelector<HTMLInputElement>('.action-input')
  el?.focus()
}
