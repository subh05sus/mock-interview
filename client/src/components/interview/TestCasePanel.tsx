/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "../ui/card";
import { CheckCircle, Cpu, MemoryStick, XCircle } from "lucide-react";
import { Button } from "../ui/button";

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
  if (testCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-500">No test cases available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {testCases.map((_, index) => (
          <Button
            key={index}
            variant={activeTestCase === index ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTestCase(index)}
            className="flex items-center"
          >
            Case {index + 1}
            {testResults[index] && (
              <span className="ml-2">
                {testResults[index].passed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </span>
            )}
          </Button>
        ))}
      </div>

      {testCases[activeTestCase] && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Input</h4>
                <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-sm">
                  {JSON.stringify(testCases[activeTestCase].input, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Expected Output</h4>
                <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-sm">
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
            <div>
              <Card
                className={
                  testResults[activeTestCase].passed
                    ? "border-green-500"
                    : "border-red-500"
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Your Output</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      {testResults[activeTestCase].executionTime && (
                        <div className="flex items-center">
                          <Cpu className="h-4 w-4 mr-1 text-zinc-500" />
                          <span>
                            {testResults[activeTestCase].executionTime} s
                          </span>
                        </div>
                      )}
                      {testResults[activeTestCase].memoryUsed && (
                        <div className="flex items-center">
                          <MemoryStick className="h-4 w-4 mr-1 text-zinc-500" />
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
                  {testResults[activeTestCase].error ? (
                    <div className="bg-red-100 dark:bg-red-900 p-2 rounded-md overflow-auto text-sm text-red-800 dark:text-red-200">
                      {testResults[activeTestCase].error}
                    </div>
                  ) : (
                    <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-sm">
                      {JSON.stringify(
                        testResults[activeTestCase].output,
                        null,
                        2
                      )}
                    </pre>
                  )}

                  {/* Display console output if available */}
                  {testResults[activeTestCase].consoleOutput &&
                    testResults[activeTestCase].consoleOutput.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Console Output</h4>
                        <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md overflow-auto text-sm">
                          {testResults[activeTestCase].consoleOutput.join("\n")}
                        </pre>
                      </div>
                    )}
                </CardContent>
              </Card>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Explanation</h4>
                <p className="text-sm">
                  {testCases[activeTestCase].explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCasePanel;
