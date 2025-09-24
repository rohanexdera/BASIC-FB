import express from "express";
const router = express.Router();
import { registerUser, loginUser , logoutUser , getUserProfile } from "../controllers/userController.js";


router.post("/register", registerUser);  // // api/user/register
router.post("/login", loginUser);  // // api/user/login
router.post("/logout", logoutUser);  // // api/user/logout
router.get("/profile", getUserProfile);  // // api/user/profile


export default router;