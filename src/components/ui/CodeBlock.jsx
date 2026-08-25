import { useMemo } from 'react'
import { cn } from '../../utils/cn.js'
import { IconButton } from './Button.jsx'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js'

/**
 * Minimal syntax highlighter.
 *
 * A full highlighting library would be the single largest dependency on the
 * site for a handful of JSON snippets, so this tokenises with one regex and
 * renders React nodes — no dangerouslySetInnerHTML, nothing to escape.
 */
const TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null|const|await|fetch|return|async|function|from|import)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\/\/[^\n]*)|([{}[\],:;()])/g

const tokenClass = {
  key: 'text-accent2',
  string: 'text-accent',
  keyword: 'text-accent2',
  number: 'text-warn',
  comment: 'text-subtle italic',
  punctuation: 'text-subtle',
  plain: 'text-fg',
}

function tokenise(source) {
  const tokens = []
  let lastIndex = 0

  for (const match of source.matchAll(TOKEN_PATTERN)) {
    const [raw, quoted, colon, keyword, number, comment, punctuation] = match

    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: source.slice(lastIndex, match.index) })
    }

    if (quoted !== undefined) {
      // A quoted string followed by ':' is an object key.
      tokens.push({ type: colon ? 'key' : 'string', value: quoted })
      if (colon) tokens.push({ type: 'punctuation', value: colon })
    } else if (keyword !== undefined) {
      tokens.push({ type: 'keyword', value: keyword })
    } else if (number !== undefined) {
      tokens.push({ type: 'number', value: number })
    } else if (comment !== undefined) {
      tokens.push({ type: 'comment', value: comment })
    } else if (punctuation !== undefined) {
      tokens.push({ type: 'punctuation', value: punctuation })
    }

    lastIndex = match.index + raw.length
  }

  if (lastIndex < source.length) {
    tokens.push({ type: 'plain', value: source.slice(lastIndex) })
  }

  return tokens
}

/**
 * Code / JSON display panel with an optional filename chrome bar and a copy
 * button that reports success rather than assuming it.
 */
export function CodeBlock({
  code = '',
  filename,
  language = 'json',
  copyable = true,
  maxHeight = '22rem',
  className,
  bare = false,
}) {
  const tokens = useMemo(() => tokenise(code), [code])
  const { copy, copied, error } = useCopyToClipboard()

  const pre = (
    <pre
      className={cn(
        'scrollbar-thin overflow-auto px-4 py-3.5 font-mono text-[0.78125rem] leading-[1.65]',
        bare && 'px-0 py-0',
      )}
      style={{ maxHeight }}
      tabIndex={0}
      aria-label={filename ? `${language} snippet: ${filename}` : `${language} snippet`}
    >
      <code>
        {tokens.map((token, index) => (
          <span key={index} className={tokenClass[token.type]}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )

  if (bare) return <div className={className}>{pre}</div>

  return (
    <div className={cn('overflow-hidden rounded-inset border border-line bg-sunken', className)}>
      {(filename || copyable) && (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-elevated/60 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-line-strong" />
              <span className="size-2 rounded-full bg-line-strong" />
              <span className="size-2 rounded-full bg-line-strong" />
            </span>
            {filename ? (
              <span className="truncate-safe font-mono text-[0.6875rem] text-subtle">{filename}</span>
            ) : null}
          </div>

          {copyable ? (
            <IconButton
              size="icon-sm"
              label={copied ? 'Copied' : 'Copy to clipboard'}
              icon={copied ? 'check' : 'copy'}
              onClick={() => copy(code)}
              className={cn('shrink-0', copied && 'text-accent')}
            />
          ) : null}
        </div>
      )}

      {pre}

      {error ? (
        <p role="status" className="border-t border-line px-4 py-2 text-xs text-warn">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default CodeBlock
