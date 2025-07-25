import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language
}) => {
  const diffLines = React.useMemo(() => {
    const originalLines = originalCode.split('\n');
    const modifiedLines = modifiedCode.split('\n');
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    const result = [];
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';
      
      let type = 'unchanged';
      if (originalLine !== modifiedLine) {
        if (originalLine && !modifiedLine) {
          type = 'removed';
        } else if (!originalLine && modifiedLine) {
          type = 'added';
        } else {
          type = 'modified';
        }
      }
      
      result.push({
        lineNumber: i + 1,
        original: originalLine,
        modified: modifiedLine,
        type
      });
    }
    
    return result;
  }, [originalCode, modifiedCode]);

  return (
    <Card className="border-border bg-card shadow-elegant">
      <CardHeader className="bg-editor-gutter border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground">Code Diff</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 h-96 overflow-auto">
          {/* Original Code */}
          <div className="border-r border-border">
            <div className="bg-muted/50 px-4 py-2 text-sm font-medium text-foreground border-b border-border">
              Original
            </div>
            <div className="font-mono text-sm">
              {diffLines.map((line) => (
                <div
                  key={`original-${line.lineNumber}`}
                  className={`flex ${
                    line.type === 'removed' || line.type === 'modified'
                      ? 'bg-destructive/20 text-destructive-foreground'
                      : line.type === 'unchanged'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="w-8 text-right pr-2 text-muted-foreground bg-muted/30 border-r border-border">
                    {line.original ? line.lineNumber : ''}
                  </div>
                  <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-words">
                    {line.original || ' '}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Modified Code */}
          <div>
            <div className="bg-muted/50 px-4 py-2 text-sm font-medium text-foreground border-b border-border">
              Modified
            </div>
            <div className="font-mono text-sm">
              {diffLines.map((line) => (
                <div
                  key={`modified-${line.lineNumber}`}
                  className={`flex ${
                    line.type === 'added' || line.type === 'modified'
                      ? 'bg-success/20 text-success-foreground'
                      : line.type === 'unchanged'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="w-8 text-right pr-2 text-muted-foreground bg-muted/30 border-r border-border">
                    {line.modified ? line.lineNumber : ''}
                  </div>
                  <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-words">
                    {line.modified || ' '}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};