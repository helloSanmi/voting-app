// Adjusted past-results.js (frontend/pages/past-results.js)
import { useState, useEffect } from 'react';

export default function PastResults() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    const res = await fetch("http://localhost:5000/api/public/periods");
    const data = await res.json();
    if (Array.isArray(data)) {
      setPeriods(data);
    }
  };

  const loadDataForPeriod = async (pId) => {
    const candidatesRes = await fetch(`http://localhost:5000/api/public/candidates?periodId=${pId}`);
    const candidatesData = await candidatesRes.json();
    setCandidates(candidatesData || []);

    const resultsRes = await fetch(`http://localhost:5000/api/public/public-results?periodId=${pId}`);
    const resultsData = await resultsRes.json();
    if (resultsData.published) {
      setResults(resultsData.results);
    } else {
      setResults([]);
    }
  };

  useEffect(() => {
    if (selectedPeriod) {
      loadDataForPeriod(selectedPeriod);
    }
  }, [selectedPeriod]);

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 text-center">Past Results</h1>
      <select 
        className="border p-2 rounded w-full"
        value={selectedPeriod || ""}
        onChange={(e) => setSelectedPeriod(e.target.value)}
      >
        <option value="">Select a Past Period</option>
        {periods.map(p => (
          <option key={p.id} value={p.id}>
            Period {p.id} (Starts: {new Date(p.startTime).toLocaleString()}, Ends: {new Date(p.endTime).toLocaleString()})
          </option>
        ))}
      </select>

      {selectedPeriod && candidates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Candidates for Period {selectedPeriod}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {candidates.map(c => (
              <div key={c.id} className="border p-4 rounded flex flex-col items-center bg-gray-50">
                <img src={c.photoUrl || "/placeholder.png"} alt={c.name} className="w-24 h-24 rounded-full mb-2 object-cover" />
                <h4 className="font-semibold text-center text-gray-700">{c.name}</h4>
                <p className="text-sm text-center text-gray-600">{c.lga}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPeriod && results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Results for Period {selectedPeriod}</h2>
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
      )}
    </div>
  );
}
