import type { EditorView } from '@codemirror/view'
import { editorCommands } from './markdownEditor'

interface NotesToolbarProps {
  view: EditorView | undefined
}

const buttons: Array<{ label: string; title: string; command: keyof typeof editorCommands }> = [
  { label: 'B', title: 'Bold', command: 'bold' },
  { label: 'I', title: 'Italic', command: 'italic' },
  { label: 'H', title: 'Heading', command: 'heading' },
  { label: '“ ”', title: 'Quote', command: 'quote' },
  { label: '•', title: 'List', command: 'list' },
  { label: '</>', title: 'Code', command: 'code' },
  { label: '🔗', title: 'Link', command: 'link' },
  { label: '§', title: 'New section', command: 'section' },
]

export function NotesToolbar({ view }: NotesToolbarProps) {
  return (
    <div className="notes-toolbar">
      {buttons.map(({ label, title, command }) => (
        <button
          key={command}
          type="button"
          title={title}
          disabled={!view}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => view && editorCommands[command](view)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
