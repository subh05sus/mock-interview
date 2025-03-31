import { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  height = "70vh",
}: CodeEditorProps) {
  const [theme, setTheme] = useState("vs-dark");

  // Map language to Monaco editor language
  const getMonacoLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      javascript: "javascript",
      python: "python",
      java: "java",
      cpp: "cpp",
      csharp: "csharp",
    };
    return languageMap[lang.toLowerCase()] || "javascript";
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-zinc-800 text-white px-4 py-2 flex justify-between items-center">
        <span className="font-medium">{language}</span>
        <button
          onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
          className="text-sm bg-zinc-700 px-2 py-1 rounded hover:bg-zinc-600"
        >
          Toggle Theme
        </button>
      </div>
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        theme={theme}
        onChange={(value) => onChange(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
