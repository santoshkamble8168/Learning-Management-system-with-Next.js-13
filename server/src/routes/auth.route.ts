import express from "express";
import { verifyAccount } from "../controllers/auth.controller";

const router = express.Router()

router.post("/verify-account", verifyAccount);

export default router