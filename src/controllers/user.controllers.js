import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
//importing user as it can directly access the database through mongoose and will help out a lot
import {User} from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken(); 
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken , refreshToken};

    } catch (error) {
        throw new ApiError(500 , "Something went Wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req,res) => {
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

    const {fullName, email , username , password} = req.body;
    // console.log("Email: " , email);

    //more advanced syntax for writing the validation statement
    if(
        [fullName , email , username , password].some((field) => field?.trim() === "")
    ) throw new ApiError(400 , "All fields are required");
    

    const existingUser = await User.findOne({
        $or : [{ username } , { email }]
    });

    if(existingUser) throw new ApiError( 409 , "User with same username or email exists" );
    

    //this will give the path to the files through multer we can access it from req 
    // as multer is a middleware it injects some additional info into the req that is files if it is there (files in the req) we can directly get the path from the first array element and we have used ? for safety  
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //handling the undefined error in case if coverImage is not provided by the user
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(400 , "Avatar file is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400 , "Avatar file is required");

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    //_id added by mongoDB in the object returned after creation of user and if it is created that is checked below
    const createdUser = await User.findById((user._id)).select(
        "-password -refreshToken"
    );

    if(!createdUser) throw new ApiError(500 , "Something went wrong while creating user");
    
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "user registered successfully")
    );
})

const loginUser = asyncHandler(async (req,res) =>{
    // req.body -> data
    // username or email based access(what method are we using)
    // find the user
    // password check
    // access and refresh token
    // send cookie 

    const {username , email , password} = req.body;
    
    if(!username && !email) throw new ApiError(400 , "username or password is required");

    const user  = await User.findOne({
        $or : [{ username },{ email }]
    });

    if(!user) throw new ApiError(404 , "User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(401 , "Invalid credentials");

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    const loggedInUser = User.findById(user._id).select("-password -refreshToken");
    
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200, 
            {
                anurag : "SADA BHAI"
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    );

    const options = {
        httpOnly:true ,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200 , {} , "User logged Out")); 
})

const renewAccessToken = asynchandler(async (req,res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(401 , "unauthorized request");

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
    const user = User.findById(decodedToken?._id);
    
    if(!user) throw new ApiError(401 , "Invalid refresh token");

    if(incomingRefreshToken != user?.refreshToken) throw new ApiError(401 , "refresh token is expired or used");

    const options = {
        httpOnly : true,
        secure : true
    }

    const {accessToken , newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , newRefreshToken , options)
    .json(new ApiResponse(
        200 , 
        {accessToken , newRefreshToken}
    ))

})

export {
    registerUser,
    loginUser,
    logoutUser,
    renewAccessToken
}
