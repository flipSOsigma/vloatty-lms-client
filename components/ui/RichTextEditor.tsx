"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Eraser
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your lesson content here..."
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [editorLanguage, setEditorLanguage] = useState("javascript");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync initial value only once or when it changes externally
  useEffect(() => {
    if (!editorRef.current || !isMounted) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isMounted]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Helper to insert Discord-style pre/code block container
  const insertCodeBlockContainer = (lang: string = editorLanguage) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const codeHtml = `<pre class="bg-zinc-900 text-emerald-450 p-4 rounded-xl font-mono text-[12.5px] my-3 overflow-x-auto whitespace-pre block select-text border border-zinc-800" data-lang="${lang}"><div class="text-[10px] text-zinc-500 uppercase tracking-widest font-bold border-b border-zinc-850 pb-1 mb-2 select-none">${lang}</div><code class="language-${lang}">// Write your ${lang} code here</code></pre><p><br></p>`;

    const sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      try {
        let range = sel.getRangeAt(0);
        
        // If range is inside our editor, insert it there
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          
          const el = document.createElement("div");
          el.innerHTML = codeHtml;
          const frag = document.createDocumentFragment();
          let node;
          let lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          
          range.insertNode(frag);
          
          if (lastNode) {
            range = range.cloneRange();
            const prevEl = lastNode.previousSibling as HTMLElement | null;
            const lastEl = lastNode as HTMLElement;
            const codeElement = (prevEl?.querySelector ? prevEl.querySelector("code") : null) || 
                                (lastEl?.querySelector ? lastEl.querySelector("code") : null);
            if (codeElement) {
              range.selectNodeContents(codeElement);
              range.collapse(false); // Move cursor to the end
            } else {
              range.setStartAfter(lastNode);
              range.collapse(true);
            }
            sel.removeAllRanges();
            sel.addRange(range);
          }
          
          onChange(editorRef.current.innerHTML);
          return;
        }
      } catch (err) {
        console.error("Failed to insert at cursor range:", err);
      }
    }

    // Fallback: append to end
    editorRef.current.innerHTML += codeHtml;
    onChange(editorRef.current.innerHTML);
  };

  // Keyboard Shortcuts & Markdown triggers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        executeCommand("bold");
      } else if (key === "i") {
        e.preventDefault();
        executeCommand("italic");
      } else if (key === "u") {
        e.preventDefault();
        executeCommand("underline");
      }
    }
    
    // 2. Discord-style triple backticks trigger (```)
    if (e.key === "`") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const textNode = range.startContainer;
        const offset = range.startOffset;
        
        // If the text before cursor is already two backticks
        if (textNode.nodeType === Node.TEXT_NODE && textNode.nodeValue) {
          const textBefore = textNode.nodeValue.substring(0, offset);
          if (textBefore.endsWith("``")) {
            // We have three backticks!
            e.preventDefault();
            
            // Delete the two existing backticks
            range.setStart(textNode, offset - 2);
            range.deleteContents();
            
            // Insert the code block!
            insertCodeBlockContainer(editorLanguage);
          }
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col border border-[#E5E1D8] rounded-2xl bg-white/50 focus-within:border-zinc-800 transition-all overflow-hidden">
      {/* List & Code styling injector */}
      <style>{`
        .vloatty-editor-body ol, .rich-text-content ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
          padding-left: 0.5rem !important;
          list-style-position: outside !important;
          display: block !important;
        }
        .vloatty-editor-body ul, .rich-text-content ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
          padding-left: 0.5rem !important;
          list-style-position: outside !important;
          display: block !important;
        }
        .vloatty-editor-body li, .rich-text-content li {
          display: list-item !important;
          margin-bottom: 0.25rem !important;
        }
        .vloatty-editor-body blockquote, .rich-text-content blockquote {
          border-left: 4px solid #E5E1D8 !important;
          padding-left: 1rem !important;
          font-style: italic !important;
          margin: 0.75rem 0 !important;
          color: #71717a !important;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-[#F9F8F6] border-b border-[#E5E1D8] p-2 select-none">
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-650 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-650 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-650 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#E5E1D8] mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "p")}
          title="Normal Text"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-655 hover:text-zinc-900 transition-colors cursor-pointer font-bold text-xs"
        >
          Normal
        </button>

        <div className="w-px h-5 bg-[#E5E1D8] mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          title="Bullet List"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-650 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          title="Numbered List"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-655 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "blockquote")}
          title="Quote"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-650 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#E5E1D8] mx-1" />

        <div className="flex items-center gap-1.5">
          <select
            value={editorLanguage}
            onChange={(e) => setEditorLanguage(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#E5E1D8] rounded-xl text-zinc-700 font-semibold text-[10px] focus:outline-none focus:border-zinc-800 cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="plaintext">Plain Text</option>
          </select>

          <button
            type="button"
            onClick={() => insertCodeBlockContainer(editorLanguage)}
            title="Attach Code (or type ```)"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1 transition-colors cursor-pointer text-[10px] font-bold px-2.5 py-1.5 shrink-0"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Attach Code</span>
          </button>
        </div>

        <div className="w-px h-5 bg-[#E5E1D8] mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          title="Clear Formatting"
          className="p-1.5 rounded-lg hover:bg-zinc-200/70 text-zinc-650 hover:text-rose-600 transition-colors cursor-pointer ml-auto"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="relative min-h-[250px] w-full bg-white select-text">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[250px] p-4 text-[13px] leading-relaxed text-zinc-800 font-semibold focus:outline-none overflow-y-auto max-h-[500px] vloatty-editor-body"
          style={{ minHeight: "250px" }}
        />
        {!value && (
          <div className="absolute top-4 left-4 text-zinc-400 font-semibold text-[13px] pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
