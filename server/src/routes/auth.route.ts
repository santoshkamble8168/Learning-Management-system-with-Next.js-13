import express from "express";
import { login, logout, verifyAccount } from "../controllers";

const router = express.Router()

router.post("/verify-account", verifyAccount);
router.post("/login", login);
router.get("/logout", logout);

export default router