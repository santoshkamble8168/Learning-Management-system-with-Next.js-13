import express from "express";
import { verifyAccount } from "../controllers";

const router = express.Router()

router.post("/verify-account", verifyAccount);

export default router