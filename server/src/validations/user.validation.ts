import Joi from "@hapi/joi";

// Define the schema for updating a user's profile
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(), // Optional
  avatar: Joi.string().uri().optional(), // Optional
  password: Joi.string().min(6).max(255).optional(), // Required for password update
});
