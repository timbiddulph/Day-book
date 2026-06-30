import { useEffect, useState } from 'react'
import './App.css'
import { parseLocalDate, shiftDate, todayStr } from './db'
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
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const page = useDayPage(selectedDate)

  function goPrev() {
    setSelectedDate((d) => shiftDate(d, -1))
  }

  function goNext() {
    setSelectedDate((d) => (d === todayStr() ? d : shiftDate(d, 1)))
  }

  function goToday() {
    setSelectedDate(todayStr())
  }

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
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!page) return null

  const isToday = page.isToday

  return (
    <div className="daybook">
      <header className="daybook-header">
        <h1>{dateFormatter.format(parseLocalDate(page.date))}</h1>
        <div className="day-nav">
          <button type="button" onClick={goPrev} aria-label="Previous day">
            ←
          </button>
          <input
            type="date"
            className="day-nav-picker"
            value={selectedDate}
            max={todayStr()}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          />
          <button type="button" onClick={goNext} disabled={isToday} aria-label="Next day">
            →
          </button>
          {!isToday && (
            <button type="button" className="day-nav-today" onClick={goToday}>
              Today
            </button>
          )}
        </div>
      </header>
      <main className="daybook-body">
        <NotesZone date={page.date} note={page.note} />
        <ActionsZone
          openActions={page.openActions}
          completedActions={page.completedActions}
          isToday={isToday}
        />
      </main>
      <footer className="daybook-hints">
        <span>
          <kbd>n</kbd> notes &nbsp; <kbd>a</kbd> add action &nbsp; <kbd>←</kbd>/<kbd>→</kbd> change day
        </span>
      </footer>
    </div>
  )
}

export default App
