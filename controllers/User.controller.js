

import { Asynchandler } from "../utils/Asynchandler.js";
import {ApiError} from '../utils/ApiError.js'
import User from '../model/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { fileupload } from "../utils/cloudinary.js";



// user registration
const UserRegistration= Asynchandler(async(req, res)=>{

    const {username, password} = req.body
    if(!username|| !password) throw new ApiError(401, 'All fields are required' )

      const exsistingUser=  await User.findOne({
            username 
        })

        if(exsistingUser) throw new ApiError(400, ' User already exists')
        
            let profilePicturepath;
        if(req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length>0){
            profilePicturepath= req.files.profilePicture[0].path 
        }
       
        const profilePictureupload= await fileupload(profilePicturepath)
        console.log('profilePictureupload', profilePictureupload)
        
        if(!profilePictureupload) throw new ApiError(500, 'something went wrong while uploading profile picture')
        
            const newUser= await User.create({
            username,
            password,
            profilePicture :profilePictureupload.url
        })

        if(!newUser) throw new ApiError(500, 'something went wrong while creating new user')
        

        return res.status(200).json(new ApiResponse(200, newUser, 'User Created successfully' ))
})

//generate access token and refresh token

const generateToken= async(username)=>{
    //console.log('username', username)
    
    const exsistingUser=  await User.findOne({
        username 
    })
    if(!exsistingUser) throw new ApiError(400, ' User does not exists')
        console.log('exsistingUser', exsistingUser)
    const accesstoken=  exsistingUser.generateAccessToken()
    const refreshtoken=  exsistingUser.generateRefreshToken()

    exsistingUser.refreshToken= refreshtoken
    await exsistingUser.save({validateBeforeSave: false})

    return {accesstoken, refreshtoken}

}
// user login
const UserLogin= Asynchandler(async(req, res)=>{
    const {username, password} = req.body
    if(!username|| !password) throw new ApiError(401, 'All fields are required' )

    const exsistingUser=  await User.findOne({
        username 
    })

    if(!exsistingUser) throw new ApiError(400, ' User does not exists')

    const isPasswordCorrect= await exsistingUser.isPasswordCorrect(password)

    if(!isPasswordCorrect) throw new ApiError(400, 'Invalid credentials')

        const {accesstoken, refreshtoken}= await generateToken(username);

        if(!accesstoken, !refreshtoken) throw new ApiError(500,' Something went wrong while generating tokens')
            
            const loggedUser = await User.findById(exsistingUser._id).select('-password ')

            const options={
                httpOnly: true,
                secure: true
              }
        
    return res.cookie('access_token', accesstoken,options).
                cookie('refresh_token', refreshtoken, options)
                .status(200).json( new ApiResponse(200, {
                    user: {loggedUser, accesstoken, refreshtoken}
                },'User logged in successfully'))

})

//

export {
    UserRegistration,
    UserLogin
}


