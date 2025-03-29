import axios from "axios";
import { AIService } from "./aiService";
import Question from "../models/Question";
import TestCase from "../models/TestCase";

// Judge0 API configuration
const JUDGE0_API = process.env.JUDGE0_API || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language-specific code wrappers to capture console output
const codeWrappers = {
  javascript: (code: string, input: string) => `
    // Capture console.log output
    let output = [];
    const originalLog = console.log;
    console.log = (...args) => {
      output.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
      originalLog(...args);
    };
    
    ${code}
    
    // Parse input
    const input = ${input};
    
    // Execute user code with input arguments
    try {
      // Assume the last defined function is the main solution function
      const functionNames = Object.keys(this).filter(
        key => typeof this[key] === 'function' && key !== 'originalLog'
      );
      const mainFunction = functionNames.length > 0 
        ? this[functionNames[functionNames.length - 1]] 
        : null;
        
      let result;
      if (mainFunction) {
        result = mainFunction(...Object.values(input));
      }

      // For functions that modify in place
      if (typeof result === 'undefined') {
        // If the function doesn't return anything, we assume it modifies the first argument
        console.log(JSON.stringify(Object.values(input)[0]));
      } else {
        // Otherwise return the result
        console.log(JSON.stringify(result));
      }
    } catch (e) {
      console.error("Execution error:", e.message);
    }
    
    // Also output the console logs
    if (output.length > 0) {
      console.log("\\n--- Console Output ---");
      output.forEach(log => console.log(log));
    }
  `,

  python: (code: string, input: string) => `
import sys
import json
from io import StringIO
from typing import List

# Capture print output
original_stdout = sys.stdout
captured_output = StringIO()
sys.stdout = captured_output

# Original code
${code}

# Parse input
input_data = json.loads('''${input}''')

# Call the solution function
try:
    solution = Solution()
    # Get the first method that's not a dunder method
    solution_methods = [method for method in dir(solution) if not method.startswith('__')]
    if solution_methods:
        main_method = getattr(solution, solution_methods[0])
        result = main_method(**input_data)
        
        # For functions that modify in place
        if result is None:
            # If the function doesn't return anything, we assume it modifies the first argument
            first_arg_name = next(iter(input_data))
            print(json.dumps(input_data[first_arg_name]))
        else:
            # Otherwise return the result
            print(json.dumps(result))
except Exception as e:
    print(f"Execution error: {str(e)}", file=sys.stderr)

# Restore stdout and get captured output
sys.stdout = original_stdout
console_output = captured_output.getvalue().strip().split('\\n')

# Print console output if any (excluding the result we just printed)
if len(console_output) > 1:
    print("\\n--- Console Output ---")
    for line in console_output[:-1]:
        print(line)
  `,

  java: (code: string, input: string) => `
import java.util.*;
import java.lang.reflect.Method;
import com.fasterxml.jackson.databind.ObjectMapper;

// Capture the original code
${code}

public class Main {
    public static void main(String[] args) {
        try {
            // Parse input
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> inputData = mapper.readValue("${input.replace(
              /"/g,
              '\\"'
            )}", Map.class);
            
            // Create solution instance
            Solution solution = new Solution();
            
            // Get solution methods
            Method[] methods = Solution.class.getDeclaredMethods();
            if (methods.length > 0) {
                // Use the first solution method found
                Method mainMethod = methods[0];
                for (Method m : methods) {
                    if (!m.getName().equals("equals") && !m.getName().equals("hashCode") && 
                        !m.getName().equals("toString") && !m.getName().equals("getClass")) {
                        mainMethod = m;
                        break;
                    }
                }
                
                // Extract parameters and call the method
                // This is a simplified approach - in real code you'd need more robust parameter handling
                Object result = null;
                Object firstParam = null;
                
                if (inputData.size() > 0) {
                    firstParam = inputData.values().iterator().next();
                    // Call method with parameters
                    // This is simplified and would need to be adapted based on actual method signatures
                    result = mainMethod.invoke(solution, inputData.values().toArray());
                }
                
                // Print result or modified first parameter
                if (result == null) {
                    System.out.println(mapper.writeValueAsString(firstParam));
                } else {
                    System.out.println(mapper.writeValueAsString(result));
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
  `,

  cpp: (code: string, input: string) => `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

${code}

int main() {
    try {
        // Parse input
        json inputData = json::parse(R"(${input.replace(/"/g, '\\"')})");
        
        // Create solution instance
        Solution solution;
        
        // In a real implementation, we would need to determine the correct method
        // and parameters dynamically. This is a simplified example assuming a common pattern.
        
        // Extract first parameter for in-place modifications
        json firstParam;
        if (!inputData.empty()) {
            auto it = inputData.begin();
            firstParam = it.value();
        }
        
        // This would need to be replaced with actual method call detection
        // For now, we'll use a simplified approach for common LeetCode patterns
        
        // For demonstration, assuming we have input parameters and we're passing them to a method
        // that modifies the first parameter in-place
        
        // Print first parameter as result (simulating in-place modification)
        cout << firstParam.dump() << endl;
        
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
    }
    
    return 0;
}
  `,
};

