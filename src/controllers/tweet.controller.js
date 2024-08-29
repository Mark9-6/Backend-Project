import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import {Tweet} from "../models/tweet.model.js"

const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new ApiError(400 , "Content is required");
    }
    const userId = req.user?._id;

    const newTweet = await Tweet.create({
        content,
        owner:userId,
    })

    const savedTweet = await newTweet.save();

    return res
    .status(200)
    .json(new ApiResponse(200 , savedTweet , "Tweet created successfully"));

})

const getUserTweets = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
     
    if(!userId){
        throw new ApiError(400 , "Invalid userId")
    }
     const tweets = await Tweet.find({owner:userId})
     .sort({createdAt:-1})
     .exec()

     return res
     .status(200)
     .json(new ApiResponse(200 ,tweets,"Tweets fetched successfully"));

})

const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const {content} = req.body;
    if(!tweetId){
        throw new ApiError(400 , "Invalid tweetId")
    }
    if(!content){
        throw new ApiError(400 , "Content is required")
    }
   const updatedTweet =  await Tweet.findByIdAndUpdate(
        tweetId,
        {content},
        {new:true}
    )
    if(!updatedTweet){
        throw new ApiError(404 , "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , updatedTweet,"Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400 , "Invalid tweetId")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

     if(!deletedTweet){
        throw new ApiError(404 , "Tweet not found");
     }

     return res
     .status(200)
     .json(new ApiResponse(200 , {} , "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}