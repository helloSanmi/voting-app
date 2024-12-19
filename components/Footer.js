// components/Footer.js
export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} My Voting Platform. All rights reserved.</p>
        </div>
      </footer>
    );
  }
  