import express from "express";
import { login, logout, updateAccessToken, verifyAccount } from "../controllers";
import { isAuthenticated, isAuthorized } from "../middlewares";

const router = express.Router()

router.post("/verify-account", verifyAccount);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/refresh-token", updateAccessToken);

export default router