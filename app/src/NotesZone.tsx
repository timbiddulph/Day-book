import { useCallback, useEffect, useRef, useState } from 'react'
import CodeMirror, { type BasicSetupOptions } from '@uiw/react-codemirror'
import type { EditorView } from '@codemirror/view'
import { db, todayStr, type Note } from './db'
import { noteEditorExtensions } from './markdownEditor'
import { NotesToolbar } from './NotesToolbar'

interface NotesZoneProps {
  date: string
  note: Note | undefined
}

interface PendingSave {
  date: string
  note: Note | undefined
  content: string
}

// Module-level constant so this prop never changes identity across renders
// — @uiw/react-codemirror reconfigures the whole EditorView whenever
// `basicSetup` changes reference, which (done every render via an inline
// object) races with fast typing and drops/corrupts input.
const basicSetupOptions: BasicSetupOptions = {
  lineNumbers: false,
  foldGutter: false,
  highlightActiveLine: false,
}

let activeView: EditorView | undefined

export function NotesZone({ date, note }: NotesZoneProps) {
  const saveTimer = useRef<number | undefined>(undefined)
  const pending = useRef<PendingSave | null>(null)
  const latest = useRef({ date, note })
  latest.current = { date, note }
  // Re-render once the CodeMirror view exists so the toolbar can bind to it.
  const [view, setView] = useState<EditorView | undefined>(undefined)

  const flush = useCallback(async () => {
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
  }, [])

  const scheduleSave = useCallback(
    (content: string) => {
      pending.current = { ...latest.current, content }
      window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(flush, 400)
    },
    [flush],
  )

  useEffect(() => {
    return () => {
      // Flush any unsaved edit for the day being left — a shared debounce
      // timer must not let switching days drop a pending save.
      if (saveTimer.current !== undefined) {
        window.clearTimeout(saveTimer.current)
        flush()
      }
    }
  }, [date, flush])

  const handleCreateEditor = useCallback((createdView: EditorView) => {
    activeView = createdView
    setView(createdView)
  }, [])

  return (
    <section className="notes-zone">
      <h2>Notes</h2>
      <NotesToolbar view={view} />
      <CodeMirror
        // Remount on date change: each day gets a fresh EditorView created
        // with that day's content as its true initial doc. This sidesteps
        // @uiw/react-codemirror's value-sync-on-existing-view code path
        // entirely for resets, which is what let a stale `draft` collide
        // with a same-valued target and silently no-op a reset.
        key={date}
        className="notes-editor"
        value={note?.content ?? ''}
        extensions={noteEditorExtensions}
        basicSetup={basicSetupOptions}
        placeholder={
          date === todayStr()
            ? 'Freeform notes for today (markdown)... press / to focus quickly'
            : `Freeform notes for ${date} (markdown)...`
        }
        onChange={scheduleSave}
        onCreateEditor={handleCreateEditor}
      />
    </section>
  )
}

export function focusNotes() {
  activeView?.focus()
}
