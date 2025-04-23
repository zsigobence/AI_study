const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.DB_URI;
const connectDB = async () => {
  try {
    
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  }
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false
  },
  questions: { type: Array, default: [] }
});

const UserCollection = mongoose.model('User', userSchema);
const NoteCollection = mongoose.model('Pdf', noteSchema);

module.exports = { UserCollection, NoteCollection, connectDB };

