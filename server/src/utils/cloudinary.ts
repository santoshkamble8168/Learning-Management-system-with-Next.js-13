import cloudinary from "cloudinary";

interface IUploadConfig {
  folder: string;
  width: number;
}

const defaultUploadConfig: IUploadConfig = {
  folder: "avatars",
  width: 150,
};

export const imageUploader = async (
  image: string, // Ensure 'image' is a base64 string
  config: Partial<IUploadConfig> = {}
) => {
  // Merge the provided 'config' with the default values
  const uploadConfig: IUploadConfig = {
    ...defaultUploadConfig,
    ...config,
  };

  try {
    const cloudImage = await cloudinary.v2.uploader.upload(image, uploadConfig);

    return cloudImage;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};


export const imageDestroyer = async (publicId: string) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
    
  } catch (error) {
    console.error(`Error destroying image with public ID ${publicId}:`, error);
    throw error;
  }
};
