import { type ReactNode } from 'react'

function isSafeHref(href: string): boolean {
  if ((href.startsWith('/') && !href.startsWith('//')) || href.startsWith('#')) return true

  try {
    const protocol = new URL(href).protocol
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:'
  } catch {
    return false
  }
}

export function RichText({
  text,
  className = 'font-semibold',
}: {
  text: string
  className?: string
}): ReactNode {
  return <>{renderInline(text, className)}</>
}

function renderInline(text: string, className: string): ReactNode[] {
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`b${match.index}`} className={className}>
          {renderInline(match[1], className)}
        </strong>,
      )
    } else {
      const label = match[2]
      const href = match[3].trim()

      parts.push(isSafeHref(href)
        ? (
          <a
            key={`l${match.index}`}
            href={href}
            className="underline underline-offset-2"
            {...(/^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>
        )
        : <span key={`t${match.index}`}>{match[0]}</span>        )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }
  return parts
}

export function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}
