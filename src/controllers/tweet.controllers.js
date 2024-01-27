import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if (!content) throw new ApiError(400, "No content found");

    const createDatabase = await Tweet.create({
        content: content,
        owner: req.user?._id
    });

    if (!createDatabase) throw new ApiError(500, "failed to create the tweet in the database");

    return res
        .status(200)
        .json(new ApiResponse(200, createDatabase, "tweet uploaded succesfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body;
    const { tweetId } = req.params;
    if (!content && !tweetId) throw new ApiError(400, "Content or tweeId not found");

    const updateDatabase = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content: content
        }
    });

    if (!updateDatabase) throw new ApiError(500, "Failed to update the database");

    updateDatabase.content = content;

    return res
        .status(200)
        .json(new ApiResponse(200, updateDatabase, "tweet Updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if (!tweetId) throw new ApiError(400, "TweetId not found in the params");

    const deleteDatabase = await Tweet.deleteOne(
        {
            _id: tweetId
        }
    );

    if (!deleteDatabase) throw new ApiError(500, "Failed to delete the tweet from the database");

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}