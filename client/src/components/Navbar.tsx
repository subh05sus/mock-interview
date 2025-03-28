"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
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
                  className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
