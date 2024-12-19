// backend/routes/public.js
const express = require("express");
const { getDbPool, sql } = require("../db");
const router = express.Router();

router.get("/period", async (req, res) => {
try {
const pool = await getDbPool();
const periodResult = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
if (periodResult.recordset.length === 0) {
return res.json(null);
}
res.json(periodResult.recordset[0]);
} catch (error) {
res.status(500).json({ error: "Error fetching period" });
}
});

router.get("/candidates", async (req, res) => {
const { periodId } = req.query;
try {
const pool = await getDbPool();
let periodQuery = periodId ? 
`SELECT * FROM Candidates WHERE periodId = @periodId AND published = 1`
: 
`SELECT TOP 1 id FROM VotingPeriod ORDER BY id DESC;`
if (!periodId) {
const pr = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
if (pr.recordset.length === 0) return res.json([]);
const pid = pr.recordset[0].id;
const cr = await pool.request().input("periodId", sql.Int, pid).query("SELECT * FROM Candidates WHERE periodId = @periodId AND published = 1");
return res.json(cr.recordset);
} else {
const cr = await pool.request().input("periodId", sql.Int, periodId).query("SELECT * FROM Candidates WHERE periodId = @periodId AND published = 1");
return res.json(cr.recordset);
}
} catch (error) {
res.status(500).json({ error: "Error fetching candidates" });
}
});

router.get("/public-results", async (req, res) => {
const { periodId } = req.query;
try {
const pool = await getDbPool();
let query = "SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC";
if (periodId) {
query = "SELECT * FROM VotingPeriod WHERE id = @periodId";
}
const periodResult = periodId ? 
await pool.request().input("periodId", sql.Int, periodId).query(query)
: 
await pool.request().query(query);
if (periodResult.recordset.length === 0) {
return res.json({ results: [], published: false });
}
const period = periodResult.recordset[0];
if (!period.resultsPublished) {
return res.json({ results: [], published: false });
}
const result = await pool.request().input("periodId", sql.Int, period.id).query(`
SELECT name, lga, photoUrl, votes FROM Candidates WHERE periodId = @periodId ORDER BY votes DESC
`);
res.json({ results: result.recordset, published: true });
} catch (error) {
res.status(500).json({ error: "Error fetching results" });
}
});

router.get("/uservote", async (req, res) => {
const { userId, periodId } = req.query;
if (!userId || !periodId) return res.json({});
try {
const pool = await getDbPool();
const voteResult = await pool
.request()
.input("userId", sql.Int, userId)
.input("periodId", sql.Int, periodId)
.query("SELECT * FROM Votes WHERE userId = @userId AND periodId = @periodId");
if (voteResult.recordset.length > 0) {
return res.json({ candidateId: voteResult.recordset[0].candidateId });
} else {
return res.json({});
}
} catch (error) {
res.status(500).json({ error: "Error checking user vote" });
}
});

router.get("/periods", async (req, res) => {
try {
const pool = await getDbPool();
const result = await pool.request().query("SELECT * FROM VotingPeriod WHERE resultsPublished = 1 ORDER BY id DESC");
res.json(result.recordset);
} catch (error) {
res.status(500).json({ error: "Error fetching periods" });
}
});

module.exports = router;
