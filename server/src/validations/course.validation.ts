import Joi from "@hapi/joi";

export const commentSchema = Joi.object({
  user: Joi.string().required(),
  text: Joi.string().required(),
  createdAt: Joi.date().default(Date.now),
  commentReplies: Joi.array().items(
    Joi.object({
      user: Joi.string().required(),
      text: Joi.string().required(),
      createdAt: Joi.date().default(Date.now),
    })
  ),
});

export const linkSchema = Joi.object({
  title: Joi.string(),
  url: Joi.string(),
});

export const reviewSchema = Joi.object({
  user: Joi.string().required(),
  rating: Joi.number().required().default(0),
  comment: Joi.string().required(),
  commentReplies: Joi.array().items(commentSchema),
  createdAt: Joi.date().default(Date.now),
});

export const courseDataSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  videoUrl: Joi.string().required(),
  videoSection: Joi.string().required(),
  videoDuration: Joi.number().required(),
  videoPlayer: Joi.string(),
  links: Joi.array().items(linkSchema),
  suggestion: Joi.string(),
  questions: Joi.array().items(commentSchema),
});

export const createCourseSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  estimatedPrice: Joi.number(),
  thumbnail: Joi.object({
    public_id: Joi.string(),
    url: Joi.string(),
  }).allow(null), // Allow null for thumbnail
  tags: Joi.string().required(),
  level: Joi.string().required(),
  demoUrl: Joi.string().required(),
  benefits: Joi.array().items(
    Joi.object({
      title: Joi.string(),
    })
  ),
  prerequisites: Joi.array().items(
    Joi.object({
      title: Joi.string(),
    })
  ),
  ratings: Joi.number().default(0),
  noOfPurchased: Joi.number().default(0),
  courseData: Joi.array().items(courseDataSchema).required(),
  reviews: Joi.array().items(reviewSchema),
});

export const updateCourseSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.number(),
  estimatedPrice: Joi.number(),
  thumbnail: Joi.object({
    public_id: Joi.string(),
    url: Joi.string(),
  }).allow(null), // Allow null for thumbnail
  tags: Joi.string(),
  level: Joi.string(),
  demoUrl: Joi.string(),
  benefits: Joi.array().items(
    Joi.object({
      title: Joi.string(),
    })
  ),
  prerequisites: Joi.array().items(
    Joi.object({
      title: Joi.string(),
    })
  ),
  ratings: Joi.number(),
  noOfPurchased: Joi.number(),
  courseData: Joi.array().items(courseDataSchema),
  reviews: Joi.array().items(reviewSchema),
});