import User from "../models/user.model";

//get user by id
export const getUserById = async (
  id: string,
  selectPassword: boolean = false
) => {
  try {
    return selectPassword
      ? await User.findById(id).select("+password")
      : await User.findById(id);
  } catch (error) {
    console.error(`Error getting user by id:`, error);
    throw error;
  }
};

//get user by field
export const getUserByField = async (
  fieldObject: Record<string, any>,
  selectPassword: boolean = false
) => {
  try {
    return selectPassword
      ? await User.findOne(fieldObject).select("+password")
      : await User.findOne(fieldObject)
  } catch (error) {
    console.error(`Error getting user by field:`, error);
    throw error; // You can choose to handle or propagate the error as needed
  }
};
