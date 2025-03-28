import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Judge0 API endpoint
const JUDGE0_API = process.env.JUDGE0_API || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language IDs for Judge0
const LANGUAGE_IDS: Record<string, number> = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'csharp': 51
};

interface TestCase {
  input: string;
  output: string;
}

interface ExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  executionTime?: number;
  memory?: number;
  output?: string;
  error?: string;
}

export async function executeCode(
  code: string, 
  language: string, 
  testCases: TestCase[]
): Promise<ExecutionResult> {
  try {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // For each test case, submit the code to Judge0
    for (const testCase of testCases) {
      const submission = await createSubmission(code, languageId, testCase.input);
      const result = await getSubmissionResult(submission.token);

      // Check if the output matches the expected output
      if (result.status.id !== 3) { // 3 is "Accepted" in Judge0
        return {
          status: mapStatusId(result.status.id),
          executionTime: result.time,
          memory: result.memory,
          error: result.stderr || result.compile_output
        };
      }

      // Normalize outputs for comparison (trim whitespace, etc.)
      const normalizedOutput = result.stdout.trim();
      const normalizedExpected = testCase.output.trim();

      if (normalizedOutput !== normalizedExpected) {
        return {
          status: 'Wrong Answer',
          executionTime: result.time,
          memory: result.memory,
          output: normalizedOutput
        };
      }
    }

    // If all test cases pass
    return {
      status: 'Accepted',
      executionTime: 0, // We'll take the average of all test cases in a real implementation
      memory: 0
    };
  } catch (error) {
    console.error('Code execution error:', error);
    return {
      status: 'Runtime Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function createSubmission(code: string, languageId: number, input: string) {
  const response = await axios.post(`${JUDGE0_API}/submissions`, {
    source_code: code,
    language_id: languageId,
    stdin: input,
    wait: false
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  });

  return response.data;
}

async function getSubmissionResult(token: string) {
  // Poll until the submission is processed
  let result;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const response = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      params: {
        base64_encoded: 'false',
        fields: 'status,stdout,stderr,compile_output,time,memory'
      }
    });

    result = response.data;

    // If the submission is processed, return the result
    if (result.status.id !== 1 && result.status.id !== 2) { // 1: In Queue, 2: Processing
      return result;
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Submission processing timeout');
}

function mapStatusId(statusId: number): ExecutionResult['status'] {
  switch (statusId) {
    case 3: return 'Accepted';
    case 4: return 'Wrong Answer';
    case 5: return 'Time Limit Exceeded';
    case 6: case 7: case 8: case 9: case 10: case 11: case 12: return 'Runtime Error';
    case 13: return 'Compilation Error';
    default: return 'Runtime Error';
  }
}
