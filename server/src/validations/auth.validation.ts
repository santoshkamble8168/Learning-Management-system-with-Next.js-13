import Joi from "@hapi/joi";

// Schema for user registration data
export const registrationSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Disable email validation for local development
    .required()
    .messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
  password: Joi.string().min(8).required().messages({
    "any.required": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
  }),
});

// Schema for account verification token
export const verificationSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Token is required.",
  }),
});


// Schema for user login data
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Disable email validation for local development
    .required()
    .messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
  password: Joi.string().required().messages({
    "any.required": "Password is required."
  }),
});
