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
    cb(null, "notes"); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  },
});

const upload = multer({ storage: storage });


app.post("/upload", upload.single("pdf"), async (req, res) => {
  const subjectName = req.body;
  const fileName = req.file.originalname;
  const note = await NoteCollection.findOne({ fileName });
  if (note) {
    return res.status(400).json({ message: "Ilyen nevű jegyzet már létezik" });
  }
  saveFile(req.file);
  const newNote = new NoteCollection({ title: fileName, subject: subjectName, questions: [] });
  await newNote.save();
});

//szüksége van a length,type subject és note adatokra
app.get("/generate_questions", async (req, res) => {
  try {
    //const length = req.query.length; //kérdések hossza
    const type = req.query.type;  //kérdéstípus amely lehet TF (igaz hamis) és SQSA (rövid kérdés rövid válasz)
    const subject = req.query.subject; //tantárgy neve
    const note = req.query.note || ""; //jegyzet neve

    const text = await processPdf(req.query);

    if (type === "TF") {
      const array = await generateTFQuestions(req.query, text);
    } else if (type === "SQSA") {
      const array = await generateSQSAQuestions(req.query, text);
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
const text = await processPdf(req.query);
const array = await evaluate_question(req.query,text)
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


async function processPdf(data){
  const subject = data.subject;
  const note = data.note;
  if (subject != "") {
    const pdfPath = path.join("notes", note);
    const data = await pdfParse(fs.readFileSync(pdfPath));
    const text = data.text;
  } else {
    const notes = await NoteCollection.find({ subject });
    const titles = notes.map((note) => note.title);
    let text = "";
    let data = null;
    let pdfPath = null;
    for (const title of titles) {
      for (const title of titles) {
        if(title != ""){
        pdfPath = path.join("notes", title);
        data = await pdfParse(fs.readFileSync(pdfPath));
        text += data.text;
        }
      }
    }
  }
  return text;
}

app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
