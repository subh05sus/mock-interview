import axios from "axios";
import { AIService } from "./aiService";
import Question from "../models/Question";
import TestCase from "../models/TestCase";

// Judge0 API configuration
const JUDGE0_API = process.env.JUDGE0_API || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Generate dynamic code wrappers based on question and language
function generateCodeWrapper(
  code: string,
  input: string,
  language: string,
  question: any
) {
  const functionName = question.functionName || "solution";

  switch (language) {
    case "javascript":
      return `
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
      // Find the solution function
      let solutionFunction = ${functionName};
      
      // If the named function doesn't exist, try to find any function
      if (typeof solutionFunction !== 'function') {
        const functionNames = Object.keys(this).filter(
          key => typeof this[key] === 'function' && key !== 'originalLog'
        );
        if (functionNames.length > 0) {
          solutionFunction = this[functionNames[functionNames.length - 1]];
        }
      }
        
      let result;
      if (typeof solutionFunction === 'function') {
        result = solutionFunction(...Object.values(input));
      } else {
        throw new Error("Could not find solution function");
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
      `;

    case "python":
      return `
import sys
import json
from io import StringIO
from typing import List, Dict, Any, Optional

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
    # Try to find the method by name first
    if hasattr(solution, "${functionName}"):
        main_method = getattr(solution, "${functionName}")
    else:
        # Get the first method that's not a dunder method
        solution_methods = [method for method in dir(solution) if not method.startswith('__')]
        if solution_methods:
            main_method = getattr(solution, solution_methods[0])
        else:
            raise AttributeError("No solution method found")
    
    # Call the method with the input data
    if isinstance(input_data, dict):
        result = main_method(**input_data)
    else:
        result = main_method(*input_data)
        
    # For functions that modify in place
    if result is None:
        # If the function doesn't return anything, we assume it modifies the first argument
        if isinstance(input_data, dict):
            first_arg_name = next(iter(input_data))
            print(json.dumps(input_data[first_arg_name]))
        elif isinstance(input_data, list) and len(input_data) > 0:
            print(json.dumps(input_data[0]))
        else:
            print("null")
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
elif len(console_output) == 1:
    print(console_output[0])
      `;

    case "java":
      return `
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
            
            // Try to find the method by name first
            Method targetMethod = null;
            try {
                // Look for the specific method name
                for (Method method : Solution.class.getDeclaredMethods()) {
                    if (method.getName().equals("${functionName}")) {
                        targetMethod = method;
                        break;
                    }
                }
                
                // If not found, use the first non-standard method
                if (targetMethod == null) {
                    for (Method method : Solution.class.getDeclaredMethods()) {
                        if (!method.getName().equals("equals") && 
                            !method.getName().equals("hashCode") && 
                            !method.getName().equals("toString") && 
                            !method.getName().equals("getClass")) {
                            targetMethod = method;
                            break;
                        }
                    }
                }
                
                if (targetMethod == null) {
                    throw new Exception("No solution method found");
                }
                
                // Extract parameters and call the method
                Object result = null;
                Object firstParam = null;
                
                if (inputData.size() > 0) {
                    firstParam = inputData.values().iterator().next();
                    // Call method with parameters
                    result = targetMethod.invoke(solution, inputData.values().toArray());
                }
                
                // Print result or modified first parameter
                if (result == null) {
                    System.out.println(mapper.writeValueAsString(firstParam));
                } else {
                    System.out.println(mapper.writeValueAsString(result));
                }
            } catch (Exception e) {
                System.err.println("Error: " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
      `;

    case "cpp":
      return `
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
        
        // Call the solution method
        json result;
        bool hasResult = false;
        
        // Extract first parameter for in-place modifications
        json firstParam;
        vector<json> params;
        
        if (inputData.is_object()) {
            // Handle object input
            for (auto& [key, value] : inputData.items()) {
                params.push_back(value);
            }
        } else if (inputData.is_array()) {
            // Handle array input
            params = inputData;
        }
        
        if (!params.empty()) {
            firstParam = params[0];
        }
        
        // Try to call the method - this is a simplified approach
        // In a real implementation, we would need to handle different parameter types
        try {
            // For demonstration, we'll assume we're calling the ${functionName} method
            // with the right parameters
            
            // This is a placeholder for the actual method call
            // In a real implementation, we would use reflection or other techniques
            // to dynamically call the right method with the right parameters
            
            // For now, we'll just print the first parameter as the result
            cout << firstParam.dump() << endl;
        } catch (exception& e) {
            cerr << "Method call error: " << e.what() << endl;
        }
        
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
    }
    
    return 0;
}
      `;

    default:
      return code;
  }
}

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
      let language = "javascript";
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

            // Generate dynamic code wrapper based on question and language
            const wrappedCode = generateCodeWrapper(
              code,
              inputJson,
              language,
              question
            );

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
              const consoleOutputIndex = outputLines.findIndex((line: string) =>
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

      let hiddenResults: any[] = [];

      if (hiddenTestCases.length > 0) {
        // Use the same executeCode method but with hidden test cases
        const tempResults = await Promise.all(
          hiddenTestCases.map(async (testCase) => {
            try {
              // Prepare input for Judge0
              const inputJson = JSON.stringify(testCase.input);

              // Generate dynamic code wrapper based on question and language
              const wrappedCode = generateCodeWrapper(
                code,
                inputJson,
                language,
                question
              );

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
                  (line: string) => line.includes("--- Console Output ---")
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
              // const passed = true if all testcase pass, compute it here, dont use this.compareOutputs


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

      const failedTestCases = allResults.filter(
        (result) => !result.passed
      );
      const failedTestCaseDetails = failedTestCases.map((result) => ({
        input: result.testCase.input,
        expectedOutput: result.testCase.expectedOutput,
        explanation: result.testCase.explanation,
        output: result.output,
        error: result.error,
        consoleOutput: result.consoleOutput,
      }));

      return {
        results,
        hiddenResults,
        aiReview,
        passed,
        executionTime,
        memoryUsed,
        failedTestCases: failedTestCaseDetails,
      };
    } catch (error: any) {
      console.error("Error submitting solution:", error);
      throw new Error("Failed to submit solution: " + error.message);
    }
  }

  // Helper method to compare outputs
  private static compareOutputs(actual: any, expected: any): boolean {
    // Handle null or undefined
    if (
      actual === null ||
      actual === undefined ||
      expected === null ||
      expected === undefined
    ) {
      return actual === expected;
    }

    // Handle NaN comparison
    if (typeof actual === "number" && typeof expected === "number") {
      if (isNaN(actual) && isNaN(expected)) {
        return true;
      }
      if (isNaN(actual) || isNaN(expected)) {
        return false;
      }
    }

    if (typeof actual === "string" && typeof expected === "string") {
      // Handle string comparison
      return actual.trim() === expected.trim();
    }
    // Handle boolean comparison
    if (typeof actual === "boolean" && typeof expected === "boolean") {
      return actual === expected;
    }
    // Handle number comparison
    if (typeof actual === "number" && typeof expected === "number") {
      return actual === expected;
    }
    // Handle date comparison
    if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();
    }
    // Handle regex comparison
    if (actual instanceof RegExp && expected instanceof RegExp) {
      return actual.toString() === expected.toString();
    }
    // Handle function comparison
    if (typeof actual === "function" && typeof expected === "function") {
      return actual.toString() === expected.toString();
    }
    // Handle undefined comparison
    if (actual === undefined && expected === undefined) {
      return true;
    }
    // Handle null comparison
    if (actual === null && expected === null) {
      return true;
    }
    // Handle empty string comparison
    if (actual === "" && expected === "") {
      return true;
    }

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

    // Compare primitives
    return actual === expected;
  }
}
