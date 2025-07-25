import { TestCase } from '@/components/TestCaseEditor';
import { TestResult } from '@/components/TestResults';

export interface CodeTransformationRequest {
  code: string;
  sourceLanguage: string;
  targetLanguage?: string;
  operation: 'fix' | 'translate';
  testCases: TestCase[];
}

export interface CodeTransformationResponse {
  transformedCode: string;
  explanation: string;
  changes: Array<{
    line: number;
    type: 'added' | 'removed' | 'modified';
    description: string;
  }>;
  testResults: TestResult[];
}

// Mock AI service for demonstration
export class CodeService {
  private static async mockDelay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static executeCode(code: string, input: string): { result: string; error?: string } {
    try {
      // This is a simplified mock execution
      // In a real implementation, you'd use a sandboxed environment
      
      // Parse the input
      let parsedInput;
      try {
        parsedInput = JSON.parse(input);
      } catch {
        parsedInput = input;
      }

      // Extract function name from code (simplified)
      const functionMatch = code.match(/def\s+(\w+)\s*\(|function\s+(\w+)\s*\(|const\s+(\w+)\s*=/);
      const functionName = functionMatch?.[1] || functionMatch?.[2] || functionMatch?.[3];

      if (!functionName) {
        return { result: 'undefined', error: 'Could not find function' };
      }

      // Mock execution based on common patterns
      if (functionName.includes('even')) {
        const num = Array.isArray(parsedInput) ? parsedInput[0] : parsedInput;
        return { result: (num % 2 === 0).toString() };
      }

      if (functionName.includes('add') || functionName.includes('sum')) {
        if (Array.isArray(parsedInput) && parsedInput.length >= 2) {
          return { result: (parsedInput[0] + parsedInput[1]).toString() };
        }
      }

      if (functionName.includes('reverse')) {
        const str = Array.isArray(parsedInput) ? parsedInput[0] : parsedInput;
        return { result: str.toString().split('').reverse().join('') };
      }

      // Default mock result
      return { result: 'mock_result' };

    } catch (error) {
      return { result: 'undefined', error: error.message };
    }
  }

  static async transformCode(request: CodeTransformationRequest): Promise<CodeTransformationResponse> {
    await this.mockDelay();

    // Mock code transformation logic
    let transformedCode = request.code;
    const changes = [];

    if (request.operation === 'fix') {
      // Common bug fixes with better pattern matching
      
      // Fix even/odd logic
      if (transformedCode.includes('n % 2 != 0') && transformedCode.toLowerCase().includes('even')) {
        transformedCode = transformedCode.replace('n % 2 != 0', 'n % 2 == 0');
        changes.push({
          line: transformedCode.split('\n').findIndex(line => line.includes('n % 2')) + 1,
          type: 'modified' as const,
          description: 'Fixed even number logic: changed != to =='
        });
      }

      // Fix factorial recursion
      if (transformedCode.includes('return n + 1') && transformedCode.toLowerCase().includes('factorial')) {
        transformedCode = transformedCode.replace('return n + 1', 'return n * factorial(n - 1)');
        changes.push({
          line: transformedCode.split('\n').findIndex(line => line.includes('return n')) + 1,
          type: 'modified' as const,
          description: 'Fixed factorial recursion: changed addition to multiplication'
        });
      }

      // Fix off-by-one errors in loops
      if (transformedCode.includes('range(len(') && transformedCode.includes('+ 1')) {
        transformedCode = transformedCode.replace(/range\(len\(([^)]+)\)\s*\+\s*1\)/g, 'range(len($1))');
        changes.push({
          line: transformedCode.split('\n').findIndex(line => line.includes('range')) + 1,
          type: 'modified' as const,
          description: 'Fixed off-by-one error in range'
        });
      }

      // Fix comparison operators
      if (transformedCode.includes('=') && !transformedCode.includes('==') && transformedCode.includes('if')) {
        transformedCode = transformedCode.replace(/if\s+([^=\s]+)\s*=\s*([^=][^;{]*)/g, 'if $1 == $2');
        changes.push({
          line: transformedCode.split('\n').findIndex(line => line.includes('if')) + 1,
          type: 'modified' as const,
          description: 'Fixed assignment in conditional: changed = to =='
        });
      }
    }

    if (request.operation === 'translate' && request.targetLanguage) {
      // Python to JavaScript translation
      if (request.sourceLanguage === 'python' && request.targetLanguage === 'javascript') {
        transformedCode = transformedCode
          // Convert function definitions
          .replace(/def\s+(\w+)\s*\((.*?)\):\s*/g, 'function $1($2) {\n')
          // Convert return statements and add closing brace
          .replace(/(\s+)return\s+(.+)/g, '$1return $2;\n}')
          // Convert boolean values
          .replace(/\bTrue\b/g, 'true')
          .replace(/\bFalse\b/g, 'false')
          .replace(/\bNone\b/g, 'null')
          // Convert comments
          .replace(/#\s*/g, '// ')
          // Handle indentation (convert Python indentation to braces)
          .replace(/(\n\s{4,})([^}])/g, '$1$2')
          // Fix any double closing braces
          .replace(/}\s*}/g, '}');
        
        changes.push({
          line: 1,
          type: 'modified' as const,
          description: 'Converted Python function syntax to JavaScript'
        });
      }

      // JavaScript to Python translation
      if (request.sourceLanguage === 'javascript' && request.targetLanguage === 'python') {
        transformedCode = transformedCode
          // Convert function definitions
          .replace(/function\s+(\w+)\s*\((.*?)\)\s*{/g, 'def $1($2):')
          // Convert return statements
          .replace(/return\s+([^;]+);?\s*}/g, '    return $1')
          // Convert boolean values
          .replace(/\btrue\b/g, 'True')
          .replace(/\bfalse\b/g, 'False')
          .replace(/\bnull\b/g, 'None')
          // Convert comments
          .replace(/\/\/\s*/g, '# ')
          // Remove semicolons
          .replace(/;/g, '')
          // Clean up extra braces
          .replace(/}/g, '');
        
        changes.push({
          line: 1,
          type: 'modified' as const,
          description: 'Converted JavaScript function syntax to Python'
        });
      }
    }