export class SubmissionService {
  // Execute code against test cases
  static async executeCode(
    code: string,
    languageId: number,
    questionId: string
  ): Promise<any> {
    try {
      // Get question
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error("Question not found");
      }

      // Get test cases
      const testCases = await TestCase.find({
        questionId: questionId,
        isHidden: false, // Only use visible test cases for execution
      });

      if (testCases.length === 0) {
        throw new Error("No test cases found for this question");
      }

      // Get language from languageId
      let language: keyof typeof codeWrappers = "javascript";
      switch (languageId) {
        case 63:
          language = "javascript";
          break;
        case 71:
          language = "python";
          break;
        case 62:
          language = "java";
          break;
        case 54:
          language = "cpp";
          break;
      }

      // Execute code against each test case
      const results = await Promise.all(
        testCases.map(async (testCase) => {
          try {
            // Prepare input for Judge0
            const inputJson = JSON.stringify(testCase.input);

            // Wrap code to capture console output and handle the specific problem format
            const wrappedCode = codeWrappers[language](code, inputJson);

            // Submit to Judge0
            const submissionResponse = await axios.post(
              `${JUDGE0_API}/submissions`,
              {
                source_code: wrappedCode,
                language_id: languageId,
                stdin: "", // We're passing input via the wrapped code
                wait: false, // Don't wait for the result, get a token instead
              },
              {
                headers: {
                  "X-RapidAPI-Key": JUDGE0_API_KEY,
                  "Content-Type": "application/json",
                },
              }
            );

            // Get the token from the response
            const token = submissionResponse.data.token;

            if (!token) {
              throw new Error("Failed to get submission token from Judge0");
            }

            // Wait for the result with the token
            let result;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
              attempts++;

              // Wait a bit before checking
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Get the submission result
              const resultResponse = await axios.get(
                `${JUDGE0_API}/submissions/${token}`,
                {
                  headers: {
                    "X-RapidAPI-Key": JUDGE0_API_KEY,
                    "Content-Type": "application/json",
                  },
                }
              );

              result = resultResponse.data;

              // If the status is not "Processing", we're done
              if (result.status.id !== 1 && result.status.id !== 2) {
                break;
              }
            }
            console.log(result);
            // Check if execution was successful
            if (!result || result.status.id > 3) {
              // Error status
              return {
                passed: false,
                output: null,
                error:
                  result?.stderr || result?.compile_output || "Execution error",
                consoleOutput: [],
                testCase: {
                  input: testCase.input,
                  expectedOutput: testCase.expectedOutput,
                  explanation: testCase.explanation,
                },
              };
            }

            // Parse output and extract console logs
            let output;
            let consoleOutput = [];

            if (result.stdout) {
              const outputLines = result.stdout.trim().split("\n");

              // Check if there's console output
              const consoleOutputIndex = outputLines.findIndex(
                (line: string | string[]) =>
                  line.includes("--- Console Output ---")
              );

              if (consoleOutputIndex !== -1) {
                // Extract console output
                consoleOutput = outputLines.slice(consoleOutputIndex + 1);
                // Extract actual result
                const resultOutput = outputLines
                  .slice(0, consoleOutputIndex)
                  .join("\n")
                  .trim();
                try {
                  output = JSON.parse(resultOutput);
                } catch (e) {
                  output = resultOutput;
                }
              } else {
                // No console output, just parse the result
                try {
                  output = JSON.parse(outputLines[0]);
                } catch (e) {
                  output = outputLines[0];
                }
              }
            }

            // Compare output with expected output
            const passed = this.compareOutputs(output, testCase.expectedOutput);

            return {
              passed,
              output,
              error: null,
              consoleOutput,
              executionTime: result.time,
              memoryUsed: result.memory,
              testCase: {
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                explanation: testCase.explanation,
              },
            };
          } catch (error: any) {
            console.error("Error executing test case:", error);
            return {
              passed: false,
              output: null,
              error: error.message || "Execution failed",
              consoleOutput: [],
              testCase: {
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                explanation: testCase.explanation,
              },
            };
          }
        })
      );

