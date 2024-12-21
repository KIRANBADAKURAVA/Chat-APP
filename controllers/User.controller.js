

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


export {
    UserRegistration
}