    // Execute test cases (if any)
    const testResults: TestResult[] = request.testCases.map(testCase => {
      const execution = this.executeCode(transformedCode, testCase.input);
      const passed = execution.result === testCase.expected.replace(/"/g, '');
      
      return {
        id: testCase.id,
        description: testCase.description || 'Test case',
        input: testCase.input,
        expected: testCase.expected,
        actual: execution.result,
        passed,
        error: execution.error,
        executionTime: Math.floor(Math.random() * 50) + 10
      };
    });

    return {
      transformedCode,
      explanation: request.operation === 'fix' 
        ? 'Fixed logical errors in the code to make test cases pass.'
        : `Translated code from ${request.sourceLanguage} to ${request.targetLanguage}.`,
      changes,
      testResults
    };
  }
}

// Auto-detect language based on code patterns
export function detectLanguage(code: string): string {
  const patterns = {
    python: [/def\s+\w+\s*\(/, /import\s+\w+/, /if\s+__name__\s*==\s*['""]__main__['""]/, /print\s*\(/],
    javascript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/, /console\.log\s*\(/],
    typescript: [/interface\s+\w+/, /type\s+\w+\s*=/, /:\s*string/, /:\s*number/, /export\s+interface/],
    java: [/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /System\.out\.println/, /import\s+java\./],
    cpp: [/#include\s*<\w+>/, /using\s+namespace\s+std/, /cout\s*<</, /cin\s*>>/],
    csharp: [/using\s+System/, /public\s+class\s+\w+/, /Console\.WriteLine/, /namespace\s+\w+/],
    go: [/package\s+main/, /func\s+main\s*\(\)/, /import\s*\(/, /fmt\.Println/],
    rust: [/fn\s+main\s*\(\)/, /let\s+mut\s+\w+/, /println!\s*\(/, /use\s+std::/],
    php: [/<\?php/, /function\s+\w+\s*\(/, /echo\s+/, /\$\w+/],
    ruby: [/def\s+\w+/, /puts\s+/, /require\s+/, /class\s+\w+/]
  };

  for (const [language, regexes] of Object.entries(patterns)) {
    if (regexes.some(regex => regex.test(code))) {
      return language;
    }
  }

  return 'javascript'; // default
}