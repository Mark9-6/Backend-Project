import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse";


const getVideoComments = asyncHandler(async(req,res)=>{
     const{videoId} = req.params;
     const{page = 1 ,limit=10} = req.query;

     if(!videoId || isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid video ID");
     }

     const comments = await Comment.aggregatePaginate(
        {videoId},
        {page:page , limit , sort:{createdAt :-1}}
    )
    return res
    .status(200)
    .json(new ApiResponse(200 , comments , "Comments fetched successfully"));

})

const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {text} = req.body;
    if(!videoId || isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid video ID");
     }
     if(!text){
        throw new ApiError(400 , "Comment required");
     }

     const newComment = await Comment.create({
        videoId,
        text,
        userId:req.user?._id
     })

     const savedComment = await newComment.save();
     return res
     .status(200)
     .json(new ApiResponse(200 , savedComment , "Comment added successfully"));

})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const {text} = req.body;
    
    if(!commentId || isValidObjectId(commentId)){
        throw new ApiError(400 , "Invalid commentId");
     }
     if(!text){
        throw new ApiError(400 , "Comment required");
     }

     const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {text},
        {new:true}
    )
    if(!updatedComment){
        throw new ApiError(404 , "Comment not found");
    }
    return res
    .status(200)
    .json(200 , updatedComment , "Comment updated successfully");
})

const deleteComment = asyncHandler(async(req,res)=>{
    const{commentId} = req.params;
    if(!commentId){
        throw new ApiError(400 , "Invalid commentId")
    }
     const deletedComment = await Comment.findByIdAndDelete(commentId);
     if(!deletedComment){
        throw new ApiError(404 , "Comment not found")
     }

     return res
     .status(200)
     .json(new ApiResponse(200 , deletedComment,"Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}