import { useEffect } from 'react'
import './App.css'
import { useDayPage } from './useDayPage'
import { NotesZone, focusNotes } from './NotesZone'
import { ActionsZone, focusActionInput } from './ActionsZone'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function App() {
  const page = useDayPage()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (isTyping) return

      if (e.key === 'n') {
        e.preventDefault()
        focusNotes()
      } else if (e.key === 'a') {
        e.preventDefault()
        focusActionInput()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!page) return null

  return (
    <div className="daybook">
      <header className="daybook-header">
        <h1>{dateFormatter.format(new Date())}</h1>
      </header>
      <main className="daybook-body">
        <NotesZone note={page.note} />
        <ActionsZone
          openActions={page.openActions}
          completedTodayActions={page.completedTodayActions}
        />
      </main>
      <footer className="daybook-hints">
        <span>
          <kbd>n</kbd> notes &nbsp; <kbd>a</kbd> add action
        </span>
      </footer>
    </div>
  )
}

export default App
