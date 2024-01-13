import mongoose from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true//to make searching easier
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    fullname : {
        type : String,
        required : true,
        trim : true,
        index: true
    },
    avatar : {
        type : String,// cloudinary url
        required : true
    },
    coverImage : {
        type : String
    },
    watchHostory : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
    },
    password : {
        type : String,
        required : [true , "Password is required"]
    },
    refreshToken :{
        type : String
    }
},{timestamps : true});

// hook that isused to perform a specific task just before the data is going to be added
userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function(){
    jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullname            
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
} 
userSchema.methods.generateRefreshToken = async function(){
    jwt.sign(
        {
            _id : this._id,          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 

export const User = mongoose.model("User",userSchema);
