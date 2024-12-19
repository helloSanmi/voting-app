// frontend/components/Layout.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoggedIn(false);
      setIsAdmin(false);
      setUserName("");
      setCheckComplete(true);
      return;
    }

    const fetchUser = async () => {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.ok) {
        const userData = await res.json();
        setLoggedIn(true);
        setUserName(userData.name);
        if (userData.email === "admin" || userData.email === "admin@example.com" || userData.id === 9999) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        localStorage.removeItem("token");
        setLoggedIn(false);
        setIsAdmin(false);
        setUserName("");
      }
      setCheckComplete(true);
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  if (!checkComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12"></div>
        <style jsx>{`
          .loader {
            border-top-color: #3498db;
            animation: spinner 1s linear infinite;
          }
          @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12"></div>
          <style jsx>{`
            .loader {
              border-top-color: #3498db;
              animation: spinner 1s linear infinite;
            }
            @keyframes spinner {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 cursor-pointer" />
            </Link>
            {loggedIn && (
              <span className="text-gray-800 font-medium">Hi, {userName}</span>
            )}
          </div>
          <nav className="flex flex-wrap space-x-3 items-center justify-center">
            {!loggedIn && (
              <>
                <Link href="/register">
                  <span className="cursor-pointer px-3 py-1 bg-blue-200 text-gray-800 rounded hover:bg-blue-300 hover:scale-105 transform transition">
                    Register
                  </span>
                </Link>
                <Link href="/login">
                  <span className="cursor-pointer px-3 py-1 bg-blue-200 text-gray-800 rounded hover:bg-blue-300 hover:scale-105 transform transition">
                    Login
                  </span>
                </Link>
              </>
            )}
            {loggedIn && !isAdmin && (
              <>
                <Link href="/vote">
                  <span className="cursor-pointer px-3 py-1 bg-blue-200 text-gray-800 rounded hover:bg-blue-300 hover:scale-105 transform transition">
                    Vote
                  </span>
                </Link>
                <Link href="/results">
                  <span className="cursor-pointer px-3 py-1 bg-blue-200 text-gray-800 rounded hover:bg-blue-300 hover:scale-105 transform transition">
                    Results
                  </span>
                </Link>
                <Link href="/past-results">
                  <span className="cursor-pointer px-3 py-1 bg-blue-200 text-gray-800 rounded hover:bg-blue-300 hover:scale-105 transform transition">
                    Past Results
                  </span>
                </Link>
              </>
            )}
            {loggedIn && isAdmin && (
              <Link href="/admin">
                <span className="cursor-pointer px-3 py-1 bg-blue-200 text-gray-800 rounded hover:bg-blue-300 hover:scale-105 transform transition">
                  Admin
                </span>
              </Link>
            )}
            {loggedIn && (
              <span
                onClick={handleLogout}
                className="cursor-pointer px-3 py-1 bg-red-200 text-gray-800 rounded hover:bg-red-300 hover:scale-105 transform transition"
              >
                Logout
              </span>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
      <footer className="p-4 bg-white shadow text-center text-gray-600">
        &copy; {new Date().getFullYear()} Voting App. All rights reserved.
      </footer>
    </div>
  );
}
