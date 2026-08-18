import { type ReactNode } from 'react'

export function RichText({
  text,
  className = 'font-semibold',
}: {
  text: string
  className?: string
}): ReactNode {
  const regex = /\*\*(.+?)\*\*/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    parts.push(
      <strong key={`b${match.index}`} className={className}>
        {match[1]}
      </strong>,
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}

export function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}
