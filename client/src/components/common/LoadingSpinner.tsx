"use client";

import { useTheme } from "../../contexts/ThemeContext";

export default function LoadingSpinner() {
  const { theme } = useTheme();

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${
        theme === "dark" ? "bg-zinc-900" : "bg-zinc-50"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p
          className={`mt-4 text-lg font-medium ${
            theme === "dark" ? "text-white" : "text-zinc-900"
          }`}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
