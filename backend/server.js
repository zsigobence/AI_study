const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const multer = require("multer");
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
    cb(null, Date.now() + "-" + file.originalname); 
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

app.get("/generate_questions", async (req, res) => {
  try {
    //const length = req.query.length; //kérdések hossza
    const type = req.query.type;  //kérdéstípus amely lehet TF (igaz hamis) és SQSA (rövid kérdés rövid válasz)
    const subject = req.query.subject; //tantárgy neve
    const note = req.query.note || ""; //jegyzet neve

    const text = processPdf(req.query);

    if (type == "TF") {
      const array = generateTFQuestions(req.query, text);
    } else if (type == "SQSA") {
      const array = generateSQSAQuestions(req.query, text);
    } else {
      res.status(400).json({ error: "Not valid question type" });
    }

    res.json(array);
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

//szükséges paraméterek tantárgy , jegyzet (nem kötelező), kérdés, válasz
/*
  subject
  note
  question
  answer
*/
app.get("/evaluate_question", async (req, res) => {
const text = processPdf(req.query);
const array = evaluate_question(req.query,text)
res.json(array);
});

//kérdések mentése
app.post("/save_questions", async (req, res) => {
  const subject = req.body.subject;
  const note = req.body.note || "";
  const newQuestions = req.body.newQuestions //az elmentendő kérdések tömbje
  if(note != ""){
    const noteData = await NoteCollection.findOne({ title: note });
    noteData.questions = noteData.questions.concat(newQuestions);

    noteData.save()
  }
  else{
    const noteData = await NoteCollection.findOne({ subject: subject, title: "" });
    if (noteData) {
      noteData.questions = noteData.questions.concat(newQuestions); 
      noteData.save()
    }else{
      const newNote = new NoteCollection({ title: "", subject: subject, questions: newQuestions });
      await newNote.save();
    }
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
