import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares";
import { createNewCourse, getCourseById, getCourses, updateCourseById } from "../services";
import { ICourse } from "../types";
import { imageUploader } from "../utils";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validations/course.validation";

export const createCourse = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    const { error, value } = createCourseSchema.validate(data, {
      allowUnknown: true,
    }); // Validate the course data against the schema

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const userId = req.user?._id;
    value.user = userId;

    const thumbnailBase64 = value.thumbnail;

    if (thumbnailBase64) {
      // Upload the base64 image to Cloudinary
      const cloudImage = await imageUploader(thumbnailBase64);

      // Update data.thumbnail with Cloudinary response
      value.thumbnail = {
        public_id: cloudImage.public_id,
        url: cloudImage.url,
      };
    }

    const course = (await createNewCourse(value)) as ICourse;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course creation failed, please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "New course created successfully",
      item: course,
    });
  }
);

export const updateCourse = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide course id",
      });
    }

    const data = req.body;

    //Todo: check the req.body key is exist in database
    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided. The course remains unchanged.",
      });
    }

    // Validate the course data against the update schema
    const { error, value } = updateCourseSchema.validate(data, {
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const userId = req.user?._id;

    try {
      // Fetch the existing course by ID and check if it exists
      const existingCourse = await getCourseById(courseId);

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check if the user has permission to update this course (e.g., they are the course owner)
      if (existingCourse.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this course",
        });
      }

      // Handle updates to the thumbnail, if provided
      const thumbnailBase64 = value.thumbnail;

      if (thumbnailBase64) {
        // Upload the base64 image to Cloudinary
        const cloudImage = await imageUploader(thumbnailBase64);

        // Update data.thumbnail with Cloudinary response
        value.thumbnail = {
          public_id: cloudImage.public_id,
          url: cloudImage.url,
        };
      }

      // Update the course with the new data
      const updatedCourse = (await updateCourseById(
        courseId,
        value
      )) as ICourse;

      if (!updatedCourse) {
        return res.status(400).json({
          success: false,
          message: "Course update failed, please try again.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        item: updatedCourse,
      });
    } catch (error) {
      console.error("Course update failed:", error);
      res.status(500).json({
        success: false,
        error: "Course update failed.",
      });
    }
  }
);

export const getSingleCourse = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const courseId = req.params.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid course ID.",
      });
    }

    try {
      // Fetch the course by its ID
      const course = (await getCourseById(
        courseId,
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      )) as ICourse;

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found.",
        });
      }

      // Return the course details
      res.status(200).json({
        success: true,
        message: "Course retrieved successfully.",
        item: course,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);


export const getAllCourses = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Call the service function to get all courses
      const courses = (await getCourses(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      )) as ICourse[];

      // Check if any courses were found
      if (courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No courses found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "All courses retrieved successfully",
        items: courses,
      });
    } catch (error) {
      console.error("Error getting all courses:", error);
      res.status(500).json({
        success: false,
        error: "Error getting all courses.",
      });
    }
  }
);