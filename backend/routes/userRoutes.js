const express = require("express");
const router = express.Router();

const {
  createDefaultAdmin,
  loginUser,
  addUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserRoleById,
} = require("../functions/userFunctions");

const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

createDefaultAdmin();

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  const result = await loginUser(username, password);
  if (result.error) return res.status(401).json({ message: result.error });

  res.json({ message: "Login successful", token: result.token });
});

// ADD USER
router.post("/add_user", authenticateToken, isAdmin, async (req, res) => {
  const { name, fullname, email, password, role } = req.body;
  const result = await addUser(name, fullname, email, password, role);

  if (result.error) return res.status(400).json({ message: result.error });
  res.status(201).json({ message: result.message });
});


// GET USERS
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Hiba a lekérdezés során!" });
  }
});

// UPDATE USER
router.put("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  const { name, fullname, email, password, role } = req.body;
  try {
    const updatedUser = await updateUser(req.params.id, name, fullname, email, password, role);
    if (!updatedUser)
      return res.status(404).json({ message: "Felhasználó nem található!" });
    res.json({ success: true, message: "Felhasználó frissítve!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Hiba a frissítés során!" });
  }
});


// DELETE USER
router.delete("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "Felhasználó nem található!" });
    res.json({ success: true, message: "Felhasználó törölve!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Hiba a törlés során!" });
  }
});


router.get("/user-role", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getUserRoleById(userId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }
    res.json({ role: result.role });
  } catch (err) {
    console.error("Hiba a /user-role végpontban:", err);
    res.status(500).json({ message: "Hiba történt a szerepkör lekérésekor." });
  }
});



module.exports = router;
