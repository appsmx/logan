"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function MarkdownView({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-foreground/90 space-y-4",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-3xl tracking-tight font-normal mt-2 mb-1 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-xl mt-6 mb-1 font-normal text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-sans text-base mt-4 mb-1 font-semibold text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-foreground/90">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 text-foreground/90 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 text-foreground/90 marker:text-primary">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary pl-4 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="rounded-md border bg-muted/60 p-3 text-xs font-mono overflow-x-auto logan-scroll">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-border my-4" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
