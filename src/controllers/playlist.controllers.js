import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import Video from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videos } = req.body;
    //TODO: create playlist
    if (!name && !description && !videos) throw new ApiError(400, "Name or Description or videos not found");

    const createDatabase = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
        videos: videos
    })

    if (!createDatabase) throw new ApiError(500, "Failed to create the playlist in the database");

    return res
        .status(200)
        .json(new ApiResponse(200, createDatabase, "playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!userId) throw new ApiError(400, "userId is not there in the req");

    const playlists = await Playlist.find(
        {
            owner: userId
        }
    );

    if (!playlists) throw new ApiError("Something went wrong while getting the data");

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "These are the playlists"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!playlistId) throw new ApiError(400, "PlaylistId is not there in the params");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) throw new ApiError(500, "Failed to fetch the playlist from the database");

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!playlistId && !videoId) throw new ApiError(400, "playlistId or videoId not found");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(400, "playlist not found");

    

    // Add the videoId to the videos array of the playlist
    playlist.videos.push(videoId);

    // Save the updated playlist document
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist updated successfully"));

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId && !videoId) throw new ApiError(400 , "playlistId or videoId not found in the req");

    return res 
    .status(200)
    .json(new ApiResponse(200 , removePlaylist , "video removed successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId) throw new ApiError(400, "playlistId not found");

    const deleteDatabase = await Playlist.deleteOne({
        _id: playlistId
    });

    if (!deleteDatabase) throw new ApiError(400, "Failed to delete from the database");

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "playlist deleted successfully"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!playlistId && (!name || !description)) throw new ApiError(400, "Name or description along with playlist id is required");

    const updateDatabase = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name: name,
            description: description
        }
    });

    if (!updateDatabase) throw new ApiError(500, "Failed to update the playlist in the database");

    updateDatabase.name = name;
    updateDatabase.description = description;

    return res
        .status(200)
        .json(new ApiResponse(200, updateDatabase, "playlist updated successfuly"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}