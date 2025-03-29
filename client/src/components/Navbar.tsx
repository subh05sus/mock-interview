"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className={`${
        theme === "dark" ? "bg-slate-800" : "bg-slate-600"
      } text-white shadow-md`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          AI Mock Interview
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-indigo-200">
            Jobs
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/submissions" className="hover:text-indigo-200">
                My Submissions
              </Link>

              {isAdmin && (
                <Link to="/admin" className="hover:text-indigo-200">
                  Admin
                </Link>
              )}

              <div className="flex items-center space-x-2">
                <span>Hi, {user?.name}</span>
                <button
                  onClick={logout}
                  className={`${
                    theme === "dark" ? "bg-slate-700" : "bg-slate-700"
                  } px-3 py-1 rounded hover:bg-slate-800`}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className={`${
                  theme === "dark" ? "bg-slate-700" : "bg-slate-700"
                } px-3 py-1 rounded hover:bg-slate-800`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-slate-100"
              >
                Register
              </Link>
            </div>
          )}

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === "dark" ? "bg-slate-700" : "bg-slate-700"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
