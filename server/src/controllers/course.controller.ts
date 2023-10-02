import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares";
import { createNewCourse } from "../services";
import { ICourse } from "../types";
import { imageUploader } from "../utils";
import { createCourseSchema } from "../validations/course.validation";

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

    const course = await createNewCourse(value) as ICourse;

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