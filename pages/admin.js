// frontend/pages/admin.js
// Change "Admin Panel" to "Administrative Page", center it
// Arrange each frame side by side (use a responsive grid)
// More professional look

import { useState, useEffect } from "react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("current");
  const [periods, setPeriods] = useState([]);
  const [selectedPastPeriod, setSelectedPastPeriod] = useState(null);
  const [name, setName] = useState("");
  const [lga, setLga] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [period, setPeriod] = useState(null);
  const [pastCandidates, setPastCandidates] = useState([]);
  const [pastResults, setPastResults] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": "Bearer " + token } : {})
  };

  const loadCurrentData = async () => {
    await loadCurrentPeriod();
    await loadCandidates();
    await loadResults();
  };

  const loadAllPeriods = async () => {
    const res = await fetch("http://localhost:5000/api/admin/periods", { headers });
    const data = await res.json();
    if (Array.isArray(data)) {
      setPeriods(data);
    }
  };

  useEffect(() => {
    loadCurrentData();
    loadAllPeriods();
  }, []);

  const loadCurrentPeriod = async () => {
    const res = await fetch("http://localhost:5000/api/admin/get-period", { headers });
    const data = await res.json();
    setPeriod(data);
  };

  const loadCandidates = async () => {
    const res = await fetch("http://localhost:5000/api/admin/get-candidates", { headers });
    const data = await res.json();
    if (Array.isArray(data)) setCandidates(data);
  };

  const loadResults = async () => {
    const res = await fetch("http://localhost:5000/api/admin/results", { headers });
    const data = await res.json();
    if (Array.isArray(data)) setResults(data);
  };

  const setVotingPeriod = async () => {
    const res = await fetch("http://localhost:5000/api/admin/set-voting-period", {
      method: "POST",
      headers,
      body: JSON.stringify({ startTime, endTime })
    });
    if (res.ok) {
      setMessage("Voting period set");
      loadCurrentPeriod();
    } else {
      setMessage("Error setting voting period");
    }
  };

  const addCandidate = async () => {
    const res = await fetch("http://localhost:5000/api/admin/add-candidate", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, lga, photoUrl })
    });
    if (res.ok) {
      setName("");
      setLga("");
      setPhotoUrl("");
      setMessage("Candidate added successfully");
      loadCandidates();
    } else {
      setMessage("Error adding candidate");
    }
  };

  const publishCandidates = async () => {
    const res = await fetch("http://localhost:5000/api/admin/publish-candidates", {
      method: "POST",
      headers
    });
    if (res.ok) {
      setMessage("Candidates published and visible to users");
      setShowPreview(false);
      loadCandidates();
    } else {
      setMessage("Error publishing candidates");
    }
  };

  const publishResults = async () => {
    const res = await fetch("http://localhost:5000/api/admin/publish-results", {
      method: "POST",
      headers
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Results published");
      loadCurrentPeriod();
    } else {
      setMessage(data.error || "Error publishing results");
    }
  };

  const endVotingEarly = async () => {
    const res = await fetch("http://localhost:5000/api/admin/end-voting", {
      method: "POST",
      headers
    });
    if (res.ok) {
      setMessage("Voting ended early");
      loadCurrentPeriod();
    } else {
      setMessage("Error ending voting");
    }
  };

  const loadPastPeriodData = async (pId) => {
    const candidatesRes = await fetch(`http://localhost:5000/api/admin/candidates?periodId=${pId}`, { headers });
    const candidatesData = await candidatesRes.json();
    setPastCandidates(candidatesData || []);

    const resultsRes = await fetch(`http://localhost:5000/api/admin/results?periodId=${pId}`, { headers });
    const resultsData = await resultsRes.json();
    setPastResults(resultsData || []);
  };

  useEffect(() => {
    if (selectedPastPeriod) {
      loadPastPeriodData(selectedPastPeriod);
    }
  }, [selectedPastPeriod]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-10">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Administrative Page</h1>
      {message && <p className="text-gray-700 font-medium text-center">{message}</p>}

      <div className="flex space-x-4 border-b pb-2 justify-center">
        <button 
          onClick={() => setActiveTab("current")} 
          className={`pb-2 ${activeTab === "current" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} focus:outline-none`}
        >
          Current Period
        </button>
        <button 
          onClick={() => setActiveTab("past")} 
          className={`pb-2 ${activeTab === "past" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} focus:outline-none`}
        >
          Past Periods
        </button>
      </div>

      {activeTab === "current" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow space-y-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Set Voting Period</h2>
              <button onClick={loadCurrentData} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded">Refresh</button>
            </div>
            <div className="space-y-4">
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <button onClick={setVotingPeriod} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition w-full">Set Period</button>
            </div>
            {period && (
              <div className="text-gray-600 mt-2 text-sm">
                <p>Period ID: {period.id}</p>
                <p>Starts: {new Date(period.startTime).toLocaleString()}</p>
                <p>Ends: {new Date(period.endTime).toLocaleString()}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={endVotingEarly} className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition">End Voting Now</button>
                  {!period.resultsPublished && (
                    <button onClick={publishResults} className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition">
                      Publish Results
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Add Candidate (Current Period)</h2>
            <div className="space-y-2">
              <input
                placeholder="Candidate Name"
                className="border p-2 rounded w-full"
                value={name}
                onChange={(e) => setName(e.target.value.trim())}
              />
              <input
                placeholder="LGA"
                className="border p-2 rounded w-full"
                value={lga}
                onChange={(e) => setLga(e.target.value.trim())}
              />
              <input
                placeholder="Photo URL"
                className="border p-2 rounded w-full"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value.trim())}
              />
              <button onClick={addCandidate} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition w-full">Add Candidate</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Preview Candidates</h2>
              <button onClick={() => setShowPreview(!showPreview)} className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition">
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
            </div>
            {showPreview && (
              <div className="border p-4 rounded mb-4 space-y-4 bg-gray-50 max-h-64 overflow-auto">
                <h3 className="text-lg font-bold">Candidates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {candidates.map(c => (
                    <div key={c.id} className="border p-4 rounded flex flex-col items-center bg-white">
                      <img src={c.photoUrl || "/placeholder.png"} alt={c.name} className="w-24 h-24 rounded-full mb-2 object-cover" />
                      <h4 className="font-semibold text-center text-gray-700 text-sm">{c.name}</h4>
                      <p className="text-xs text-center text-gray-600">{c.lga}</p>
                    </div>
                  ))}
                </div>
                <button onClick={publishCandidates} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition w-full">Publish Candidates</button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Live Results (Current Period)</h2>
              <button onClick={loadResults} className="bg-gray-300 py-1 px-3 rounded hover:bg-gray-400 transition">Refresh</button>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Candidate</th>
                    <th className="border p-2">LGA</th>
                    <th className="border p-2">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.name}>
                      <td className="border p-2">{r.name}</td>
                      <td className="border p-2">{r.lga}</td>
                      <td className="border p-2">{r.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "past" && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Past Voting Periods</h2>
            <button onClick={loadAllPeriods} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded">
              Refresh Periods
            </button>
          </div>
          <select 
            className="border p-2 rounded w-full"
            value={selectedPastPeriod || ""}
            onChange={(e) => setSelectedPastPeriod(e.target.value)}
          >
            <option value="">Select a Past Period</option>
            {periods.filter(p => p.id !== (period ? period.id : null)).map(p => (
              <option key={p.id} value={p.id}>
                Period {p.id} (Starts: {new Date(p.startTime).toLocaleString()}, Ends: {new Date(p.endTime).toLocaleString()})
              </option>
            ))}
          </select>

          {selectedPastPeriod && pastCandidates.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-700 mt-4">Candidates for Period {selectedPastPeriod}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pastCandidates.map(c => (
                  <div key={c.id} className="border p-4 rounded flex flex-col items-center bg-gray-50">
                    <img src={c.photoUrl || "/placeholder.png"} alt={c.name} className="w-24 h-24 rounded-full mb-2 object-cover" />
                    <h4 className="font-semibold text-center text-gray-700">{c.name}</h4>
                    <p className="text-sm text-center text-gray-600">{c.lga}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-gray-700 mt-8">Results for Period {selectedPastPeriod}</h3>
              <div className="max-h-64 overflow-auto">
                <table className="w-full border-collapse text-left text-sm mt-4">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Candidate</th>
                      <th className="border p-2">LGA</th>
                      <th className="border p-2">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastResults.map(r => (
                      <tr key={r.name}>
                        <td className="border p-2">{r.name}</td>
                        <td className="border p-2">{r.lga}</td>
                        <td className="border p-2">{r.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
