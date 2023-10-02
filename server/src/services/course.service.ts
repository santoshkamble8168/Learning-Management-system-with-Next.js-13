import Course from "../models/course.model"
import { ICourse } from "../types";


export const createNewCourse = async(courseData: ICourse) => {
    try {
        return await Course.create(courseData);
    } catch (error) {
        console.error(`Error getting createCourse:`, error);
        throw error;
    }
}