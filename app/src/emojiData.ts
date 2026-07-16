export interface EmojiEntry {
  emoji: string
  name: string
  keywords: string[]
}

// A curated set, not the full Unicode catalog — kept small and app-relevant
// (work/notes keywords layered onto standard names) rather than pulling in
// a large emoji-data dependency.
export const emojiData: EmojiEntry[] = [
  // Reactions / smileys
  { emoji: '😀', name: 'grinning', keywords: ['happy', 'smile'] },
  { emoji: '😄', name: 'happy', keywords: ['smile', 'joy'] },
  { emoji: '😂', name: 'laughing', keywords: ['lol', 'joy', 'funny'] },
  { emoji: '🙂', name: 'slightly smiling', keywords: ['smile', 'ok'] },
  { emoji: '😉', name: 'wink', keywords: [] },
  { emoji: '😊', name: 'blush', keywords: ['happy', 'pleased'] },
  { emoji: '😍', name: 'heart eyes', keywords: ['love'] },
  { emoji: '🤔', name: 'thinking', keywords: ['hmm', 'consider'] },
  { emoji: '😐', name: 'neutral', keywords: ['meh'] },
  { emoji: '😕', name: 'confused', keywords: ['unsure'] },
  { emoji: '😟', name: 'worried', keywords: ['concerned'] },
  { emoji: '😢', name: 'crying', keywords: ['sad'] },
  { emoji: '😭', name: 'sobbing', keywords: ['sad', 'crying'] },
  { emoji: '😡', name: 'angry', keywords: ['mad', 'annoyed'] },
  { emoji: '😱', name: 'shocked', keywords: ['scared', 'omg'] },
  { emoji: '😴', name: 'sleeping', keywords: ['tired', 'zzz'] },
  { emoji: '🥳', name: 'party', keywords: ['celebrate', 'celebration'] },
  { emoji: '😎', name: 'cool', keywords: ['sunglasses'] },
  { emoji: '🙄', name: 'eye roll', keywords: ['annoyed', 'whatever'] },
  { emoji: '😬', name: 'grimace', keywords: ['awkward', 'yikes'] },

  // Gestures / people
  { emoji: '👍', name: 'thumbs up', keywords: ['yes', 'good', 'agree', 'approve'] },
  { emoji: '👎', name: 'thumbs down', keywords: ['no', 'bad', 'disagree'] },
  { emoji: '👏', name: 'clapping', keywords: ['applause', 'well done', 'nice'] },
  { emoji: '🙏', name: 'pray', keywords: ['thanks', 'please', 'thank you'] },
  { emoji: '🤝', name: 'handshake', keywords: ['deal', 'agreement', 'partner'] },
  { emoji: '✋', name: 'raised hand', keywords: ['stop', 'wait'] },
  { emoji: '👋', name: 'wave', keywords: ['hello', 'hi', 'bye'] },
  { emoji: '💪', name: 'muscle', keywords: ['strong', 'strength', 'effort'] },
  { emoji: '🤷', name: 'shrug', keywords: ['unsure', 'dunno', 'unknown'] },
  { emoji: '👀', name: 'eyes', keywords: ['look', 'watch', 'attention'] },
  { emoji: '🧠', name: 'brain', keywords: ['idea', 'smart', 'think'] },

  // Hearts / love
  { emoji: '❤️', name: 'heart', keywords: ['love'] },
  { emoji: '💔', name: 'broken heart', keywords: ['heartbreak'] },
  { emoji: '⭐', name: 'star', keywords: ['favorite', 'important'] },
  { emoji: '🔥', name: 'fire', keywords: ['hot', 'great', 'lit'] },
  { emoji: '💯', name: 'hundred', keywords: ['perfect', 'agree'] },
  { emoji: '✨', name: 'sparkles', keywords: ['shiny', 'new', 'magic'] },

  // Work / productivity
  { emoji: '✅', name: 'check', keywords: ['done', 'complete', 'todo', 'finished', 'yes'] },
  { emoji: '☑️', name: 'checkbox', keywords: ['done', 'todo'] },
  { emoji: '❌', name: 'cross', keywords: ['no', 'wrong', 'cancelled', 'fail'] },
  { emoji: '⚠️', name: 'warning', keywords: ['caution', 'alert', 'careful'] },
  { emoji: '🚨', name: 'alarm', keywords: ['urgent', 'emergency', 'important'] },
  { emoji: '⏰', name: 'alarm clock', keywords: ['reminder', 'time', 'deadline'] },
  { emoji: '⏳', name: 'hourglass', keywords: ['waiting', 'pending', 'time'] },
  { emoji: '📅', name: 'calendar', keywords: ['meeting', 'date', 'schedule', 'event'] },
  { emoji: '📆', name: 'tear-off calendar', keywords: ['date', 'schedule'] },
  { emoji: '📌', name: 'pin', keywords: ['pinned', 'important', 'note'] },
  { emoji: '📍', name: 'pin location', keywords: ['location', 'here'] },
  { emoji: '📝', name: 'memo', keywords: ['note', 'write', 'notes'] },
  { emoji: '📋', name: 'clipboard', keywords: ['list', 'todo', 'tasks'] },
  { emoji: '📞', name: 'phone', keywords: ['call', 'telephone'] },
  { emoji: '☎️', name: 'telephone', keywords: ['call', 'phone'] },
  { emoji: '📧', name: 'email', keywords: ['mail', 'message'] },
  { emoji: '✉️', name: 'envelope', keywords: ['email', 'mail', 'message'] },
  { emoji: '💬', name: 'speech bubble', keywords: ['chat', 'comment', 'talk'] },
  { emoji: '💡', name: 'idea', keywords: ['bulb', 'thought', 'insight'] },
  { emoji: '🎯', name: 'target', keywords: ['goal', 'focus', 'aim'] },
  { emoji: '🚀', name: 'rocket', keywords: ['ship', 'launch', 'deploy', 'fast'] },
  { emoji: '🐛', name: 'bug', keywords: ['issue', 'error', 'defect'] },
  { emoji: '🔧', name: 'wrench', keywords: ['fix', 'tool', 'repair'] },
  { emoji: '🔨', name: 'hammer', keywords: ['build', 'fix', 'tool'] },
  { emoji: '⚙️', name: 'gear', keywords: ['settings', 'config'] },
  { emoji: '🔒', name: 'lock', keywords: ['secure', 'private'] },
  { emoji: '🔑', name: 'key', keywords: ['password', 'access', 'important'] },
  { emoji: '💰', name: 'money bag', keywords: ['budget', 'cost', 'finance'] },
  { emoji: '💵', name: 'money', keywords: ['cash', 'payment', 'budget'] },
  { emoji: '📈', name: 'chart up', keywords: ['growth', 'increase', 'progress'] },
  { emoji: '📉', name: 'chart down', keywords: ['decline', 'decrease'] },
  { emoji: '📊', name: 'bar chart', keywords: ['stats', 'data', 'report'] },

  // Objects
  { emoji: '☕', name: 'coffee', keywords: ['cafe', 'espresso', 'morning', 'break'] },
  { emoji: '🍵', name: 'tea', keywords: ['drink'] },
  { emoji: '🍕', name: 'pizza', keywords: ['food', 'lunch'] },
  { emoji: '🍔', name: 'burger', keywords: ['food', 'lunch'] },
  { emoji: '🎉', name: 'party popper', keywords: ['celebrate', 'celebration', 'congrats'] },
  { emoji: '🎂', name: 'cake', keywords: ['birthday', 'celebration'] },
  { emoji: '🎁', name: 'gift', keywords: ['present'] },
  { emoji: '📦', name: 'package', keywords: ['box', 'delivery', 'shipping'] },
  { emoji: '💻', name: 'laptop', keywords: ['computer', 'work'] },
  { emoji: '🖥️', name: 'desktop', keywords: ['computer', 'monitor'] },
  { emoji: '📱', name: 'phone', keywords: ['mobile', 'cell'] },
  { emoji: '🏠', name: 'house', keywords: ['home'] },
  { emoji: '🏢', name: 'office building', keywords: ['work', 'office'] },
  { emoji: '🚗', name: 'car', keywords: ['drive', 'travel'] },
  { emoji: '✈️', name: 'airplane', keywords: ['flight', 'travel', 'trip'] },
  { emoji: '🗺️', name: 'map', keywords: ['travel', 'plan'] },

  // Weather / nature
  { emoji: '☀️', name: 'sun', keywords: ['sunny', 'weather'] },
  { emoji: '🌧️', name: 'rain', keywords: ['weather', 'rainy'] },
  { emoji: '⛅', name: 'cloud', keywords: ['weather', 'cloudy'] },
  { emoji: '❄️', name: 'snowflake', keywords: ['snow', 'cold', 'winter'] },

  // Symbols
  { emoji: '❓', name: 'question', keywords: ['unsure', 'ask'] },
  { emoji: '❗', name: 'exclamation', keywords: ['important', 'alert'] },
  { emoji: '➡️', name: 'right arrow', keywords: ['next', 'forward'] },
  { emoji: '🔁', name: 'repeat', keywords: ['recurring', 'again'] },
  { emoji: '🆕', name: 'new', keywords: [] },
  { emoji: '🔝', name: 'top', keywords: ['best', 'priority'] },
]

const DEFAULT_SUGGESTIONS = ['✅', '📅', '📞', '💡', '🐛', '🚀', '👍', '❤️', '🔥', '📝']

export function searchEmoji(query: string): EmojiEntry[] {
  const q = query.trim().toLowerCase()
  if (q === '') {
    return DEFAULT_SUGGESTIONS.map((emoji) => emojiData.find((e) => e.emoji === emoji)!).filter(
      Boolean,
    )
  }
  const starts: EmojiEntry[] = []
  const contains: EmojiEntry[] = []
  for (const entry of emojiData) {
    const haystacks = [entry.name, ...entry.keywords]
    if (haystacks.some((h) => h.startsWith(q))) {
      starts.push(entry)
    } else if (haystacks.some((h) => h.includes(q))) {
      contains.push(entry)
    }
  }
  return [...starts, ...contains]
}
