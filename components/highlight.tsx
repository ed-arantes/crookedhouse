type PhraseConfig = string | { phrase: string; className?: string }

export function Highlight({
 text,
 phrases,
 className = 'font-semibold',
}: {
 text: string
 phrases: PhraseConfig[]
 className?: string
}) {
 const phraseStrings = phrases.map((p) => (typeof p === 'string' ? p : p.phrase))
 const escaped = phraseStrings.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
 const pattern = '(' + escaped.join('|') + ')'
 const regex = new RegExp(pattern, 'g')
 const parts = text.split(regex)

 const classMap = new Map<string, string>()
 for (const p of phrases) {
  if (typeof p === 'string') {
   classMap.set(p, className)
  } else {
   classMap.set(p.phrase, p.className ?? className)
  }
 }

 return (
  <>
   {parts.map((part, i) => {
    if (classMap.has(part)) {
     return (
      <strong key={i} className={classMap.get(part)}>
       {part}
      </strong>
     )
    }
    return <span key={i}>{part}</span>
   })}
  </>
 )
}
