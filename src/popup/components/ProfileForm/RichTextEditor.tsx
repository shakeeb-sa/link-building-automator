/**
 * RichTextEditor Component
 *
 * A WYSIWYG editor with HTML/source mode toggle, formatting toolbar,
 * and link insertion modal. Used for the profile's masterHTML field.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync external value into editor when it changes (e.g., load profile)
  useEffect(() => {
    if (!isHtmlMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    if (isHtmlMode && sourceTextareaRef.current && sourceTextareaRef.current.value !== value) {
      sourceTextareaRef.current.value = value;
    }
  }, [value, isHtmlMode]);

  // Toggle between visual and HTML source mode
  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to visual: set editor content from textarea
      if (sourceTextareaRef.current && editorRef.current) {
        editorRef.current.innerHTML = sourceTextareaRef.current.value;
        onChange(editorRef.current.innerHTML);
      }
    } else {
      // Switching from visual to HTML: set textarea value from editor
      if (editorRef.current && sourceTextareaRef.current) {
        sourceTextareaRef.current.value = editorRef.current.innerHTML;
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  // Execute formatting command (bold, italic) in visual mode
  const execCommand = (command: string, value?: string) => {
    if (!isHtmlMode) {
      document.execCommand(command, false, value || '');
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  // Open link modal when text is selected
  const showLinkModal = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
      setLinkModalOpen(true);
      setLinkUrl('');
    }
  };

  // Apply link to selected text
  const applyLink = () => {
    if (savedSelectionRef.current && linkUrl.trim()) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        let url = linkUrl.trim();
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        document.execCommand('createLink', false, url);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    }
    setLinkModalOpen(false);
    setLinkUrl('');
    savedSelectionRef.current = null;
  };

  // Handle input in visual editor
  const handleEditorInput = () => {
    if (editorRef.current && !isHtmlMode) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle change in source textarea
  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isHtmlMode) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="llb-flex llb-justify-between llb-items-center llb-mb-1">
        <label className="llb-block llb-text-[10px] llb-font-black llb-text-slate-400 llb-uppercase llb-tracking-wider">
          Description / Bio
        </label>
        <div className="llb-flex llb-gap-1">
          <button
            onClick={() => execCommand('bold')}
            className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs llb-font-bold"
          >
            B
          </button>
          <button
            onClick={() => execCommand('italic')}
            className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs llb-font-bold italic"
          >
            I
          </button>
          <button
            onClick={showLinkModal}
            className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs"
          >
            🔗
          </button>
          <button
            onClick={toggleHtmlMode}
            className="llb-px-2 llb-py-0.5 llb-bg-slate-100 llb-rounded llb-text-xs"
          >
            &lt;/&gt;
          </button>
        </div>
      </div>

      {/* Editor area */}
      {!isHtmlMode ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          className="llb-min-h-[100px] llb-p-3 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-focus:outline-none llb-focus:border-peach-500 llb-overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          ref={sourceTextareaRef}
          value={value}
          onChange={handleSourceChange}
          className="llb-w-full llb-min-h-[100px] llb-p-3 llb-bg-slate-50 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-font-mono llb-focus:outline-none llb-focus:border-peach-500"
        />
      )}

      {/* Link Modal */}
      {linkModalOpen && (
        <div className="llb-fixed llb-inset-0 llb-bg-black/50 llb-flex llb-items-center llb-justify-center llb-z-[2147483647]">
          <div className="llb-bg-white llb-rounded-lg llb-p-4 llb-w-80">
            <h4 className="llb-text-sm llb-font-black llb-mb-3">Insert Link</h4>
            <input
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="llb-w-full llb-px-3 llb-py-2 llb-border llb-border-slate-200 llb-rounded-lg llb-text-sm llb-mb-3"
              autoFocus
            />
            <div className="llb-flex llb-justify-end llb-gap-2">
              <button
                onClick={() => setLinkModalOpen(false)}
                className="llb-px-3 llb-py-1 llb-text-sm"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                className="llb-px-3 llb-py-1 llb-bg-peach-500 llb-text-white llb-rounded llb-text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;