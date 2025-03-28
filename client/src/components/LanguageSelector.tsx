interface LanguageSelectorProps {
  language: string;
  onChange: (language: string) => void;
}

export default function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="font-medium text-gray-700">
        Language:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
