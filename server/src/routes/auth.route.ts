import express from "express";
import { login, logout, verifyAccount } from "../controllers";
import { isAuthenticated } from "../middlewares";

const router = express.Router()

router.post("/verify-account", verifyAccount);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);

export default router