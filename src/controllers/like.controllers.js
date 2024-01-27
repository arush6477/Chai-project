import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    //TODO: toggle like on video
    if(!videoId) throw new ApiError(400 , "VideoId is not found in the params");
    
    const databaseCreate = await Like.create({
        video : videoId 
    })

    if(!databaseCreate) throw new ApiError(500 , "Failed to update the database");

    return res
    .status(200)
    .json(new ApiResponse(200 , databaseCreate , "Succesfully liked the video"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId) throw new ApiError(400 , "VideoId is not found in the params");
    
    const databaseCreate = await Like.create({
        video : commentId 
    })

    if(!databaseCreate) throw new ApiError(500 , "Failed to update the database");

    return res
    .status(200)
    .json(new ApiResponse(200 , databaseCreate , "Succesfully liked the video"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId) throw new ApiError(400 , "VideoId is not found in the params");
    
    const databaseCreate = await Like.create({
        video : tweetId 
    })

    if(!databaseCreate) throw new ApiError(500 , "Failed to update the database");

    return res
    .status(200)
    .json(new ApiResponse(200 , databaseCreate , "Succesfully liked the video"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}