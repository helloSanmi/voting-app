// backend/routes/admin.js
const express = require("express");
const { getDbPool, sql } = require("../db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email === "admin" || decoded.email === "admin@example.com" || decoded.id === 9999) {
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      return next();
    } else {
      return res.status(403).json({ error: "Not admin" });
    }
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Set Voting Period
router.post("/set-voting-period", adminMiddleware, async (req, res) => {
  const { startTime, endTime } = req.body;
  try {
    const pool = await getDbPool();
    const insertResult = await pool
      .request()
      .input("startTime", sql.DateTime2, startTime)
      .input("endTime", sql.DateTime2, endTime)
      .input("forcedEnded", sql.Bit, 0)
      .query("INSERT INTO VotingPeriod (startTime, endTime, resultsPublished, forcedEnded) OUTPUT INSERTED.id VALUES (@startTime, @endTime, 0, @forcedEnded)");

    const periodId = insertResult.recordset[0].id;
    res.status(201).json({ message: "Voting period set", periodId });
  } catch (error) {
    res.status(500).json({ error: "Error setting voting period" });
  }
});

// Add Candidate
router.post("/add-candidate", adminMiddleware, async (req, res) => {
  const { name, lga, photoUrl } = req.body;
  try {
    const pool = await getDbPool();
    const periodResult = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
    if (periodResult.recordset.length === 0) {
      return res.status(400).json({ error: "No voting period set" });
    }
    const periodId = periodResult.recordset[0].id;

    // backend/routes/admin.js (continued)
    await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("lga", sql.NVarChar, lga)
      .input("photoUrl", sql.NVarChar, photoUrl)
      .input("periodId", sql.Int, periodId)
      .query("INSERT INTO Candidates (name, lga, photoUrl, periodId, published, votes) VALUES (@name, @lga, @photoUrl, @periodId, 0, 0)");

    res.status(201).json({ message: "Candidate added" });
  } catch (error) {
    res.status(500).json({ error: "Error adding candidate" });
  }
});

// Publish Candidates
router.post("/publish-candidates", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const periodResult = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
    if (periodResult.recordset.length === 0) {
      return res.status(400).json({ error: "No voting period set" });
    }
    const periodId = periodResult.recordset[0].id;

    await pool.request().input("periodId", sql.Int, periodId).query("UPDATE Candidates SET published = 1 WHERE periodId = @periodId");
    res.json({ message: "Candidates published" });
  } catch (error) {
    res.status(500).json({ error: "Error publishing candidates" });
  }
});

// End Voting
router.post("/end-voting", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    await pool.request().query("UPDATE VotingPeriod SET forcedEnded = 1 WHERE id = (SELECT TOP 1 id FROM VotingPeriod ORDER BY id DESC)");
    res.json({ message: "Voting ended early" });
  } catch (error) {
    res.status(500).json({ error: "Error ending voting" });
  }
});

// Publish Results
router.post("/publish-results", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const periodResult = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
    if (periodResult.recordset.length === 0) {
      return res.status(400).json({ error: "No voting period set" });
    }
    const period = periodResult.recordset[0];
    const now = new Date();
    const end = new Date(period.endTime);
    if (now < end && !period.forcedEnded) {
      return res.status(400).json({ error: "Cannot publish results before voting has ended or been forced to end" });
    }
    await pool.request().query("UPDATE VotingPeriod SET resultsPublished = 1 WHERE id = (SELECT TOP 1 id FROM VotingPeriod ORDER BY id DESC)");
    res.json({ message: "Results published" });
  } catch (error) {
    res.status(500).json({ error: "Error publishing results" });
  }
});

// Get Current Period
router.get("/get-period", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching voting period" });
  }
});

// Get Candidates (Current Period)
router.get("/get-candidates", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const periodResult = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
    if (periodResult.recordset.length === 0) {
      return res.json([]);
    }
    const periodId = periodResult.recordset[0].id;
    const result = await pool.request().input("periodId", sql.Int, periodId).query("SELECT * FROM Candidates WHERE periodId = @periodId");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error fetching candidates" });
  }
});

// Get Results (Current Period)
router.get("/results", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const periodResult = await pool.request().query("SELECT TOP 1 * FROM VotingPeriod ORDER BY id DESC");
    if (periodResult.recordset.length === 0) {
      return res.json([]);
    }
    const periodId = periodResult.recordset[0].id;
    const result = await pool.request().input("periodId", sql.Int, periodId).query("SELECT name, lga, photoUrl, votes FROM Candidates WHERE periodId = @periodId ORDER BY votes DESC");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error fetching results" });
  }
});

// List All Periods
router.get("/periods", adminMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query("SELECT * FROM VotingPeriod ORDER BY id DESC");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error fetching periods" });
  }
});

// Get Candidates for a specific Past Period
router.get("/candidates", adminMiddleware, async (req, res) => {
  const { periodId } = req.query;
  if (!periodId) return res.json([]);
  try {
    const pool = await getDbPool();
    const result = await pool.request().input("periodId", sql.Int, periodId).query("SELECT * FROM Candidates WHERE periodId = @periodId");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error fetching candidates" });
  }
});

// Get Results for a specific Past Period
router.get("/results", adminMiddleware, async (req, res) => {
  const { periodId } = req.query;
  if (!periodId) return res.json([]);
  try {
    const pool = await getDbPool();
    const result = await pool.request().input("periodId", sql.Int, periodId).query("SELECT name, lga, photoUrl, votes FROM Candidates WHERE periodId = @periodId ORDER BY votes DESC");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error fetching results" });
  }
});

module.exports = router;
