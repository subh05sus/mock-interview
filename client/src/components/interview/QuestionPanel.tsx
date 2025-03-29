/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tab } from "@headlessui/react";

interface QuestionPanelProps {
  question: any;
  job: any;
  theme: string;
}

export default function QuestionPanel({
  question,
  job,
  theme,
}: QuestionPanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!question) return null;

  const tabClass = (index: number) => `
    px-4 py-2 text-sm font-medium rounded-t-lg
    ${
      activeTab === index
        ? theme === "dark"
          ? "bg-slate-800 text-white border-b-2 border-blue-500"
          : "bg-white text-gray-900 border-b-2 border-blue-500"
        : theme === "dark"
        ? "bg-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white"
        : "bg-slate-200 text-gray-700 hover:bg-slate-300 hover:text-gray-900"
    }
  `;

  return (
    <div
      className={`w-1/2 flex flex-col ${
        theme === "dark" ? "bg-slate-800" : "bg-white"
      }`}
    >
      <Tab.Group onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 p-2 border-b border-gray-300 dark:border-gray-700">
          <Tab className={({ selected }) => tabClass(selected ? 0 : -1)}>
            Description
          </Tab>
          <Tab className={({ selected }) => tabClass(selected ? 1 : -1)}>
            Hints
          </Tab>
          <Tab className={({ selected }) => tabClass(selected ? 2 : -1)}>
            Related
          </Tab>
        </Tab.List>

        <Tab.Panels className="flex-1 overflow-auto p-4">
          <Tab.Panel>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{question.title}</h2>
                <div
                  className={`px-2 py-1 text-xs rounded-full ${
                    question.difficulty === "Easy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : question.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {question.difficulty}
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Job: {job?.title}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{question.description}</ReactMarkdown>
              </div>

              {question.examples && question.examples.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Examples</h3>
                  {question.examples.map((example, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                      }`}
                    >
                      <div className="font-mono whitespace-pre-wrap">
                        {example}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.constraints && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Constraints</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{question.constraints}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hints</h3>
              {question.hints && question.hints.length > 0 ? (
                <div className="space-y-2">
                  {question.hints.map((hint, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                      }`}
                    >
                      <div className="font-medium">Hint {index + 1}</div>
                      <div className="mt-1">{hint}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No hints available for this question.
                </div>
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Related Questions</h3>
              {question.relatedQuestions &&
              question.relatedQuestions.length > 0 ? (
                <div className="space-y-2">
                  {question.relatedQuestions.map((related, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                      }`}
                    >
                      <div className="font-medium">{related.title}</div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {related.difficulty}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No related questions available.
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
