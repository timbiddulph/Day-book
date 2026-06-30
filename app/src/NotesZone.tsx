import { useEffect, useRef, useState } from 'react'
import { db, todayStr, type Note } from './db'

interface NotesZoneProps {
  date: string
  note: Note | undefined
}

interface PendingSave {
  date: string
  note: Note | undefined
  content: string
}

export function NotesZone({ date, note }: NotesZoneProps) {
  const [draft, setDraft] = useState(note?.content ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<number | undefined>(undefined)
  const pending = useRef<PendingSave | null>(null)

  useEffect(() => {
    setDraft(note?.content ?? '')
    return () => {
      // Flush any unsaved edit for the day being left — a shared debounce
      // timer must not let switching days drop a pending save.
      if (saveTimer.current !== undefined) {
        window.clearTimeout(saveTimer.current)
        flush()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  function scheduleSave(content: string) {
    setDraft(content)
    pending.current = { date, note, content }
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(flush, 400)
  }

  async function flush() {
    const p = pending.current
    if (!p) return
    pending.current = null
    const now = Date.now()
    if (p.note) {
      await db.notes.update(p.note.id, { content: p.content, updatedAt: now })
    } else if (p.content.trim() !== '') {
      await db.notes.add({
        id: undefined as unknown as number,
        noteDate: p.date,
        content: p.content,
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
        placeholder={
          date === todayStr()
            ? 'Freeform notes for today (markdown)... press / to focus quickly'
            : `Freeform notes for ${date} (markdown)...`
        }
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
