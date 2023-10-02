import Course from "../models/course.model"
import { ICourse } from "../types";

// Get a course by its ID
export const getCourseById = async (courseId: string) => {
  try {
    // Find the course by its ID
    const course = await Course.findById(courseId);

    return course; // Returns the found course or null if not found
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const createNewCourse = async(courseData: ICourse) => {
    try {
        return await Course.create(courseData);
    } catch (error) {
        console.error(`Error getting createCourse:`, error);
        throw error;
    }
}

export const updateCourseById = async (courseId: string, updateData: any) => {
  try {
    // Find the course by its ID and update it
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return null; // Course not found
    }

    return updatedCourse; // Return the updated course data
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};