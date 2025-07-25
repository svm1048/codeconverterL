import React from 'react';
import Editor from '@monaco-editor/react';
import { Card } from '@/components/ui/card';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  title?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  readOnly = false,
  height = "400px",
  title
}) => {
  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || '');
  };

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    readOnly,
    cursorStyle: 'line' as const,
    automaticLayout: true,
    theme: 'vs-dark',
    padding: { top: 16, bottom: 16 },
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'gutter' as const,
  };

  return (
    <Card className="border-border bg-card shadow-elegant">
      {title && (
        <div className="px-4 py-3 border-b border-border bg-editor-gutter">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
      )}
      <div className="overflow-hidden rounded-b-lg">
        <Editor
          height={height}
          language={language.toLowerCase()}
          value={value}
          onChange={handleEditorChange}
          options={editorOptions}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full bg-editor-background text-editor-foreground">
              Loading editor...
            </div>
          }
        />
      </div>
    </Card>
  );
};