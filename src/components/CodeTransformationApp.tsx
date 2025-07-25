import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Play, Download, Wand2, ArrowRight, Code2, TestTube } from 'lucide-react';

import { CodeEditor } from './CodeEditor';
import { LanguageSelector } from './LanguageSelector';
import { TestCaseEditor, TestCase } from './TestCaseEditor';
import { DiffViewer } from './DiffViewer';
import { TestResults, TestResult } from './TestResults';
import { CodeService, detectLanguage } from '@/services/codeService';

export const CodeTransformationApp: React.FC = () => {
  const [originalCode, setOriginalCode] = useState(`def is_even(n):
    return n % 2 != 0  # Bug: should be == 0`);
  const [transformedCode, setTransformedCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('python');
  const [targetLanguage, setTargetLanguage] = useState('javascript');
  const [operation, setOperation] = useState<'fix' | 'translate'>('fix');
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      input: '2',
      expected: 'true',
      description: 'Even number should return true'
    },
    {
      id: '2',
      input: '3',
      expected: 'false',
      description: 'Odd number should return false'
    }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [explanation, setExplanation] = useState('');

  const handleCodeChange = (code: string) => {
    setOriginalCode(code);
    // Auto-detect language
    const detected = detectLanguage(code);
    if (detected !== sourceLanguage) {
      setSourceLanguage(detected);
      toast.info(`Auto-detected language: ${detected}`);
    }
  };

  const handleTransform = async () => {
    if (!originalCode.trim()) {
      toast.error('Please enter some code to transform');
      return;
    }

    if (operation === 'fix' && testCases.length === 0) {
      toast.error('Please add at least one test case for bug fixing');
      return;
    }

    setIsProcessing(true);
    setTestResults([]);

    try {
      const response = await CodeService.transformCode({
        code: originalCode,
        sourceLanguage,
        targetLanguage: operation === 'translate' ? targetLanguage : sourceLanguage,
        operation,
        testCases: operation === 'fix' ? testCases : []
      });

      setTransformedCode(response.transformedCode);
      setTestResults(response.testResults);
      setExplanation(response.explanation);

      const passedCount = response.testResults.filter(r => r.passed).length;
      const totalCount = response.testResults.length;

      if (totalCount === 0) {
        toast.success('Code transformed successfully!');
      } else if (passedCount === totalCount) {
        toast.success(`All ${totalCount} test cases passed!`);
      } else {
        toast.warning(`${passedCount}/${totalCount} test cases passed`);
      }
    } catch (error) {
      toast.error('Failed to transform code. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (!transformedCode) {
      toast.error('No transformed code to export');
      return;
    }

    const extension = operation === 'translate' ? 
      (targetLanguage === 'javascript' ? 'js' : targetLanguage === 'python' ? 'py' : 'txt') :
      (sourceLanguage === 'javascript' ? 'js' : sourceLanguage === 'python' ? 'py' : 'txt');

    const blob = new Blob([transformedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformed_code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Code exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-border bg-card shadow-elegant">
          <CardHeader className="bg-gradient-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl font-bold">Code Transformer</CardTitle>
                  <p className="text-primary-foreground/80">
                    AI-powered code fixing and translation with test validation
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {operation === 'fix' ? 'Bug Fixing Mode' : 'Translation Mode'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Operation Selection */}
        <Card className="border-border bg-card shadow-elegant">
          <CardContent className="p-6">
            <Tabs value={operation} onValueChange={(value) => setOperation(value as 'fix' | 'translate')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fix" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Fix Bugs
                </TabsTrigger>
                <TabsTrigger value="translate" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Translate Language
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Language Selection */}
        <Card className="border-border bg-card shadow-elegant">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <LanguageSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
                label="Source Language"
                placeholder="Select source language"
              />
              
              {operation === 'translate' && (
                <>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                  <LanguageSelector
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    label="Target Language"
                    placeholder="Select target language"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <CodeEditor
              value={originalCode}
              onChange={handleCodeChange}
              language={sourceLanguage}
              title="Original Code"
              height="400px"
            />

            {operation === 'fix' && (
              <TestCaseEditor
                testCases={testCases}
                onChange={setTestCases}
              />
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleTransform}
                disabled={isProcessing}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {operation === 'fix' ? 'Fix & Test' : 'Translate Code'}
                  </>
                )}
              </Button>

              {transformedCode && (
                <Button
                  onClick={handleExport}
                  variant="secondary"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {transformedCode ? (
              <>
                <CodeEditor
                  value={transformedCode}
                  onChange={setTransformedCode}
                  language={operation === 'translate' ? targetLanguage : sourceLanguage}
                  title="Transformed Code"
                  height="400px"
                  readOnly
                />

                {explanation && (
                  <Card className="border-border bg-card shadow-elegant">
                    <CardHeader className="bg-editor-gutter border-b border-border">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-foreground">{explanation}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-border bg-card shadow-elegant">
                <CardContent className="p-12 text-center">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Ready to Transform
                  </h3>
                  <p className="text-muted-foreground">
                    Add your code and test cases, then click the transform button to see results.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Diff and Test Results */}
        {transformedCode && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DiffViewer
              originalCode={originalCode}
              modifiedCode={transformedCode}
              language={sourceLanguage}
            />

            {operation === 'fix' && testResults.length > 0 && (
              <TestResults
                results={testResults}
                isRunning={isProcessing}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};