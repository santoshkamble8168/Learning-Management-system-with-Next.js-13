import { IImage } from "./user";

//comments
export interface IComment extends Document {
  user: Schema.Types.ObjectId;
  comment: string;
  commentReplies: string;
  createdAt: Date;
}

//reviews
export interface IReview extends Document {
  user: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  commentReplies: IComment[];
  createdAt: Date;
}

//video links
export interface ILink extends Document {
  title: string;
  url: string;
}

//course data
export interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoSection: string;
  videoDuration: number;
  videoPlayer: string;
  links: ILink[];
  suggestion?: string;
  questions: IComment[];
}

// Define the course Schema
export interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail?: IImage;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  noOfPurchased?: number;
  user: Schema.Types.ObjectId;
}
