import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    //file has been uploaded successfully
    // console.log("File is successfully uploaded on cloudinary"),response.url;
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //remove the locally saved temporary as upload is failed 
  }
}

const deleteCloudinary = async (cloudinaryUrl) => {
  try {
    
    const parts = cloudinaryUrl.split('/');
    const filename = parts.pop();

    // Check if filename is present and has a valid format
    if (!filename || !filename.includes('.')) {
      throw new Error("Invalid Cloudinary URL format");
    }

    const publicId = filename.split('.')[0]; // Remove file extension
    if (!publicId) {
      throw new Error("Unable to extract publicId from Cloudinary URL");
    }

    // Delete the file from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);
    
    // Check if the file was deleted successfully
    // if (response.result === 'ok') {
    //   return { success: true, message: 'File deleted from Cloudinary successfully' };
    // } else {
    //   throw new Error(`Error deleting file from Cloudinary: ${response.result}`);
    // }
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

export { uploadOnCloudinary, deleteCloudinary };