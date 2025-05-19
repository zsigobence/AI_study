const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const pdfParse = require("pdf-parse");

const uploadDir = path.join(__dirname, "..", "notes");

// Mappa létrehozása, ha nem létezik
function ensureDirectoryExists() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(` Mappa létrehozva: ${uploadDir}`);
  }
}

// Fájl mentése a "notes" mappába
function saveFile(file) {
  if (!file || !file.buffer) {
    console.error("Hiba: A fájl buffer nem létezik vagy üres.");
    return { success: false, message: "A fájl adatai nem érhetők el." };
  }

  console.log("📁 Fájl buffer tartalom:", file.buffer);

  const fileBuffer = file.buffer ? file.buffer : Buffer.from([]);
const filePath = path.join(uploadDir, file.originalname);

try {
  fs.writeFileSync(filePath, fileBuffer);
  console.log(`Fájl sikeresen mentve: ${filePath}`);
  return { success: true, filePath };
} catch (err) {
  console.error("Hiba történt a fájl mentésekor:", err);
  return { success: false, message: "Hiba történt a fájl mentésekor." };
}

}

// PDF fájl szövegének kiolvasása
async function processPdf(data) {
  const subject = data.subject;
  const note = data.note;
  let text = "";

  if (subject !== "") {
    const pdfPath = path.join(__dirname, "..", "notes", note);
    try {
      await fsPromises.access(pdfPath);
    } catch (error) {
      console.log(`A fájl nem található: ${pdfPath}`);
      return { error: "Fájl nem található!" };
    }

    try {
      const fileBuffer = await fsPromises.readFile(pdfPath);
      const parsed = await pdfParse(fileBuffer);
      text = parsed.text;
    } catch (error) {
      console.error("Hiba a fájl feldolgozása közben:", error);
      return { error: "PDF feldolgozási hiba!" };
    }
  }

  return text;
}


module.exports = {
  ensureDirectoryExists,
  saveFile,
  processPdf,
};
