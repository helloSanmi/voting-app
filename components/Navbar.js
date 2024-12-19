// components/Navbar.js
export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-xl font-semibold">Voting Platform</a>
        <div>
          <a href="/login" className="px-4 py-2 rounded-md hover:bg-blue-700 transition">Login</a>
          <a href="/register" className="ml-4 px-4 py-2 rounded-md hover:bg-blue-700 transition">Register</a>
        </div>
      </div>
    </nav>
  );
}
