import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import {Video} from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js"

const getChannelStats = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400 , "Invalid Channel ID");
    }
    const videos = await Video.find({owner:channelId});
    if(!videos){
        throw new ApiError(400 , "Invalid Channel ID");
    }
    const getTotalViews = await videos.reduce((sum , video)=> sum + video.views , 0);
    const totalSubscribers = await Subscription.countDocuments({channel:channelId});
    const totalVideos = videos.length;
    const totalLikes = await Like.countDocuments({video : { $in : videos.map((video)=> video._id)}})

    return res
    .status(200)
    .json(new ApiResponse(200 , {getTotalViews,totalSubscribers,totalVideos,totalLikes} , "Channel stats fetched successfully"));
})

const getChannelVideos = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400 , "Invalid Channel ID");
    }
    const Videos = await Video.find({owner:channelId});
    
    return res
    .status(200)
    .json(new ApiResponse(200 , Videos , "Channel videos fetched successfully"));
})

export {
      getChannelStats,
      getChannelVideos
}