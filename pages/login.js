// frontend/pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Processing...");
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      const meRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          "Authorization": "Bearer " + data.token
        }
      });
      const meData = await meRes.json();
      if (meRes.ok && meData.id) {
        if (data.isAdmin) {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("userId", meData.id);
          setMessage("Logged in, redirecting...");
          router.push("/admin");
        } else {
          localStorage.removeItem("isAdmin");
          localStorage.setItem("userId", meData.id);
          setMessage("Logged in successfully, redirecting...");
          router.push("/");
        }
      } else {
        setMessage("Error fetching user info");
      }
    } else {
      if (data.error && data.error.includes("not found")) {
        setShowModal(true);
        setMessage("");
      } else {
        setMessage(data.error || "Error logging in");
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Login</h1>
        {message && <p className="mb-4 text-gray-700">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              placeholder="Enter your email or username"
              required
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
              placeholder="Enter your password"
              required
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition">
            Login
          </button>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 shadow-md w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">User not found</h2>
            <p className="mb-4">You have not registered yet. Would you like to register?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowModal(false); router.push("/register"); }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
