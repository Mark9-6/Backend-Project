import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

 

    // Configuration
    cloudinary.config({ 
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME, 
        api_key : process.env.CLOUDINARY_API_KEY, 
        api_secret : process.env.CLOUDINARY_API_SECRET 
    });
    

   const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //uploading;
      const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"                  // response will return many things including url , public id etc
        });
        //upload successfully
        // console.log("file is uplaoaded on cloudinary" , response.url);
        // console.log(response)
       
        try {
            await fs.access(localFilePath);
            await fs.unlink(localFilePath);
        } catch (error) {
            console.error("File does not exist or could not be deleted:", error);
        }

        
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
   }

export {uploadOnCloudinary} 
 
