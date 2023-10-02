import express from "express";
import {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
} from "../controllers";
import { isAuthenticated, isAuthorized } from "../middlewares";

const router = express.Router();

// Create a new course
router.post(
  "/",
  isAuthenticated,
  isAuthorized(["instructor", "admin"]),
  createCourse
);

// Update an existing course
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized(["instructor", "admin"]),
  updateCourse
);

// Get a single course by ID
router.get("/:id", getSingleCourse);

// Get all courses
router.get("/", getAllCourses);

export default router;
