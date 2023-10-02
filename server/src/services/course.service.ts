import Course from "../models/course.model"
import { ICourse } from "../types";

// Get a course by its ID
export const getCourseById = async (courseId: string, fields?: string) => {
  try {
    // Create a projection object for field selection
    let projection: any = {};

    if (fields) {
      // Split the fields string by comma
      const fieldList = fields.split(" ");

      // Iterate through the fieldList to build the projection object
      for (const field of fieldList) {
        // Check for '-' (exclude) or '+' (include) prefixes
        if (field.startsWith("-")) {
          const fieldName = field.slice(1); // Remove '-' prefix
          projection[fieldName] = 0; // Exclude the field
        } else if (field.startsWith("+")) {
          const fieldName = field.slice(1); // Remove '+' prefix
          projection[fieldName] = 1; // Include the field
        } else {
          projection[field] = 1; // Include the field by default
        }
      }
    }

    // Find the course by its ID and apply field selection if specified
    const course = await Course.findById(courseId).select(projection);

    return course; // Returns the found course or null if not found
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const getCourses = async (fields?: string) => {
  try {
    // Create a projection object for field selection
    let projection: any = {};

    if (fields) {
      // Split the fields string by comma
      const fieldList = fields.split(" ");

      // Iterate through the fieldList to build the projection object
      for (const field of fieldList) {
        // Check for '-' (exclude) or '+' (include) prefixes
        if (field.startsWith("-")) {
          const fieldName = field.slice(1); // Remove '-' prefix
          projection[fieldName] = 0; // Exclude the field
        } else if (field.startsWith("+")) {
          const fieldName = field.slice(1); // Remove '+' prefix
          projection[fieldName] = 1; // Include the field
        } else {
          projection[field] = 1; // Include the field by default
        }
      }
    }

    // Find all courses and apply field selection if specified
    const courses = await Course.find({}).select(projection).exec();

    return courses; // Returns an array of courses
  } catch (error) {
    console.error("Error fetching courses:", error);
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