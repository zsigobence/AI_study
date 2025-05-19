const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./dbConfig");
const { ensureDirectoryExists } = require("./functions/noteFunctions");

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/notes", express.static(path.join(__dirname, "notes")));

// Csatlakozás adatbázishoz, mappa ellenőrzés
connectDB();
ensureDirectoryExists();

// Route-ok
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

app.use(userRoutes);
app.use(noteRoutes);

// Teszt route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
