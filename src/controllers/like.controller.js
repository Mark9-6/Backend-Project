import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400 , "Invalid videoId")
    }
   
    const userId = req.user?._id;

    const existingLike = await Like.findOne({video:videoId , likedBy:userId});
     let message;
    if(existingLike){
        await existingLike.remove();
        message = "video unliked successfully";
    }
    else{
        await Like.create({video:videoId, likedBy:userId})
        message="Video liked successfully"
    }
   
    return res
    .status(200)
    .json(new ApiResponse(200,{},message));
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const userId = req.user?._id;
    if(!commentId){
        throw new ApiError(400 , "Invalid videoId")
    }
    const existingLike = await Like.findOne({comment:commentId , likedBy:userId})
    
    let message  ;
    if(existingLike){
        await existingLike.remove();
        message="Comment unliked successfully"
    }
    else {
        await Like.create({comment:commentId, likedBy:userId});
        message ="Comment liked successfully"
    }

    return res
    .status(200)
    .json(new ApiError(200 , {} , message));
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userId = req.user?._id;
    if (!tweetId) {
        throw new ApiError(400 , "Invalid tweetId");
    }
    const existingLike = await Like.findOne({likedBy:userId , tweet:tweetId});
    let message ;
    if(existingLike){
        await existingLike.remove();
        message = "Tweet unliked successfully"; 
    }
    else{
        await Like.create({likedBy:userId , tweet:tweetId});
        message = "Tweet liked successfully";
    }
    return res
    .status(200)
    .json(new ApiResponse(200 , {} , message));
})

const getLikedVideos = asyncHandler(async(req,res)=>{

    const userId = req.user?._id

   const likedVideos = await Like.find({likedBy:userId })
    .populate("video")                     //what  populate method does is that it goes into the like model and then gets video only from that leaving behind tweets , comments , and other things // 
    .exec();

    return res
    .status(200)
    .json(new ApiError(200 , likedVideos , "Liked Videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos
}