import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => {
    insertText('**', '**');
  };

  const handleBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Check if we're at the beginning of a line
    const lastNewlineIndex = beforeCursor.lastIndexOf('\n');
    const currentLineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
    const currentLine = beforeCursor.substring(currentLineStart);
    
    let newText;
    if (currentLine.trim() === '' || beforeCursor === '') {
      // Insert bullet at current position
      newText = beforeCursor + '• ' + afterCursor;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    } else {
      // Insert bullet on new line
      newText = beforeCursor + '\n• ' + afterCursor;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 3, start + 3);
      }, 0);
    }
    
    onChange(newText);
  };

  return (
    <div className={cn("border rounded-md", className)}>
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBulletPoint}
          className="h-8 w-8 p-0"
          title="Bullet Point"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-40 p-3 resize-none border-0 outline-none focus:ring-0"
      />
      
      {/* Preview Note */}
      <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        Use **text** for bold and • for bullet points
      </div>
    </div>
  );
};