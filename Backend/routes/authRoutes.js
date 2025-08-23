const express = require("express");
const { loginUser, checkAuth, logoutUser } = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginUser);
router.get("/check-auth", checkAuth);  
router.get("/logout", logoutUser);      

module.exports = router;