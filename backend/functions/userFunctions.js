// functions/userFunctions.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserCollection } = require("../dbConfig");

async function createDefaultAdmin() {
  const adminExists = await UserCollection.findOne({ name: "admin" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new UserCollection({
      name: "admin",
      fullname: "Admin User",
      email: "random@mail.com",
      password: hashedPassword,
      role: "admin",
    });
    await admin.save();
    console.log("Alap admin felhasználó létrehozva");
  }
}

async function loginUser(username, password) {
  const user = await UserCollection.findOne({ name: username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Invalid credentials" };
  }
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    "your_jwt_secret",
    { expiresIn: "1h" }
  );
  return { token };
}

async function addUser(name, fullname, email, password, role) {
  const existingUser = await UserCollection.findOne({ name });
  if (existingUser) return { error: "User already exists!" };

  const existingEmail = await UserCollection.findOne({ email });
  if (existingEmail) return { error: "Email already in use!" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserCollection({ name, fullname, email, password: hashedPassword, role });
  await newUser.save();
  return { message: "User successfully added!" };
}


async function getAllUsers() {
  return await UserCollection.find({}, "-password");
}

async function updateUser(id, name, fullname, email, password, role) {
  const updateData = {
    ...(name && { name }),
    ...(fullname && { fullname }),
    ...(email && { email }),
    ...(role && { role }),
  };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  return await UserCollection.findByIdAndUpdate(id, updateData, { new: true });
}


async function deleteUser(id) {
  return await UserCollection.findByIdAndDelete(id);
}

async function getUserRoleById(id) {
  const user = await UserCollection.findById(id, "role");
  if (!user) {
    return { error: "User not found" };
  }
  return { role: user.role };
}

module.exports = {
  createDefaultAdmin,
  loginUser,
  addUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserRoleById
};
