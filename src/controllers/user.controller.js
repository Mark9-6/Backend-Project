import { get } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId)=>{
  try {
         const user = await User.findById(userId)
         const accessToken = user.generateAccessToken()
         const refreshToken = user.generateRefreshToken()
         user.refreshToken = refreshToken         // adds refresh token to user
        await user.save({validateBeforeSave:false})
       return {accessToken , refreshToken}


  } catch (error) {
    throw new ApiError(500  , "something went wrong while generating refersh and access tokens")
  }
}



const registerUser = asyncHandler(async(req,res)=>{
      // get user details from forntend
      // validate like spaces , caharcters , not empty
      // check of username is unique i.e. alreaady exists
      // upload of avatar
    const {fullName , email , username , password} = req.body;

    //  console.log( email);
    //  console.log( fullName);
    //  console.log( password);
    //  console.log( username);
     
    //  if(fullName==""){
    //   throw new  ApiError(400, "fullname is required");
    //  }

  //  for checking every field input by user

    if(
       [fullName , email ,username , password].some((field)=>( field?.trim() ===""))
    ){
      throw new  ApiError(400, "All fields are required");
    }
  
    const existedUser = await User.findOne({                           // await isimportant because
      $or : [{username} , {email} ],
    })

    if(existedUser){
      throw new ApiError(409 , "user already exists");
    }
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0 ){
      coverImageLocalPath=req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
      throw new ApiError(400 , "Avatar file is required ")
    } 

      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const user =  await User.create({
      fullName ,
       avatar:avatar.url,
       coverImage: coverImage?.url ||"",               // check to karo if user has uploaded or not
       email,
       password,
       username:username.toLowerCase(),
      })
      
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )
      if(!createdUser){
        throw new ApiError(500 , "something went wrong while registering user");
      }
      
      return res.status(201).json(
        new ApiResponse(200 , createdUser ,"user registered successfully")
      )

})

const loginUser = asyncHandler(async(req , res)=>{
    // get data from req body 
    // username or email
    // find the user
    // if user then
    // check password 
    // if correct password
    // generate access and refrest token 
    //send cookies 
    // response "logged in"

    const{email , password , username} = req.body
    if(!username || !email){
      throw new ApiError( 400 , "username or email is required")
    }

   const user = await User.findOne({
    $or:[{username} , {email}]            // finds value on any of this
   })

   if(!user){
    throw new ApiError(404 , "User does not exists")
   }

   const  isPasswordValid = await user.isPasswordCorrect(password);

   if(!isPasswordValid){
    throw new ApiError(401 , "Invalid user credentials")
   }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)
     
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options ={
       httpOnly:true,
       secure:true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken,options)
    .cookie("refreshToken" , refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,
          refreshToken
        },
        "user logged in successfully"
      )
    )

})

const logOutUser = asyncHandler(async(req,res)=>{
      await User.findByIdAndUpdate(req.user._id , {
        $set:{refreshToken : undefined}
       })

       const options ={
        httpOnly:true,
        secure:true
     }

     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200 ,{} , "User logged Out"))
         

})





export {registerUser , loginUser , logOutUser}
