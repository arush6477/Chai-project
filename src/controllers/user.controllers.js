import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
//importing user as it can directly access the database through mongoose and will help out a lot
import { User } from "../models/user.models.js";
import { deleteCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went Wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // write down the problem to be solves into small problems and solutions
    // get user details from frontend
    // validation - not empty 
    // check if user already exist:: username and email
    // check for images , check for avatar
    // upload them on cloudinary,avatar
    // create user object - create entry in db 
    // remove password and refresh from the response 
    // check for user creation 
    // return response

    const { fullName, email, username, password } = req.body;
    // console.log("Email: " , email);

    //more advanced syntax for writing the validation statement
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) throw new ApiError(400, "All fields are required");


    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) throw new ApiError(409, "User with same username or email exists");


    //this will give the path to the files through multer we can access it from req 
    // as multer is a middleware it injects some additional info into the req that is files if it is there (files in the req) we can directly get the path from the first array element and we have used ? for safety  
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //handling the undefined error in case if coverImage is not provided by the user
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) throw new ApiError(400, "Avatar file is required");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //_id added by mongoDB in the object returned after creation of user and if it is created that is checked below
    const createdUser = await User.findById((user._id)).select(
        "-password -refreshToken"
    );

    if (!createdUser) throw new ApiError(500, "Something went wrong while creating user");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    );
})

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // username or email based access(what method are we using)
    // find the user
    // password check
    // access and refresh token
    // send cookie 

    const { username, email, password } = req.body;

    if (!username && !email) throw new ApiError(400, "username or password is required");

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) throw new ApiError(404, "User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    anurag: "SADA BHAI"
                },
                "User logged In Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
})

const renewAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken != user?.refreshToken) throw new ApiError(401, "refresh token is expired or used");

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200,
            { accessToken, newRefreshToken }
        ))

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;


    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(400, "User id not found");

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new ApiError(400, "Invalid Password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) throw new ApiError(400, "All fields are required");

    const updated = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password");

    if (!updated) throw new ApiError(200, "failed to update the details in the database");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Account details updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment
    const oldImageLink = await User.findById(req.user?._id);
    await deleteCloudinary(oldImageLink.avatar);
    

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})



const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) throw new ApiError(400, "Cover image file missing");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) throw new ApiError(400, "Error while uploading on cloudinary");

    const deleteAvatarPath = await User.findById(req.user?._id);
    console.log(deleteAvatarPath);
    const deleteAvatar = await deleteCloudinary(deleteAvatarPath.coverImage);
    if(!deleteAvatar) throw new ApiError(500 , "failed to delete the previous image stored in the cloud");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                CoverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password");

    if (!user) throw new ApiError(500, "Something went wrong while updating the Cover image");

    user.coverImage = coverImage.url;

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updates successfully"));

})

const updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;

    if (!username) throw new ApiError(400, "Username is required");

    const alreadyExists = await User.findOne({ username });
    if (alreadyExists) throw new ApiError(400, "Username already exists");

    const user = await User.findByIdAndUpdate(req.user?._id, { username: username });


    if (!user) throw new ApiError(500, "Failed to update the username in the database")
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "username Updated Successfully"))

})
export {
    registerUser,
    loginUser,
    logoutUser,
    renewAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    updateUsername
}