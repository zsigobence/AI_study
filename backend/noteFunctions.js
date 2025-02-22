const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "notes");

function ensureDirectoryExists() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

function saveFile(data) {
  if (!data) {
    return res.status(400).json({ message: "Nincs fájl feltöltve" });
  }

  const filePath = path.join(uploadDir, data.originalname);

  fs.writeFile(filePath, data.buffer, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Hiba történt a fájl mentésekor" });
    }
    res.status(200).json({ message: "Fájl sikeresen feltöltve", filePath });
  });
}

module.exports = { saveFile, ensureDirectoryExists };
