import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const heathCheck = asyncHandler(async(req,res)=>{
     const res = {
        status : OK ,
        message : "API working"
     }
    return res
    .status(200)
    .json(new ApiResponse(200 , res , "Status Checked successfully"));

})
export {
    heathCheck
}