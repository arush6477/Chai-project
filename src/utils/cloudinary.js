import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) return null;
        // upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
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
    const publicId = filename.split('.')[0]; // Remove file extension
      if (!publicId) return null;
      // Delete the file from Cloudinary
      const response = await cloudinary.uploader.destroy(publicId);
      // File has been deleted successfully
      return response;
  } catch (error) {
      throw new ApiError("Failed to delete file from Cloudinary", 500);
  }
}

export {uploadOnCloudinary , deleteCloudinary};