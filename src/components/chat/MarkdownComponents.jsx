import { memo } from 'react'
import { cn } from '@/lib/utils'
import { CodeBlock } from './CodeBlock'

// Memoized base components for better performance
const InlineCode = memo(({ className, children, ...props }) => (
  <code 
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
      className
    )} 
    {...props}
  >
    {children}
  </code>
))

const Paragraph = memo(({ children }) => (
  <p className="mb-4 last:mb-0">{children}</p>
))

const Link = memo(({ children, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
  >
    {children}
  </a>
))

const List = memo(({ ordered, children }) => {
  const className = "pl-4 mb-4 last:mb-0 space-y-2"
  return ordered ? (
    <ol className={cn(className, "list-decimal")}>{children}</ol>
  ) : (
    <ul className={cn(className, "list-disc")}>{children}</ul>
  )
})

const BlockQuote = memo(({ children }) => (
  <blockquote className="border-l-2 border-muted-foreground pl-4 italic mb-4 last:mb-0 text-muted-foreground">
    {children}
  </blockquote>
))

const Table = memo(({ children }) => (
  <div className="overflow-x-auto mb-4 last:mb-0 rounded-lg border">
    <table className="w-full border-collapse">
      {children}
    </table>
  </div>
))

const TableCell = memo(({ isHeader, children }) => {
  const Component = isHeader ? 'th' : 'td'
  return (
    <Component 
      className={cn(
        "border-b border-muted px-4 py-2",
        isHeader && "bg-muted font-medium text-left"
      )}
    >
      {children}
    </Component>
  )
})

// Add display names for debugging
InlineCode.displayName = 'InlineCode'
Paragraph.displayName = 'Paragraph'
Link.displayName = 'Link'
List.displayName = 'List'
BlockQuote.displayName = 'BlockQuote'
Table.displayName = 'Table'
TableCell.displayName = 'TableCell'

export const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    if (!inline && match) {
      return (
        <CodeBlock
          language={language}
          value={String(children).replace(/\n$/, '')}
          {...props}
        />
      )
    }

    return <InlineCode className={className} {...props}>{children}</InlineCode>
  },
  p: Paragraph,
  a: Link,
  ul: props => <List ordered={false} {...props} />,
  ol: props => <List ordered={true} {...props} />,
  blockquote: BlockQuote,
  table: Table,
  th: props => <TableCell isHeader={true} {...props} />,
  td: props => <TableCell isHeader={false} {...props} />,
} 