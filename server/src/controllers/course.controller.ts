import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares";
import { createNewCourse } from "../services";
import { ICourse, IImage } from "../types";
import { imageUploader } from "../utils";
import { courseDataSchema } from "../validations/course.validation";

export const createCourse = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as ICourse;
    const userId = req.user?._id;

    data.user = userId;

    const { error, value } = courseDataSchema.validate(data, {
      allowUnknown: true,
    }); // Validate the course data against the schema

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    /*
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      const cloudImage = await imageUploader(thumbnail);
      data.thumbnail = {
        public_id: cloudImage.public_id,
        url: cloudImage.url,
      };
    }*/

    const course = await createNewCourse(data);

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