      return results;
    } catch (error: any) {
      console.error("Error executing code:", error);
      throw new Error("Failed to execute code: " + error.message);
    }
  }

  // Submit solution with AI review
  static async submitSolution(
    code: string,
    languageId: number,
    language: string,
    questionId: string,
    jobId: string,
    userId: string
  ): Promise<any> {
    try {
      // Execute code against test cases
      const results = await this.executeCode(code, languageId, questionId);

      // Get question for AI review
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error("Question not found");
      }

      // Get AI review
      const aiReview = await AIService.reviewCode(code, language, question);

      // Calculate execution metrics
      const executionTime =
        results.reduce(
          (sum: number, result: any) =>
            sum +
            (result.executionTime
              ? Number.parseFloat(result.executionTime)
              : 0),
          0
        ) / results.length;

      const memoryUsed =
        results.reduce(
          (sum: number, result: any) => sum + (result.memoryUsed || 0),
          0
        ) / results.length;

      // Check hidden test cases
      const hiddenTestCases = await TestCase.find({
        questionId: questionId,
        isHidden: true,
      });

      let hiddenResults: (
        | {
            passed: boolean;
            output: null;
            error: any;
            consoleOutput: never[];
            testCase: { input: any; expectedOutput: any; explanation: string };
            executionTime?: undefined;
            memoryUsed?: undefined;
          }
        | {
            passed: boolean;
            output: any;
            error: null;
            consoleOutput: any;
            executionTime: any;
            memoryUsed: any;
            testCase: { input: any; expectedOutput: any; explanation: string };
          }
      )[] = [];

      if (hiddenTestCases.length > 0) {
        // Use the same executeCode method but with hidden test cases
        const tempResults = await Promise.all(
          hiddenTestCases.map(async (testCase) => {
            try {
              // Prepare input for Judge0
              const inputJson = JSON.stringify(testCase.input);

              // Get language from languageId
              let lang: keyof typeof codeWrappers = "javascript";
              switch (languageId) {
                case 63:
                  lang = "javascript";
                  break;
                case 71:
                  lang = "python";
                  break;
                case 62:
                  lang = "java";
                  break;
                case 54:
                  lang = "cpp";
                  break;
              }

              // Wrap code to capture console output
              const wrappedCode = codeWrappers[lang](code, inputJson);

              // Submit to Judge0
              const submissionResponse = await axios.post(
                `${JUDGE0_API}/submissions`,
                {
                  source_code: wrappedCode,
                  language_id: languageId,
                  stdin: "", // We're passing input via the wrapped code
                  wait: false,
                },
                {
                  headers: {
                    "X-RapidAPI-Key": JUDGE0_API_KEY,
                    "Content-Type": "application/json",
                  },
                }
              );

              // Get the token from the response
              const token = submissionResponse.data.token;

              if (!token) {
                throw new Error("Failed to get submission token from Judge0");
              }

              // Wait for the result with the token
              let result;
              let attempts = 0;
              const maxAttempts = 10;

              while (attempts < maxAttempts) {
                attempts++;

                // Wait a bit before checking
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Get the submission result
                const resultResponse = await axios.get(
                  `${JUDGE0_API}/submissions/${token}`,
                  {
                    headers: {
                      "X-RapidAPI-Key": JUDGE0_API_KEY,
                      "Content-Type": "application/json",
                    },
                  }
                );

                result = resultResponse.data;

                // If the status is not "Processing", we're done
                if (result.status.id !== 1 && result.status.id !== 2) {
                  break;
                }
              }

              // Check if execution was successful
              if (!result || result.status.id > 3) {
                return {
                  passed: false,
                  output: null,
                  error:
                    result?.stderr ||
                    result?.compile_output ||
                    "Execution error",
                  consoleOutput: [],
                  testCase: {
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    explanation: testCase.explanation,
                  },
                };
              }

              // Parse output and extract console logs
              let output;
              let consoleOutput = [];

              if (result.stdout) {
                const outputLines = result.stdout.trim().split("\n");

                // Check if there's console output
                const consoleOutputIndex = outputLines.findIndex(
                  (line: string | string[]) =>
                    line.includes("--- Console Output ---")
                );

                if (consoleOutputIndex !== -1) {
                  // Extract console output
                  consoleOutput = outputLines.slice(consoleOutputIndex + 1);
                  // Extract actual result
                  const resultOutput = outputLines
                    .slice(0, consoleOutputIndex)
                    .join("\n")
                    .trim();
                  try {
                    output = JSON.parse(resultOutput);
                  } catch (e) {
                    output = resultOutput;
                  }
                } else {
                  // No console output, just parse the result
                  try {
                    output = JSON.parse(outputLines[0]);
                  } catch (e) {
                    output = outputLines[0];
                  }
                }
              }

              // Compare output with expected output
              const passed = this.compareOutputs(
                output,
                testCase.expectedOutput
              );

              return {
                passed,
                output,
                error: null,
                consoleOutput,
                executionTime: result.time,
                memoryUsed: result.memory,
                testCase: {
                  input: testCase.input,
                  expectedOutput: testCase.expectedOutput,
                  explanation: testCase.explanation,
                },
              };
            } catch (error: any) {
              console.error("Error executing hidden test case:", error);
              return {
                passed: false,
                output: null,
                error: error.message || "Execution failed",
                consoleOutput: [],
                testCase: {
                  input: testCase.input,
                  expectedOutput: testCase.expectedOutput,
                  explanation: testCase.explanation,
                },
              };
            }
          })
        );

        hiddenResults = tempResults;
      }

      // Combine visible and hidden results
      const allResults = [...results, ...hiddenResults];
      const passed = allResults.every((result) => result.passed);

      return {
        results,
        hiddenResults,
        aiReview,
        passed,
        executionTime,
        memoryUsed,
      };
    } catch (error: any) {
      console.error("Error submitting solution:", error);
      throw new Error("Failed to submit solution: " + error.message);
    }
  }

  // Helper method to compare outputs
  private static compareOutputs(actual: any, expected: any): boolean {
    // Handle different types of outputs
    if (typeof actual !== typeof expected) {
      return false;
    }

    // Compare arrays
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) {
        return false;
      }

      // Sort arrays if they contain primitive values
      if (
        actual.every((item) => typeof item !== "object") &&
        expected.every((item) => typeof item !== "object")
      ) {
        const sortedActual = [...actual].sort();
        const sortedExpected = [...expected].sort();

        for (let i = 0; i < sortedActual.length; i++) {
          if (!this.compareOutputs(sortedActual[i], sortedExpected[i])) {
            return false;
          }
        }

        return true;
      }

      // For arrays of objects or nested arrays, compare each element
      for (let i = 0; i < actual.length; i++) {
        if (!this.compareOutputs(actual[i], expected[i])) {
          return false;
        }
      }

      return true;
    }

    // Compare objects
    if (
      typeof actual === "object" &&
      actual !== null &&
      typeof expected === "object" &&
      expected !== null
    ) {
      const actualKeys = Object.keys(actual);
      const expectedKeys = Object.keys(expected);

      if (actualKeys.length !== expectedKeys.length) {
        return false;
      }

      for (const key of actualKeys) {
        if (
          !expectedKeys.includes(key) ||
          !this.compareOutputs(actual[key], expected[key])
        ) {
          return false;
        }
      }

      return true;
    }

    return true;
  }
}
