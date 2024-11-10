import React from 'react';
import { cn } from '@/lib/utils';
import CodeBlock from './CodeBlock';

export const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (!inline && match) {
      return (
        <CodeBlock
          language={language}
          value={String(children).replace(/\n$/, '')}
          {...props}
        />
      );
    }

    return (
      <code className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )} {...props}>
        {children}
      </code>
    );
  },
  p({ children }) {
    return <p className="mb-4 last:mb-0">{children}</p>;
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    );
  },
  ul({ children }) {
    return <ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-4 mb-4 last:mb-0">{children}</ol>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-muted-foreground pl-4 italic mb-4 last:mb-0">
        {children}
      </blockquote>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto mb-4 last:mb-0">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-muted-foreground px-4 py-2 text-left">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="border border-muted-foreground px-4 py-2">
        {children}
      </td>
    );
  },
}; 