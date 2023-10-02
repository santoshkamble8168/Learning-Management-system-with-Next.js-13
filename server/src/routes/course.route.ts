import express from "express";
import { createCourse, getAllCourses, getSingleCourse, updateCourse } from "../controllers";
import { isAuthenticated, isAuthorized } from "../middlewares";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  isAuthorized(["instructor", "admin"]),
  createCourse
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized(["instructor", "admin"]),
  updateCourse
);

router.get(
  "/:id",
  getSingleCourse
);

router.get("/", getAllCourses);

export default router;