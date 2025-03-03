const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const gemini = new GoogleGenerativeAI(process.env.API_KEY);
const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateTFQuestions(data, text) {
  const prompt = `Generálj ${data.length} darab igaz-hamis állítást a következő jegyzetből:\n${text} 
        A kérdések az anyag legfontosabb témaköreit érintsék
        javascript által értelmezhető tömb formátumba írd le a kérdéseket
        A válasz a kérdést kövesse egy tömbön belöli tömbben
        például: [["kérdés1","igaz"], ["kérdés2","hamis"],...]
        ne írj semmilyen más megjegyzést és egyéb dolgot a tömbön kívül
        `;
  const result = await model.generateContent(prompt);
  const questions = result.response.text();
  const cleanedText = questions
    .replace(/```javascript/, "")
    .replace(/```/, "")
    .trim();
  const parsedQuestions = JSON.parse(cleanedText);

  if (parsedQuestions.length > data.length) {
    return getRandomSubarray(parsedQuestions, data.length);
  }

  return parsedQuestions;
}

async function generateSQSAQuestions(data, text) {
  const prompt = `Generálj ${data.length} darab rövid válaszos kérdést a következő jegyzetből:\n${text} 
        A kérdések az anyag legfontosabb témaköreit érintsék
        javascript által értelmezhető tömb formátumba írd le a kérdéseket
        például: ["kérdés1", "kérdés2",...]
        ne írj semmilyen más megjegyzést és egyéb dolgot a tömbön kívül
        `;
  const result = await model.generateContent(prompt);
  const questions = result.response.text();
  const cleanedText = questions
    .replace(/```javascript/, "")
    .replace(/```/, "")
    .trim();
  const parsedQuestions = JSON.parse(cleanedText);

  if (parsedQuestions.length > data.length) {
    return getRandomSubarray(parsedQuestions, data.length);
  }

  return parsedQuestions;
}


async function evaluate_question(data, text) {
  const prompt = `
  Erre a kérdésre ${data.question} megfelelő-e ez a válasz ${data.answer} a jegyzet alapján\n ${text}.\n
  javascript által értelmezhető tömb formátumba írd le a kiértékeléseket
  A válasz helyességét és a javítást ha szükséges egy tömbben add vissza
  például: ["IGAZ", ""] vagy ha hamis akkor ["HAMIS", Azért hamis mert kihagytad a....]
  ne írj semmilyen más megjegyzést és egyéb dolgot a tömbön kívül
  `;
const result = await model.generateContent(prompt);
const questions = result.response.text();
const cleanedText = questions
    .replace(/```javascript/, "")
    .replace(/```/, "")
    .trim();
  const parsedQuestions = JSON.parse(cleanedText);

  if (parsedQuestions.length > data.length) {
    return getRandomSubarray(parsedQuestions, data.length);
  }

  return parsedQuestions;
}


function getRandomSubarray(arr, size) {
  const shuffled = arr.slice(); 
  let i = arr.length;
  while (i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; 
  }
  return shuffled.slice(0, size); 
}

module.exports = { generateTFQuestions, generateSQSAQuestions, evaluate_question };
