import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    let filter = {};

    if (query) {
        filter.title = { $regex: query, $options: 'i' }      // filter is a object which stores title which stores query eg:fun videos
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }
    const sort = {}
    sort[sortBy] = sortType === 'asc' ? 1 : -1;

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const skip = (pageNumber - 1) * limitNumber;

    const videos = await Video.find(filter).sort(sort).skip(skip).limit(limitNumber).populate('owner', 'name')

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (
        [title, description].some((field) => (field?.trim() === ""))
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!req.file) {
        throw new ApiError(400, "No video file uploaded");
    }

    const videoUploadResult = await uploadOnCloudinary(req.file.path, "video");
    const thumbnailUploadResult = await uploadOnCloudinary(req.file.thumbnailPath, "image");

    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoUploadResult.secure_url,
        thumbnail: thumbnailUploadResult.secure_url,
        duration: videoUploadResult.duration,
        owner: req.user._id

    })
    return res
        .status(201)
        .json(200, newVideo, "Video published successfully")


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate('onwer', 'name');

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfull"));

})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {title , description , thumbnail} = req.body;

    if(!videoId && !isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404 , "Video not found");
    }
    // if(
    //     [title , description, thumbnail].some((field)=> (field?.trim()===""))
    // ){
    //     throw new ApiError(400 , "All fields are required for updating video");
    // }

    video.title = title|| video.title;
    video.description=description||video.description;
    
    if(thumbnail){
        const thumbnailUploadResult = await uploadOnCloudinary(thumbnail, "image");
        video.thumbnail = thumbnailUploadResult.secure_url;
    }

    await video.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(200 , video , "Video updated successfully")

})

const deleteVideo = asyncHandler(async(req , res)=>{
    const{videoID} = req.params;
    if(!videoID || isValidObjectId(videoID)){
        throw new ApiError(400 , "Invalid video ID");
    }

    const video = await Video.findByIdAndDelete(videoID);
    if(!video){
        throw new ApiError(404 , "Video not found");
    }
    return res
    .status(200)
    .json(new ApiResponse(200 , {} ,"Video deleted successfully" ));
})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404 , "Video not found");
    }
    video.isPublished= !video.isPublished;

    await video.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Video publish status toggled"))

})

export {
    getAllVideos , getVideoById , updateVideo,deleteVideo,togglePublishStatus,publishAVideo
}