import express from "express";
import {
  getUserProfile,
  registerUser,
  socialAuth,
  updateProfile,
} from "../controllers";
import { isAuthenticated } from "../middlewares";

const router = express.Router();

router.post("/register", registerUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.post("/social", socialAuth);
router.post("/update-profile", isAuthenticated, updateProfile);

export default router;
