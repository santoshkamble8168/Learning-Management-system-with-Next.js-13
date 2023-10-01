import Course from "../models/course.model"


export const createNewCourse = async(data: any) => {
    try {
        return await Course.create(data)
    } catch (error) {
        console.error(`Error getting createCourse:`, error);
        throw error;
    }
}