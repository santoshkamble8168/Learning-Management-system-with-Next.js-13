import Joi from "@hapi/joi";

// Define the schema for updating a user's profile
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(), // Optional
  avatar: Joi.string().uri().optional(), // Optional
});

// Define the schema for updating a user's profile
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).max(255).optional(),
  password: Joi.string().min(6).max(255).optional(),
});
