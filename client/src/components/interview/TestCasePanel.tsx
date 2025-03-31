/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  CheckCircle,
  XCircle,
  Cpu,
  MemoryStick,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";

interface TestCasePanelProps {
  testCases: any[];
  testResults: any[];
  activeTestCase: number;
  setActiveTestCase: (index: number) => void;
}

const TestCasePanel: React.FC<TestCasePanelProps> = ({
  testCases,
  testResults,
  activeTestCase,
  setActiveTestCase,
}) => {
  const [failedTestCases, setFailedTestCases] = useState<number[]>([]);
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  // Update failed test cases when results change
  useEffect(() => {
    if (testResults.length > 0) {
      const failedIndices = testResults
        .map((result, index) => (result.passed ? -1 : index))
        .filter((index) => index !== -1);

      setFailedTestCases(failedIndices);

      // If there are failed test cases, automatically select the first one
      if (failedIndices.length > 0 && !testResults[activeTestCase]?.passed) {
        setActiveTestCase(failedIndices[0]);
      }
    } else {
      setFailedTestCases([]);
    }
  }, [testResults, setActiveTestCase]);

  if (testCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-500">No test cases available</p>
      </div>
    );
  }

  // Filter test cases based on showFailedOnly
  const displayedTestCases =
    showFailedOnly && failedTestCases.length > 0
      ? failedTestCases.map((index) => index)
      : testCases.map((_, index) => index);

  const getTestCaseStatusClass = (index: number) => {
    if (!testResults[index]) return "";
    return testResults[index].passed
      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
      : "border-red-500 bg-red-50 dark:bg-red-950/20";
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Test case navigation */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-sm">Test Cases</h3>
          {failedTestCases.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFailedOnly(!showFailedOnly)}
              className={showFailedOnly ? "border-red-500 text-red-500" : ""}
            >
              {showFailedOnly ? "Show All" : "Show Failed Only"}
              {showFailedOnly ? null : (
                <Badge variant="destructive" className="ml-2">
                  {failedTestCases.length}
                </Badge>
              )}
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-24">
          <div className="flex flex-wrap gap-2">
            {displayedTestCases.map((caseIndex) => (
              <Button
                key={caseIndex}
                variant={activeTestCase === caseIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTestCase(caseIndex)}
                className={`flex items-center ${
                  testResults[caseIndex] && !testResults[caseIndex].passed
                    ? "border-red-500"
                    : ""
                }`}
              >
                Case {caseIndex + 1}
                {testResults[caseIndex] && (
                  <span className="ml-2">
                    {testResults[caseIndex].passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Test case details */}
      {testCases[activeTestCase] && (
        <div className="space-y-4 flex-1 overflow-auto">
          <Tabs defaultValue="comparison">
            <TabsList className="mb-2">
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              {testResults[activeTestCase]?.error && (
                <TabsTrigger value="error" className="text-red-500">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Error
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium">Input</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-xs">
                      {JSON.stringify(testCases[activeTestCase].input, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2 px-4">
                    <CardTitle className="text-sm font-medium">
                      Expected Output
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-xs">
                      {JSON.stringify(
                        testCases[activeTestCase].expectedOutput,
                        null,
                        2
                      )}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {testResults[activeTestCase] && (
                <Card className={getTestCaseStatusClass(activeTestCase)}>
                  <CardHeader className="py-2 px-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">
                        Your Output
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-xs">
                        {testResults[activeTestCase].executionTime && (
                          <div className="flex items-center">
                            <Cpu className="h-3 w-3 mr-1 text-zinc-500" />
                            <span>
                              {testResults[activeTestCase].executionTime} s
                            </span>
                          </div>
                        )}
                        {testResults[activeTestCase].memoryUsed && (
                          <div className="flex items-center">
                            <MemoryStick className="h-3 w-3 mr-1 text-zinc-500" />
                            <span>
                              {(
                                testResults[activeTestCase].memoryUsed / 1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    {testResults[activeTestCase].error ? (
                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-md overflow-auto text-xs text-red-800 dark:text-red-200">
                        {testResults[activeTestCase].error}
                      </div>
                    ) : (
                      <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-xs">
                        {JSON.stringify(
                          testResults[activeTestCase].output,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Difference Highlighter for failed test cases */}
              {testResults[activeTestCase] &&
                !testResults[activeTestCase].passed &&
                !testResults[activeTestCase].error && (
                  <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                        Difference Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="text-xs space-y-2">
                        <p>
                          The expected output and your output differ in the
                          following ways:
                        </p>
                        <DifferenceHighlighter
                          expected={testCases[activeTestCase].expectedOutput}
                          actual={testResults[activeTestCase].output}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm font-medium">
                    Test Case Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm">
                    {testCases[activeTestCase].explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Console Output */}
              {testResults[activeTestCase]?.consoleOutput &&
                testResults[activeTestCase].consoleOutput.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm font-medium">
                        Console Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-xs">
                        {testResults[activeTestCase].consoleOutput.join("\n")}
                      </pre>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            {testResults[activeTestCase]?.error && (
              <TabsContent value="error">
                <Card className="border-red-500">
                  <CardHeader className="py-2 px-4 bg-red-50 dark:bg-red-950/20">
                    <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Error Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-red-800 dark:text-red-200 text-sm">
                        {testResults[activeTestCase].error}
                      </div>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ArrowRight className="h-3 w-3 mr-2" /> Debugging
                            Tips
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs">
                          <h4 className="font-medium mb-2">Common Causes:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Syntax errors in your code</li>
                            <li>Accessing properties of undefined objects</li>
                            <li>Array index out of bounds</li>
                            <li>Type mismatches in function parameters</li>
                            <li>Infinite loops or recursion</li>
                          </ul>
                          <Separator className="my-2" />
                          <h4 className="font-medium mb-2">Suggestions:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>
                              Check the error message for line numbers and
                              specific issues
                            </li>
                            <li>
                              Add console.log statements to debug variable
                              values
                            </li>
                            <li>
                              Verify your function signature matches the
                              expected format
                            </li>
                            <li>
                              Test edge cases like empty arrays or null inputs
                            </li>
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
};

// Helper component to highlight differences between expected and actual output
const DifferenceHighlighter = ({
  expected,
  actual,
}: {
  expected: any;
  actual: any;
}) => {
  // Simple difference display for primitive types
  if (typeof expected !== typeof actual) {
    return (
      <div className="space-y-1">
        <p>Type mismatch:</p>
        <p>
          - Expected type:{" "}
          <span className="font-mono text-green-600 dark:text-green-400">
            {typeof expected}
          </span>
        </p>
        <p>
          - Your output type:{" "}
          <span className="font-mono text-red-600 dark:text-red-400">
            {typeof actual}
          </span>
        </p>
      </div>
    );
  }

  // For arrays
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      return (
        <div className="space-y-1">
          <p>Array length mismatch:</p>
          <p>
            - Expected length:{" "}
            <span className="font-mono text-green-600 dark:text-green-400">
              {expected.length}
            </span>
          </p>
          <p>
            - Your output length:{" "}
            <span className="font-mono text-red-600 dark:text-red-400">
              {actual.length}
            </span>
          </p>
        </div>
      );
    }

    // Find first differing element
    for (let i = 0; i < expected.length; i++) {
      if (JSON.stringify(expected[i]) !== JSON.stringify(actual[i])) {
        return (
          <div className="space-y-1">
            <p>Array element at index {i} differs:</p>
            <p>
              - Expected:{" "}
              <span className="font-mono text-green-600 dark:text-green-400">
                {JSON.stringify(expected[i])}
              </span>
            </p>
            <p>
              - Your output:{" "}
              <span className="font-mono text-red-600 dark:text-red-400">
                {JSON.stringify(actual[i])}
              </span>
            </p>
          </div>
        );
      }
    }
  }

  // For objects
  if (
    typeof expected === "object" &&
    expected !== null &&
    typeof actual === "object" &&
    actual !== null
  ) {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);

    // Check for missing or extra keys
    const missingKeys = expectedKeys.filter((key) => !actualKeys.includes(key));
    const extraKeys = actualKeys.filter((key) => !expectedKeys.includes(key));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      return (
        <div className="space-y-1">
          {missingKeys.length > 0 && (
            <p>
              Missing keys:{" "}
              <span className="font-mono text-amber-600 dark:text-amber-400">
                {missingKeys.join(", ")}
              </span>
            </p>
          )}
          {extraKeys.length > 0 && (
            <p>
              Extra keys:{" "}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {extraKeys.join(", ")}
              </span>
            </p>
          )}
        </div>
      );
    }

    // Check for differing values
    for (const key of expectedKeys) {
      if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
        return (
          <div className="space-y-1">
            <p>Value for key "{key}" differs:</p>
            <p>
              - Expected:{" "}
              <span className="font-mono text-green-600 dark:text-green-400">
                {JSON.stringify(expected[key])}
              </span>
            </p>
            <p>
              - Your output:{" "}
              <span className="font-mono text-red-600 dark:text-red-400">
                {JSON.stringify(actual[key])}
              </span>
            </p>
          </div>
        );
      }
    }
  }

  // For primitive values
  return (
    <div className="space-y-1">
      <p>Values differ:</p>
      <p>
        - Expected:{" "}
        <span className="font-mono text-green-600 dark:text-green-400">
          {JSON.stringify(expected)}
        </span>
      </p>
      <p>
        - Your output:{" "}
        <span className="font-mono text-red-600 dark:text-red-400">
          {JSON.stringify(actual)}
        </span>
      </p>
    </div>
  );
};

export default TestCasePanel;
