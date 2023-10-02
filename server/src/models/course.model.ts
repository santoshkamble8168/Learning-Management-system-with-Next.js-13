import mongoose, { Model, Schema } from "mongoose";
import { IComment, ICourse, ICourseData, ILink, IReview } from "../types";


// Define the schema for the Comment
const commentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  commentReplies: [Object]
});

// Define the schema for the Review
const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, default: 0 },
  comment: { type: String, required: true },
  commentReplies: [commentSchema], // Nested comments
  createdAt: { type: Date, default: Date.now },
});

// Define the schema for the Link
const linkSchema = new Schema<ILink>({
  title: { type: String},
  url: { type: String},
});

// Define the schema for the CourseData
const courseDataSchema = new Schema<ICourseData>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoSection: { type: String, required: true },
  videoDuration: { type: Number, required: true },
  videoPlayer: { type: String},
  links: [linkSchema], // Array of links
  suggestion: { type: String },
  questions: [commentSchema], // Array of comments
});

// Define the schema for the Course
const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  estimatedPrice: { type: Number },
  thumbnail: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  }, // Embed the image schema
  tags: { type: String, required: true },
  level: { type: String, required: true },
  demoUrl: { type: String, required: true },
  benefits: [{ title: { type: String}}], // Array of objects
  prerequisites: [{ title: { type: String}}], // Array of objects
  reviews: [reviewSchema], // Array of reviews
  courseData: [courseDataSchema], // Array of course data
  ratings: { type: Number, default: 0 },
  noOfPurchased: { type: Number, default: 0 },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Course: Model<ICourse> = mongoose.model("Course", courseSchema);
export default Course;
