import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import axios from 'axios';

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: {uri?: string} | string,
  folderName: string
): Promise<ResponseType> =>{
  try{
    console.log(`[CLOUDINARY] Starting upload to folder: ${folderName}`);
    
    // If file is just a string (already a URL), return it
    if(typeof file == 'string'){
      console.log(`[CLOUDINARY] File is already a URL, skipping upload`);
      return {success: true, data: file};
    }
    
    // If file has a URI property, upload it to Cloudinary
    if(file && file.uri){
      console.log(`[CLOUDINARY] Preparing to upload file with URI: ${file.uri.substring(0, 30)}...`);
      
      const formData = new FormData();
      formData.append("file", {
        uri: file?.uri,
        type: "image/jpeg",
        name: file?.uri?.split("/").pop() || "file.jpg",
      } as any);
      
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folderName);
      
      console.log(`[CLOUDINARY] Sending request to Cloudinary API`);
      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log(`[CLOUDINARY] Upload successful! Image URL: ${response?.data?.secure_url}`);
      return { success: true, data: response?.data?.secure_url };
    }
    
    console.log(`[CLOUDINARY] No valid file to upload`);
    return { success: true };
  } catch (error: any) {
    console.log(`[CLOUDINARY ERROR] Upload failed: ${error.message || "Unknown error"}`);
    console.log("got error uploading file: ", error);
    return { success: false, msg: error.message || "Could not upload file" };
  }
};

export const getProfileImage = (file: any) => {
    if (file && typeof file === 'string') return file;
    if (file && typeof file === 'object') return file.uri;
  
    return require('../assets/images/defaultAvatar.png');
};