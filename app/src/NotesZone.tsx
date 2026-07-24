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

  // Freeze the value handed to CodeMirror the moment `date` changes, and
  // never update it again for that same date — including when `note`
  // changes because OUR OWN save just landed via Dexie's live query. If we
  // fed a continuously-live `note?.content` as the `value` prop instead,
  // resuming typing in the window between a debounced save completing and
  // its live-query echo re-rendering would force-apply that now-stale
  // content over whatever was typed since, silently deleting it. Combined
  // with `key={date}` below (a true remount on date change), this value is
  // only ever read once, at construction, for each day's editor instance.
  const lastDateRef = useRef(date)
  const initialContentRef = useRef(note?.content ?? '')
  if (lastDateRef.current !== date) {
    lastDateRef.current = date
    initialContentRef.current = note?.content ?? ''
  }

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
      saveTimer.current = window.setTimeout(flush, 200)
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

  useEffect(() => {
    // Flush immediately whenever the tab is about to be hidden or
    // unloaded — a flaky/switching network connection can cause the OS or
    // browser to suspend, discard, or reload the tab (captive-portal
    // checks stealing focus, battery/data-saver tab discarding, etc.).
    // Waiting on the debounce timer alone leaves a window where an
    // interruption mid-typing loses whatever hasn't been written yet.
    function flushNow() {
      if (saveTimer.current !== undefined) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = undefined
      }
      flush()
    }
    function onVisibilityChange() {
      if (document.hidden) flushNow()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', flushNow)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', flushNow)
    }
  }, [flush])

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
        // with that day's content as its true initial doc, matching
        // initialContentRef above.
        key={date}
        className="notes-editor"
        value={initialContentRef.current}
        theme="none"
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
