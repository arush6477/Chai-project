import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
//importing user as it can directly access the database through mongoose and will help out a lot
import {User} from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

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

export {
    registerUser,
}
