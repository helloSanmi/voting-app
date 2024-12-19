// frontend/pages/results.js
// Center "Results not published yet" message at center of page

import { useState, useEffect } from "react";

export default function Results() {
  const [results, setResults] = useState([]);
  const [canView, setCanView] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchResults = async () => {
    const res = await fetch("http://localhost:5000/api/public/public-results");
    const data = await res.json();
    if (data.published) {
      setCanView(true);
      setResults(data.results);
      const sum = data.results.reduce((acc, cur) => acc + cur.votes, 0);
      setTotalVotes(sum);
    } else {
      setCanView(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Results not published yet</h1>
          <p className="text-gray-700">Check back later or refresh once admin publishes results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Election Results</h1>
        <p className="mb-8 text-gray-700 text-center">Total Votes Cast: {totalVotes}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {results.map((result) => (
            <div key={result.name} className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center text-center">
              <img
                src={result.photoUrl || "/placeholder.png"}
                alt={result.name}
                className="w-24 h-24 rounded-full mb-4 object-cover"
              />
              <h2 className="text-lg font-semibold text-gray-700">{result.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{result.lga}</p>
              <span className="text-xl font-bold text-blue-600">{result.votes} Votes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
