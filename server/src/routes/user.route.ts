import express from "express";
import { registerUser, verifyAccount } from "../controllers/user.controller";

const router = express.Router()

router.post("/register", registerUser)
router.post("/verify-account", verifyAccount);

export default router