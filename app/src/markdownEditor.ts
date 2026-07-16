import { EditorSelection, RangeSetBuilder } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate, WidgetType } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting, syntaxTree } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { tags as t } from '@lezer/highlight'
import type { SyntaxNode } from '@lezer/common'

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
  // Force our own dark text color rather than relying on inheritance —
  // CodeMirror's content area otherwise ends up light/washed-out looking
  // on some mobile browsers.
  '.cm-content': {
    fontFamily: 'inherit',
    lineHeight: '1.5',
    padding: 0,
    color: 'var(--text-h)',
    caretColor: 'var(--text-h)',
  },
  '.cm-scroller': { fontFamily: 'inherit' },
  '.cm-line': { padding: 0 },
  // CodeMirror's default placeholder color (#888) is too low-contrast.
  '.cm-placeholder': { color: 'var(--text)', opacity: '0.5' },
  // Hanging indent for list lines: padding shifts the whole line right,
  // negative text-indent pulls just the first visual line (bullet/number)
  // back so wrapped continuation text aligns under the item's own text,
  // not under the bullet.
  '.cm-list-line': { textIndent: '-1.4em' },
  '.cm-bullet-dot': { opacity: '0.55', marginRight: '0.1em' },
  // Two-class specificity so this reliably beats the single-class
  // tag-based dimming rule regardless of stylesheet injection order.
  '.cm-line .cm-ordered-mark': { opacity: '0.7 !important' },
})

const LIST_INDENT_EM = 1.4

class BulletWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-bullet-dot'
    span.textContent = '•'
    return span
  }
  eq() {
    return true
  }
}

function listNestingDepth(listItem: SyntaxNode): number {
  let depth = 0
  let node: SyntaxNode | null = listItem
  while (node) {
    if (node.name === 'BulletList' || node.name === 'OrderedList') depth++
    node = node.parent
  }
  return depth
}

function buildListDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const seenLines = new Set<number>()
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name !== 'ListMark') return
        const listItem = node.node.parent
        const list = listItem?.parent
        if (!listItem || !list) return

        const line = view.state.doc.lineAt(node.from)
        if (!seenLines.has(line.number)) {
          seenLines.add(line.number)
          const depth = listNestingDepth(list)
          builder.add(
            line.from,
            line.from,
            Decoration.line({
              class: 'cm-list-line',
              attributes: { style: `padding-left: ${depth * LIST_INDENT_EM}em` },
            }),
          )
        }

        if (list.name === 'BulletList') {
          builder.add(node.from, node.to, Decoration.replace({ widget: new BulletWidget() }))
        } else if (list.name === 'OrderedList') {
          builder.add(node.from, node.to, Decoration.mark({ class: 'cm-ordered-mark' }))
        }
      },
    })
  }
  return builder.finish()
}

const listDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildListDecorations(view)
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildListDecorations(update.view)
      }
    }
  },
  { decorations: (v) => v.decorations },
)

export const noteEditorExtensions = [
  markdown(),
  syntaxHighlighting(bearHighlightStyle),
  bearTheme,
  listDecorations,
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
