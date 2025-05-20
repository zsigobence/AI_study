const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;
const multer = require("multer");

const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const { NoteCollection } = require("../dbConfig");
const {
  generateTFQuestions,
  generateSQSAQuestions,
  evaluate_question,
} = require("../functions/aiFunctions");
const {
  ensureDirectoryExists,
  saveFile,
  processPdf,
} = require("../functions/noteFunctions");

// Multer beállítás
ensureDirectoryExists();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "notes"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Feltöltés
router.post("/upload", authenticateToken, upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Nincs feltöltött fájl!" });

  const subjectName = req.body.subject;
  const newNote = new NoteCollection({
    title: req.file.originalname,
    subject: subjectName,
    filePath: req.file.path,
    filename: req.file.filename,
    size: req.file.size,
    owner: req.user.userId,
    questions: [],
  });

  try {
    await newNote.save();
    res.status(200).json({ message: "Fájl sikeresen feltöltve és mentve az adatbázisba!" });
  } catch (err) {
    console.error("DB mentési hiba:", err);
    res.status(500).json({ message: "Adatbázis mentési hiba!" });
  }
});

// Jegyzet lista
router.get("/notes", async (req, res) => {
  try {
    const notes = await NoteCollection.find({});
    res.json({ success: true, notes });
  } catch {
    res.status(500).json({ success: false, message: "Lekérdezési hiba" });
  }
});

// Jegyzet törlés
router.delete("/notes/:noteTitle", async (req, res) => {
  const noteTitle = req.params.noteTitle;

  if (!noteTitle) return res.status(400).json({ error: "Jegyzet neve szükséges!" });

  try {
    const deletedNote = await NoteCollection.findOneAndDelete({ title: noteTitle });
    if (!deletedNote) return res.status(404).json({ error: "Jegyzet nem található!" });

    const filePath = path.join("notes", noteTitle);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "Jegyzet sikeresen törölve!" });
  } catch {
    res.status(500).json({ error: "Törlési hiba!" });
  }
});

// Jegyzet szövegének megtekintése
router.get("/view_note", async (req, res) => {
  const { fileName } = req.query;
  if (!fileName) return res.status(400).json({ message: "Hiányzó fájlnév!" });

  try {
    const filePath = path.resolve(__dirname, "..", "notes", fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Fájl nem található!" });

    const buffer = await fsPromises.readFile(filePath);
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    res.json({ success: true, text: data.text });
  } catch {
    res.status(500).json({ message: "Megnyitási hiba!" });
  }
});

// Kérdések generálása
router.get("/generate_questions", authenticateToken, async (req, res) => {
  try {
    const { type, subject, note } = req.query;
    const userId = req.user.userId;

    const noteDoc = await NoteCollection.findOne({ subject, title: note, owner: userId });
    if (!noteDoc) return res.status(404).json({ error: "Jegyzet nem található vagy nem a tiéd!" });

    const text = await processPdf(req.query, res);

    let questions;
    if (type === "TF") {
      questions = await generateTFQuestions(req.query, text);
    } else if (type === "SQSA") {
      questions = await generateSQSAQuestions(req.query, text);
    } else {
      return res.status(400).json({ error: "Érvénytelen kérdéstípus!" });
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Kérdésgenerálási hiba!" });
  }
});


// Jegyzetek + kérdések lekérdezése
router.get('/notes_data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let notes;
      notes = await NoteCollection.find({ owner: userId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Hiba a jegyzetek lekérésekor.' });
  }
});


// Aktív jegyzet kérdései
router.get("/get_questions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const noteData = await NoteCollection.findOne({ isActive: true, owner: userId });
    if (!noteData?.questions?.length)
      return res.status(404).json({ error: "Nincsenek mentett kérdések vagy nincs aktív jegyzet!" });

    res.json({ questions: noteData.questions });
  } catch {
    res.status(500).json({ error: "Lekérési hiba!" });
  }
});


// Kérdés értékelése
router.get("/evaluate_question", authenticateToken, async (req, res) => {
  try {
    const noteData = await NoteCollection.findOne({ isActive: true, owner: req.user.userId });
    if (!noteData) return res.status(404).json({ error: "Nincs aktív jegyzet ennél a felhasználónál!" });

    const text = await processPdf({ subject: noteData.subject, note: noteData.title }, res);
    const answer = await evaluate_question(req.query, text);
    res.json({ answer });
  } catch {
    res.status(500).json({ error: "Értékelési hiba!" });
  }
});


// Kérdések mentése jegyzethez
router.post("/save_questions", authenticateToken, async (req, res) => {
  const { subject, note, newQuestions } = req.body;
  const userId = req.user.userId;

  if (!subject || !note || !Array.isArray(newQuestions)) {
    return res.status(400).json({ error: "Hiányzó adatok vagy hibás formátum!" });
  }

  try {
    await NoteCollection.updateMany({ owner: userId }, { $set: { isActive: false } });

    let noteData = await NoteCollection.findOne({ subject, title: note, owner: userId });

    if (!noteData) {
      return res.status(404).json({ error: "Jegyzet nem található vagy nem a tiéd!" });
    }

    noteData.questions = newQuestions;
    noteData.isActive = true;

    await noteData.save();
    res.json({ success: true, message: "Kérdések sikeresen mentve!" });
  } catch (error) {
    console.error("Mentési hiba:", error);
    res.status(500).json({ error: "Mentési hiba!" });
  }
});


// Aktív jegyzet változtatása
router.post("/change_questions", authenticateToken, async (req, res) => {
  const {note } = req.body;
  const userId = req.user.userId;

  if ( !note) {
    return res.status(400).json({ error: "Hiányzó adat!" });
  }

  try {
    await NoteCollection.updateMany({ owner: userId }, { $set: { isActive: false } });

    let noteData = await NoteCollection.findOne({ title: note, owner: userId });

    if (!noteData) {
      return res.status(404).json({ error: "Jegyzet nem található vagy nem a tiéd!" });
    }

    noteData.isActive = true;

    await noteData.save();
    res.json({ success: true, message: "Aktív érdések sikeresen frissítve!" });
  } catch (error) {
    console.error("Mentési hiba:", error);
    res.status(500).json({ error: "Mentési hiba!" });
  }
});


module.exports = router;
