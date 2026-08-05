"use client";

/**
 * Rich Text Editor — Wedabime Pramukayo CMS
 * Wraps @mdxeditor/editor for blog content editing
 * Outputs HTML (not MDX) since blog posts store HTML content
 */

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  codeBlockPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertCodeBlock,
  InsertThematicBreak,
  StrikeThroughSupSubToggles,
  CodeToggle,
  UndoRedo,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useRef, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Convert HTML to a markdown-like format that MDXEditor can parse
 */
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  
  let md = html;
  
  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
  
  // Bold and italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  
  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  
  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");
  
  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    return content.trim().split("\n").map((line: string) => `> ${line}`).join("\n") + "\n\n";
  });
  
  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, (match, code) => {
    const decoded = code.replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    return `\`\`\`\n${decoded}\n\`\`\`\n\n`;
  });
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  
  // Unordered lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gis, "$1\n");
  
  // Ordered lists
  md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let index = 0;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, item) => {
      index++;
      return `${index}. ${item}\n`;
    }) + "\n";
  });
  
  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  
  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");
  
  // Decode HTML entities
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");
  
  // Clean up excessive whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  
  return md.trim();
}

/**
 * Convert markdown (from MDXEditor) to HTML for storage
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown;
  
  // Code blocks (must be processed first before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const langAttr = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${langAttr}>${escaped.trim()}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  
  // Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Headings
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");
  
  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr />");
  
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((<li>.*<\/li>\n?)+)/g, (match) => `<ul>${match}</ul>`);
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  
  // Paragraphs - wrap remaining text blocks
  const lines = html.split("\n");
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      processedLines.push("");
      continue;
    }
    // Skip lines that are already HTML
    if (
      line.startsWith("<h") ||
      line.startsWith("<ul") ||
      line.startsWith("<ol") ||
      line.startsWith("<li") ||
      line.startsWith("<blockquote") ||
      line.startsWith("<pre") ||
      line.startsWith("<code") ||
      line.startsWith("<img") ||
      line.startsWith("<hr") ||
      line.startsWith("</")
    ) {
      processedLines.push(line);
    } else {
      processedLines.push(`<p>${line}</p>`);
    }
  }
  
  html = processedLines.join("\n");
  
  // Clean up excessive whitespace
  html = html.replace(/\n{3,}/g, "\n\n");
  
  return html.trim();
}

export function RichTextEditor({ value, onChange, placeholder, readOnly }: RichTextEditorProps) {
  const ref = useRef<MDXEditorMethods>(null);
  const isInternalUpdate = useRef(false);

  // Set initial content when value changes externally
  useEffect(() => {
    if (ref.current && value && !isInternalUpdate.current) {
      const markdown = htmlToMarkdown(value);
      ref.current.setMarkdown(markdown);
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleChange = useCallback(() => {
    if (ref.current && onChange) {
      isInternalUpdate.current = true;
      const markdown = ref.current.getMarkdown();
      const html = markdownToHtml(markdown);
      onChange(html);
    }
  }, [onChange]);

  return (
    <div className="rich-text-editor-wrapper border border-brand-emerald/20 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-emerald/30 focus-within:border-brand-emerald/40">
      <MDXEditor
        ref={ref}
        markdown={htmlToMarkdown(value || "")}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder || "Start writing your blog post..."}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageAutocompleteSuggestions: [],
          }),
          codeBlockPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <StrikeThroughSupSubToggles />
                <CodeToggle />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <InsertImage />
                <InsertCodeBlock />
                <InsertThematicBreak />
              </>
            ),
          }),
        ]}
        contentEditableClassName="prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none"
      />
    </div>
  );
}

export default RichTextEditor;
