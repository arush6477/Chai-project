import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    // TODO: get video, upload to cloudinary, create video\

    if(!title || !description) throw new ApiError(400 , "Title and description are required!");

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    if(!videoFileLocalPath) throw new ApiError(400 , "Video file path not found");

    // let thumbnailLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     thumbnailLocalPath = req.files.thumbnail[0].path;
    // }

    // OR
   
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (thumbnailLocalPath) {const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);}
    //
    
    const videoUpload = await uploadOnCloudinary(videoFileLocalPath);

    if(!videoUpload) throw new ApiError(500 , "Failed to upload the video");

    const video = await Video.create({
        videoFile : videoUpload.url,
        thumbnail : thumbnailUpload.url || "",
        title : title,
        description : description,
        duration : videoUpload.duration,
        owner : req.user._id
    })

    if(!video) throw new ApiError(500 , "failed to upload the video on cloudinary");

    return res
    .status(200)
    .json(new ApiResponse(200 , video , "Video is published successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}