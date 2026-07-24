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

// Each date gets its own SaveContext object rather than sharing one
// mutable ref across dates. This matters because the actual DB write is
// deferred (chained onto a promise, so a slow write can't cause a second
// save to race ahead and create a duplicate note — see `flush` below).
// Since that write only runs as a microtask, by the time it executes,
// React may already have synchronously processed a date change and reset
// tracking for the new date. Giving each date its own object means a
// pending save captured a direct reference to the OLD date's context, so
// it keeps working with the OLD note id regardless of what the new date's
// setup does afterward — the two dates can never clobber each other.
interface SaveContext {
  noteId: number | undefined
  chain: Promise<void>
}

function createSaveContext(note: Note | undefined): SaveContext {
  return { noteId: note?.id, chain: Promise.resolve() }
}

interface PendingSave {
  ctx: SaveContext
  date: string
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
  const dateRef = useRef(date)
  dateRef.current = date
  // Re-render once the CodeMirror view exists so the toolbar can bind to it.
  const [view, setView] = useState<EditorView | undefined>(undefined)

  // Freeze the value handed to CodeMirror the moment `date` changes, and
  // never update it again for that same date — including when `note`
  // changes because our own save just landed via Dexie's live query. If we
  // fed a continuously-live `note?.content` as the `value` prop instead,
  // resuming typing in the window between a save completing and its
  // live-query echo re-rendering would force-apply that now-stale content
  // over whatever was typed since, silently deleting it.
  const lastDateRef = useRef(date)
  const initialContentRef = useRef(note?.content ?? '')
  if (lastDateRef.current !== date) {
    lastDateRef.current = date
    initialContentRef.current = note?.content ?? ''
  }

  const contextRef = useRef<SaveContext>(createSaveContext(note))

  const flush = useCallback(() => {
    const p = pending.current
    if (!p) return p
    pending.current = null
    const ctx = p.ctx
    ctx.chain = ctx.chain.then(async () => {
      const now = Date.now()
      if (ctx.noteId !== undefined) {
        await db.notes.update(ctx.noteId, { content: p.content, updatedAt: now })
      } else if (p.content.trim() !== '') {
        ctx.noteId = await db.notes.add({
          id: undefined as unknown as number,
          noteDate: p.date,
          content: p.content,
          createdAt: now,
          updatedAt: now,
        })
      }
    })
  }, [])

  const scheduleSave = useCallback(
    (content: string) => {
      pending.current = { ctx: contextRef.current, date: dateRef.current, content }
      window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(flush, 200)
    },
    [flush],
  )

  useEffect(() => {
    return () => {
      // Flush any unsaved edit for the day being left — a shared debounce
      // timer must not let switching days drop a pending save. This reads
      // `pending.current.ctx`, a direct reference to the OLD date's
      // context object, so it's unaffected by the new date's setup below
      // creating a separate, fresh object.
      if (saveTimer.current !== undefined) {
        window.clearTimeout(saveTimer.current)
        flush()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, flush])

  useEffect(() => {
    // Runs after the previous date's cleanup above has already flushed
    // using the outgoing day's context — only now is it safe to start a
    // fresh context for the new day.
    contextRef.current = createSaveContext(note)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

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
