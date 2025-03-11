const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const multer = require("multer");
app.use("/notes", express.static(path.join(__dirname, "notes")));
const PORT = 3000;
app.use(express.json());
app.use(cors());
const { connectDB, NoteCollection } = require("./dbConfig");
const { saveFile, ensureDirectoryExists } = require("./noteFunctions");
const { generateTFQuestions, generateSQSAQuestions, evaluate_question } = require("./aiFunctions");
connectDB();
ensureDirectoryExists();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "notes"); // A fájlok a "notes" mappába kerülnek
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nincs feltöltött fájl!" });
  }

  console.log("Feltöltött fájl:", req.file);

  const subjectName = req.body.subject;

  const newNote = new NoteCollection({
    title: req.file.originalname,
    subject: subjectName,
    filePath: req.file.path,
    filename: req.file.filename,
    size: req.file.size,
    questions: [],
  });

  try {
    await newNote.save(); // Adatbázisba mentés
    res.status(200).json({ message: "Fájl sikeresen feltöltve és mentve az adatbázisba!" });
  } catch (err) {
    console.error("Hiba történt az adatbázis mentés közben:", err);
    res.status(500).json({ message: "Hiba történt az adatbázis mentés közben!" });
  }
});

app.get("/notes", async (req, res) => {
  try {
    const notes = await NoteCollection.find({});
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Hiba a jegyzetek lekérdezésekor:", error);
    res.status(500).json({ success: false, message: "Nem sikerült lekérdezni a jegyzeteket" });
  }
});

app.delete("/notes/:noteTitle", async (req, res) => {
  const noteTitle = req.params.noteTitle;

  if (!noteTitle) {
    return res.status(400).json({ error: "Jegyzet neve szükséges!" });
  }

  try {
    const deletedNote = await NoteCollection.findOneAndDelete({ title: noteTitle });

    if (!deletedNote) {
      return res.status(404).json({ error: "Jegyzet nem található az adatbázisban!" });
    }

    //Fájl törlése a szerverről
    const filePath = path.join(__dirname, "notes", noteTitle);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Fájl törölve: ${filePath}`);
    } else {
      console.log(`Fájl nem található: ${filePath}`);
    }

    res.json({ message: "Jegyzet sikeresen törölve!" });
  } catch (error) {
    console.error("Szerverhiba törlés közben:", error);
    res.status(500).json({ error: "Szerverhiba a törlés közben!" });
  }
});


app.get("/view_note", async (req, res) => {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).json({ success: false, message: "Hiányzó fájlnév!" });
  }

  try {
    const filePath = path.join(__dirname, "notes", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Fájl nem található!" });
    }

    const pdfBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(pdfBuffer);

    res.json({ success: true, text: data.text });
  } catch (error) {
    console.error("Hiba a fájl megnyitásakor:", error);
    res.status(500).json({ success: false, message: "Nem sikerült megnyitni a jegyzetet" });
  }
});




app.get("/generate_questions", async (req, res) => {
  try {
    //const length = req.query.length; //kérdések hossza
    const type = req.query.type;  //kérdéstípus amely lehet TF (igaz hamis) és SQSA (rövid kérdés rövid válasz)
    const subject = req.query.subject; //tantárgy neve
    const note = req.query.note || ""; //jegyzet neve

    const text = await processPdf(req.query);
    let questions
    if (type === "TF") {
      questions = await generateTFQuestions(req.query, text);
    } else if (type === "SQSA") {
      questions = await generateSQSAQuestions(req.query, text);
    } else {
      res.status(400).json({ error: "Not valid question type" });
    }

    res.json(questions);
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});
//visszaadja a tantárgyakat és jegyzeteket hogy ki lehessen listázni 
// és a kérdéseket hogy lehessen meglévő kérdéssorokból választani (azt még nem írtam meg)
app.get("/notes_data", async (req, res) => {
  NoteCollection.find({})
    .then((data) => {
      res.json({ success: true, data: data });
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: 'Hiba a lekérdezés során', error: err });
    });
});

//ID alapján visszaadja a jegyzet kérdéseit
app.get("/get_questions", async (req, res) => {
  const { id } = req.query; 

  try {
    const noteData = await NoteCollection.findOne({ isActive: true });
    if (!noteData || !noteData.questions || noteData.questions.length === 0) {
      return res.status(404).json({ error: "Nincsenek mentett kérdések!" });
    }

    res.json({ questions: noteData.questions });
  } catch (error) {
    console.error("Hiba a lekérdezés során:", error);
    res.status(500).json({ error: "Szerverhiba kérdések lekérése közben!" });
  }
});




//szükséges paraméterek tantárgy , jegyzet (nem kötelező), kérdés, válasz
/*
  subject
  note
  question
  answer
*/
app.get("/evaluate_question", async (req, res) => {
const noteData = await NoteCollection.findOne({ isActive: true });
const data = {
  note: noteData.title,
  subject: noteData.subject
};
const text = await processPdf(data);
const answer = await evaluate_question(req.query,text)
res.json({ answer: answer });
});

//kérdések mentése
app.post("/save_questions", async (req, res) => {
  const { subject, note, newQuestions } = req.body;

  if (!subject || !newQuestions || !Array.isArray(newQuestions)) {
    return res.status(400).json({ error: "Hiányzó adatok vagy rossz formátum!" });
  }

  try {
    await NoteCollection.updateMany(
      {},
      { $set: { isActive: false } } 
    );
    let noteData = await NoteCollection.findOne({ subject: subject, title: note });

    if (!noteData) {
      noteData = new NoteCollection({ title: note, subject: subject, questions: newQuestions, isActive: true });
    } else {
      noteData.questions = newQuestions;
      noteData.isActive = true;
    }

    await noteData.save();
    res.json({ success: true, message: "Kérdések sikeresen mentve!" });
  } catch (error) {
    console.error("Hiba a mentés során:", error);
    res.status(500).json({ error: "Szerverhiba kérdés mentése közben!" });
  }
});


app.get('/', (req, res) => {
  res.send('Backend is working!');
});



const fsPromises = require("fs").promises;

async function processPdf(data) {
  const subject = data.subject;
  const note = data.note;
  let text = "";

  if (subject != "") {
    const pdfPath = path.join("notes", note);
    
    try {
      await fsPromises.access(pdfPath);
    } catch (error) {
      console.log(`A fájl nem található: ${pdfPath}`);
      return res.status(400).json({ message: "Fájl nem található!" });
    }

    try {
      const data = await pdfParse(await fsPromises.readFile(pdfPath));
      text = data.text;
    } catch (error) {
      console.error("Hiba a fájl feldolgozása közben:", error);
    }
  }

  return text;
}


app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
