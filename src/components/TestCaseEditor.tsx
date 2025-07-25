import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  description?: string;
}

interface TestCaseEditorProps {
  testCases: TestCase[];
  onChange: (testCases: TestCase[]) => void;
}

export const TestCaseEditor: React.FC<TestCaseEditorProps> = ({
  testCases,
  onChange
}) => {
  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: '',
      expected: '',
      description: ''
    };
    onChange([...testCases, newTestCase]);
  };

  const removeTestCase = (id: string) => {
    onChange(testCases.filter(tc => tc.id !== id));
  };

  const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
    onChange(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  };

  const handleJSONImport = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        const newTestCases: TestCase[] = parsed.map((item, index) => ({
          id: (Date.now() + index).toString(),
          input: JSON.stringify(item.input),
          expected: JSON.stringify(item.expected),
          description: item.description || `Test case ${index + 1}`
        }));
        onChange(newTestCases);
      }
    } catch (error) {
      console.error('Invalid JSON format');
    }
  };

  return (
    <Card className="border-border bg-card shadow-elegant">
      <CardHeader className="bg-editor-gutter border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground">Test Cases</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Button onClick={addTestCase} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Test Case
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Import from JSON (optional)
            </Label>
            <Textarea
              placeholder={`[
  { "input": [2], "expected": true, "description": "Even number test" },
  { "input": [3], "expected": false, "description": "Odd number test" }
]`}
              className="font-mono text-sm bg-editor-background border-border"
              rows={4}
              onChange={(e) => {
                if (e.target.value.trim()) {
                  handleJSONImport(e.target.value);
                }
              }}
            />
          </div>

          {testCases.map((testCase, index) => (
            <Card key={testCase.id} className="border-border bg-secondary/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Test Case {index + 1}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTestCase(testCase.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Input</Label>
                    <Input
                      value={testCase.input}
                      onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                      placeholder="e.g., [2] or 'hello'"
                      className="font-mono text-sm bg-editor-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Expected Output</Label>
                    <Input
                      value={testCase.expected}
                      onChange={(e) => updateTestCase(testCase.id, 'expected', e.target.value)}
                      placeholder="e.g., true or 'HELLO'"
                      className="font-mono text-sm bg-editor-background border-border"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                  <Input
                    value={testCase.description || ''}
                    onChange={(e) => updateTestCase(testCase.id, 'description', e.target.value)}
                    placeholder="Describe what this test case validates"
                    className="text-sm bg-editor-background border-border"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testCases.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No test cases added yet.</p>
            <p className="text-sm">Click "Add Test Case" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};