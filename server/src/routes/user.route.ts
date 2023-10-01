import express from "express";
import {
  changePassword,
  getUserProfile,
  registerUser,
  socialAuth,
  updateProfile,
} from "../controllers";
import { isAuthenticated } from "../middlewares";

const router = express.Router();

router.post("/register", registerUser);
router.post("/social", socialAuth);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/update-profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);

export default router;
