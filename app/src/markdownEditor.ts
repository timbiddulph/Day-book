import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { tags as t } from '@lezer/highlight'

const bearHighlightStyle = HighlightStyle.define([
  { tag: t.heading1, fontSize: '1.6em', fontWeight: '700' },
  { tag: t.heading2, fontSize: '1.35em', fontWeight: '700' },
  { tag: t.heading3, fontSize: '1.15em', fontWeight: '700' },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  {
    tag: t.monospace,
    fontFamily: 'ui-monospace, Consolas, monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  { tag: t.quote, opacity: '0.75', fontStyle: 'italic' },
  { tag: t.link, color: '#2563eb', textDecoration: 'underline' },
  {
    tag: t.contentSeparator,
    display: 'inline-block',
    width: '100%',
    borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
    lineHeight: '0',
    color: 'transparent',
  },
  // Every markdown delimiter (**, #, _, `, >, -, [ ]) is tagged this way by
  // @lezer/markdown, distinct from the content it wraps — dimming it here is
  // the entire "Bear style" live-rendering effect.
  { tag: t.processingInstruction, opacity: '0.35', fontSize: '0.9em' },
])

const bearTheme = EditorView.theme({
  '&': { fontSize: '1rem', backgroundColor: 'transparent' },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': { fontFamily: 'inherit', lineHeight: '1.5', padding: 0 },
  '.cm-scroller': { fontFamily: 'inherit' },
  '.cm-line': { padding: 0 },
})

export const noteEditorExtensions = [
  markdown(),
  syntaxHighlighting(bearHighlightStyle),
  bearTheme,
  EditorView.lineWrapping,
]

function wrapSelection(view: EditorView, mark: string) {
  view.dispatch(
    view.state.changeByRange((range) => {
      const selected = view.state.sliceDoc(range.from, range.to)
      const changes = [
        { from: range.from, insert: mark },
        { from: range.to, insert: mark },
      ]
      const newFrom = range.from + mark.length
      const newTo = newFrom + selected.length
      return { changes, range: EditorSelection.range(newFrom, newTo) }
    }),
  )
  view.focus()
}

function toggleLinePrefix(view: EditorView, prefix: string) {
  view.dispatch(
    view.state.changeByRange((range) => {
      const line = view.state.doc.lineAt(range.from)
      const hasPrefix = line.text.startsWith(prefix)
      const changes = hasPrefix
        ? { from: line.from, to: line.from + prefix.length, insert: '' }
        : { from: line.from, insert: prefix }
      const delta = hasPrefix ? -prefix.length : prefix.length
      return { changes, range: EditorSelection.range(range.from + delta, range.to + delta) }
    }),
  )
  view.focus()
}

function insertLink(view: EditorView) {
  view.dispatch(
    view.state.changeByRange((range) => {
      const selected = view.state.sliceDoc(range.from, range.to) || 'link text'
      const insert = `[${selected}](url)`
      const urlStart = range.from + 1 + selected.length + 2
      return {
        changes: { from: range.from, to: range.to, insert },
        range: EditorSelection.range(urlStart, urlStart + 3),
      }
    }),
  )
  view.focus()
}

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function insertSection(view: EditorView) {
  const insertText = `\n\n---\n\n## ${formatTime(new Date())} — \n`
  view.dispatch(
    view.state.changeByRange((range) => {
      const from = range.to
      const dashOffset = insertText.indexOf('— ') + 2
      return {
        changes: { from, insert: insertText },
        range: EditorSelection.cursor(from + dashOffset),
      }
    }),
  )
  view.focus()
}

export const editorCommands = {
  bold: (view: EditorView) => wrapSelection(view, '**'),
  italic: (view: EditorView) => wrapSelection(view, '_'),
  code: (view: EditorView) => wrapSelection(view, '`'),
  heading: (view: EditorView) => toggleLinePrefix(view, '## '),
  quote: (view: EditorView) => toggleLinePrefix(view, '> '),
  list: (view: EditorView) => toggleLinePrefix(view, '- '),
  link: (view: EditorView) => insertLink(view),
  section: (view: EditorView) => insertSection(view),
}

export type EditorCommands = typeof editorCommands
