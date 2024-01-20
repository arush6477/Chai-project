import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary , deleteCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
        console.log(req);
    
        // search for videos with the same owner
        const video = await Video.find({
            owner : req.user._id
        }).limit(limit).select("-owner -createdAt -updatedAt");
    
        if(!video) throw new ApiError(400 , "Something went wrong while getting the videos");
    
        // console.log(video);
    
        return res 
        .status(200)
        .json(new ApiResponse(200 , video , "These are the videos"));
    } catch (error) {
        throw new ApiError(200 , "Something went wrong");
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    // TODO: get video, upload to cloudinary, create video\

    if(!title || !description) throw new ApiError(400 , "Title and description are required!");

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!videoFileLocalPath) throw new ApiError(400 , "Video file path not found");

    // let thumbnailLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     thumbnailLocalPath = req.files.thumbnail[0].path;
    // }

    // OR
   
    //
    
    const videoUpload = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

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
    if(!videoId) throw new ApiError(400 , "VideoId is not there in the params");

    const video = await Video.findById(videoId);

    if(!video) throw new ApiError(500 , "Something went wrong while getting the video").select("-createdAt -updatedAt -__v -_id -owner");

    return res 
    .status(200)
    .json(new ApiResponse(200 , video , "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId) throw new ApiError(400 , "Video I'd not found");

    const thumbnailLocalPath = req.file?.path;
    if(!thumbnailLocalPath) throw new ApiError(400 , "Failed to get the thumbnail local path");

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnailUpload) throw new ApiError(500 , "Failed to upload the thumbnail on the cloudinary");

    const prevThumbnail = await Video.findById(videoId);
    console.log(prevThumbnail);

    const videoUpdate = await Video.findByIdAndUpdate(videoId , {
        $set : {thumbnail : thumbnailUpload.url}
    });

    if(!videoUpdate) throw new ApiError(500 , "Failed to upload the thumbnail on cloudinary");

    const deletedCloudinary = await deleteCloudinary(prevThumbnail.thumbnail);

    if(!deletedCloudinary) throw new ApiError(500 , "Failed to delete from cloudinary");
    
    return res 
    .status(200)
    .json(new ApiResponse(200 , {} , "Thumbnail updated successfully"));    
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400 , "Video Id not found");

    const videoDelete = await Video.deleteOne(videoId);

    if(!videoDelete) throw new ApiError(500 , "Failed to delete he video");

    return res 
    .status(200)
    .json(new ApiResponse(200 , {} , "Video deleted successfully"));
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