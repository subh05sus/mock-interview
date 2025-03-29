"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useTheme } from "../../contexts/ThemeContext";

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageSelector({
  language,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { theme } = useTheme();

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.id === language) || languages[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium ${
            theme === "dark"
              ? "bg-slate-700 text-white hover:bg-slate-600"
              : "bg-white text-gray-900 hover:bg-slate-50"
          } border border-gray-300 dark:border-gray-600`}
        >
          {currentLanguage.name}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            theme === "dark" ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <Menu.Item key={lang.id}>
                {({ active }) => (
                  <button
                    onClick={() => onLanguageChange(lang.id)}
                    className={`${
                      active
                        ? theme === "dark"
                          ? "bg-slate-700 text-white"
                          : "bg-slate-100 text-gray-900"
                        : theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    } block w-full text-left px-4 py-2 text-sm`}
                  >
                    {lang.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
