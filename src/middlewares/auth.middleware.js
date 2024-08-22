import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";  
import jwt from "jsonwebtoken";

export  const verifyJWT =  asyncHandler(async(req, _ , next)=>{
    try {
        const token = req.cookies?.accessToken ||   req.header("Authorization")?.replace("Bearer " , "")  // if cookies has access to accessToken if not like in mobile apps 
        if(!token){
            throw new ApiError(401 , "Unauthorized request")
        }
        const decodedToken =jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)          // verifies if token has correct secret key
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
         if (!user) {
            throw new ApiError(401 , "Invalid Access Token" )
         }
         req.user=user;          // here we provided the req with user for use in logout method
         next()   // here is used because is userRoutes we want to run the next method that is logoutuser
     
        } 
    
        catch (error) {
        throw new ApiError(401 , error?.message||"Invalid access token")
   
    }

})