import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError";

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(400 , "Invalid channelId");
    } 

    const userId = req.user?._id;

    const existingSubscription = await Subscription.findOne({subscriber : userId , channel:channelId})

    let message;
    if(existingSubscription){
        await existingSubscription.remove();
        message = "Unsubscribed successfully"
    }
    else {
        await Subscription.create({subscriber:userId,channel:channelId})
        message="Subscribed successfully"
    }
     return res
     .status(200)
     .json(200 ,{}, message)
})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId}= req.params;
    if(!channelId){
        throw new ApiError(400 , "Invalid channelId")
    }
     const subscribers = await Subscription.find({channel:channelId})
     .populate('subscriber' , 'username')
     .exec()

     return res
     .status(200)
     .json(200 , subscribers,"Subscribers fetched successfully");
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params;
    if(!subscriberId){
        throw new ApiError(400 , "Invalid subscriberId")
    }
    const subscribedChannels = await Subscription({subscriber:subscriberId})
    .populate('channel' , 'username')
    .exec()

    return res
    .status(200)
    .json(200 , subscribedChannels ,"Subscribed channels fetched sucessfully");
})

export {
    toggleSubscription,
    getSubscribedChannels,
    getSubscribedChannels
}