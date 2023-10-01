import express from "express";
import { createCourse } from "../controllers";
import { isAuthenticated, isAuthorized } from "../middlewares";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  isAuthorized(["instructor", "admin"]),
  createCourse
);

export default router;