import { useEffect, useRef, useState } from 'react'
import { db, todayStr, type Note } from './db'

interface NotesZoneProps {
  note: Note | undefined
}

export function NotesZone({ note }: NotesZoneProps) {
  const [draft, setDraft] = useState(note?.content ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setDraft(note?.content ?? '')
  }, [note?.id])

  function scheduleSave(content: string) {
    setDraft(content)
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => save(content), 400)
  }

  async function save(content: string) {
    const now = Date.now()
    if (note) {
      await db.notes.update(note.id, { content, updatedAt: now })
    } else if (content.trim() !== '') {
      await db.notes.add({
        id: undefined as unknown as number,
        noteDate: todayStr(),
        content,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  return (
    <section className="notes-zone">
      <h2>Notes</h2>
      <textarea
        ref={textareaRef}
        className="notes-textarea"
        placeholder="Freeform notes for today (markdown)... press / to focus quickly"
        value={draft}
        onChange={(e) => scheduleSave(e.target.value)}
      />
    </section>
  )
}

export function focusNotes() {
  const el = document.querySelector<HTMLTextAreaElement>('.notes-textarea')
  el?.focus()
}
