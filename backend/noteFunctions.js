const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "notes");

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

module.exports = { saveFile, ensureDirectoryExists };
