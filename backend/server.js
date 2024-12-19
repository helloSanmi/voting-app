// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getDbPool } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/vote", require("./routes/vote"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/public", require("./routes/public"));

const PORT = process.env.PORT || 5000;

getDbPool().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
