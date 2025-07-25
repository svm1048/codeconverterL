import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export interface TestResult {
  id: string;
  description: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
}

interface TestResultsProps {
  results: TestResult[];
  isRunning?: boolean;
}

export const TestResults: React.FC<TestResultsProps> = ({
  results,
  isRunning = false
}) => {
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <Card className="border-border bg-card shadow-elegant">
      <CardHeader className="bg-editor-gutter border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Test Results</CardTitle>
          {!isRunning && totalCount > 0 && (
            <Badge 
              variant={passedCount === totalCount ? "default" : "destructive"}
              className={passedCount === totalCount ? "bg-success text-success-foreground" : ""}
            >
              {passedCount}/{totalCount} Passed
            </Badge>
          )}
          {isRunning && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="h-3 w-3 animate-spin" />
              Running...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isRunning ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Executing test cases...
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No test results yet.</p>
            <p className="text-sm">Run your code to see test results here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={result.id} className={`border ${
                result.passed 
                  ? 'border-success/50 bg-success/5' 
                  : 'border-destructive/50 bg-destructive/5'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-medium text-foreground">
                        Test {index + 1}
                        {result.description && `: ${result.description}`}
                      </span>
                    </div>
                    {result.executionTime && (
                      <Badge variant="secondary" className="text-xs">
                        {result.executionTime}ms
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1">Input</div>
                      <div className="font-mono bg-editor-background p-2 rounded border border-border text-editor-foreground">
                        {result.input}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1">Expected</div>
                      <div className="font-mono bg-editor-background p-2 rounded border border-border text-editor-foreground">
                        {result.expected}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1">Actual</div>
                      <div className={`font-mono p-2 rounded border ${
                        result.passed 
                          ? 'bg-success/10 border-success/30 text-success-foreground' 
                          : 'bg-destructive/10 border-destructive/30 text-destructive-foreground'
                      }`}>
                        {result.actual}
                      </div>
                    </div>
                  </div>
                  
                  {result.error && (
                    <div className="mt-3">
                      <div className="text-xs text-destructive font-medium mb-1">Error</div>
                      <div className="font-mono text-xs bg-destructive/10 border border-destructive/30 p-2 rounded text-destructive-foreground">
                        {result.error}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};