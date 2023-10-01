require("dotenv").config()
import { app } from "./app";
import { connectDatabse } from "./utils";
import {v2 as cloudinary} from "cloudinary";

//setup cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDatabse()
});
