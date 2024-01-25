import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;
    
    if(!content && !videoId) throw new ApiError(400 , "content of comment or videoId is missing");

    const createDatabase = await Comment.create({
        content : content,
        owner : req.user?._id,
        video : videoId
    });

    if(!createDatabase) throw new ApiError(500 , "Something went wrong while creating comment in the database");

    return res 
    .status(200)
    .json(new ApiResponse(200 , createDatabase , "comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!commentId && !content) throw new ApiError(400 , "Either commentId or content is not in the request");

    const updateDatabase = await Comment.findByIdAndUpdate(commentId ,{
        $set : {content : content}
    });

    if(!updateDatabase) throw new ApiError(500 , "Failed updating the database");

    return res
    .status(200)
    .json(new ApiResponse(200 , updateDatabase , "comment updated successfully"));    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId) throw new ApiError(400 , "Provide the commentId");

    const deleteDatabase = await Comment.deleteOne({_id : commentId});
    if(!deleteDatabase) throw new ApiError(500 , "Failed to delete the comment from the database");

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }