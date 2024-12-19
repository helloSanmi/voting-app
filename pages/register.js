// frontend/pages/register.js
// Add forgot password link here too (not common practice, but user requested).
// Actually, "Forgot Password" is usually on login page, not register.
// We can add a link on register that leads them to login's forgot password.
// Or a separate modal. We'll do a link to the login page.

import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value.trim()});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.token) {
        localStorage.setItem("token", loginData.token);
        const meRes = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            "Authorization": "Bearer " + loginData.token
          }
        });
        const meData = await meRes.json();
        if (meRes.ok && meData.id) {
          if (loginData.isAdmin) {
            localStorage.setItem("isAdmin", "true");
            localStorage.setItem("userId", meData.id);
            router.push("/admin");
          } else {
            localStorage.removeItem("isAdmin");
            localStorage.setItem("userId", meData.id);
            router.push("/");
          }
        } else {
          setErrorModal(true);
          setErrorMessage("Error fetching user info");
        }
      } else {
        setErrorModal(true);
        setErrorMessage("Error logging in after registration");
      }
    } else {
      setErrorModal(true);
      setErrorMessage(data.error || "Error registering user");
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-20">
      <div className="bg-white p-8 rounded-lg shadow-md w-full border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              placeholder="Your full name"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              placeholder="Choose a username"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              placeholder="yourname@example.com"
              required
              pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              placeholder="Choose a strong password"
              required
              minLength={6}
              title="Password must be at least 6 characters long"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-white h-5 w-5 mr-2"></div>
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/login" className="text-blue-600 underline text-sm">Forgot Password?</a>
        </div>
      </div>

      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 shadow-md w-full max-w-sm text-center">
            <p className="mb-4 text-gray-700">{errorMessage}</p>
            <button
              onClick={() => setErrorModal(false)}
              className="px-4 py-2 bg-red-200 text-gray-800 rounded hover:bg-red-300 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .loader {
          border-top-color: transparent;
          animation: spinner 0.6s linear infinite;
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
