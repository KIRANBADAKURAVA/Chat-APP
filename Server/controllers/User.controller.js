import { Asynchandler } from "../utils/Asynchandler.js";
import {ApiError} from '../utils/ApiError.js'
import User from '../model/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { fileupload, filedelete } from "../utils/cloudinary.js";




// user registration
const UserRegistration= Asynchandler(async(req, res)=>{
    const {username, password, publicKey} = req.body
    console.log(req.body)
    if(!username|| !password) throw new ApiError(401, 'All fields are required' )
    if(!publicKey) throw new ApiError(401, 'Public key is required for end-to-end encryption' )
    
    const isPublicKeyValid = /^[A-Za-z0-9+/=]+$/.test(publicKey);
    if(!isPublicKeyValid) throw new ApiError(400, 'Invalid public key format. Please provide a valid base64 encoded public key.')
    const exsistingUser = await User.findOne({
        username
    })
   


    if(exsistingUser) throw new ApiError(400, ' User already exists')
    
    let profilePicturepath;
    if(req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length>0){
        profilePicturepath= req.files.profilePicture[0].path 
    }
   
    const profilePictureupload= await fileupload(profilePicturepath)
    // console.log('profilePictureupload', profilePictureupload)
    
   // if(!profilePictureupload) throw new ApiError(500, 'something went wrong while uploading profile picture')
    
    const newUser= await User.create({
        username,
        password,
        profilePicture: profilePictureupload?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        publicKey
    })

    if(!newUser) throw new ApiError(500, 'something went wrong while creating new user')
    
    
    // console.log('Created user:', {
    //     username: newUser.username,
    //     hasPublicKey: !!newUser.publicKey,
    //     id: newUser._id
    // });

    return res.status(200).json(new ApiResponse(200, newUser, 'User Created successfully' ))
})

//generate access token and refresh token
const generateToken= async(username)=>{
    // console.log('username', username)
    
    const exsistingUser=  await User.findOne({
        username 
    })
    if(!exsistingUser) throw new ApiError(400, ' User does not exists')
        // console.log('exsistingUser', exsistingUser)
    const accesstoken= await exsistingUser.generateAccessToken()
    const refreshtoken=  await exsistingUser.generateRefreshToken()

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

        const {accesstoken, refreshtoken}=  await generateToken(username);
        // console.log('accesstoken', accesstoken)
        if(!accesstoken, !refreshtoken) throw new ApiError(500,' Something went wrong while generating tokens')
            
            const loggedUser = await User.findById(exsistingUser._id).select('-password ')

            const options={
                httpOnly: true,
                secure: true
              }
        
              return res
              .cookie('accesstoken', accesstoken, options)
              .cookie('refreshtoken', refreshtoken, options)
              .status(200)
              .json(
                  new ApiResponse(
                      200,
                      {
                          user: {
                              loggedUser,
                              accesstoken,
                              refreshtoken
                          },
                      },
                      'User logged in successfully'
                  )
              );
})

//logout 
const UserLogout = Asynchandler(async(req, res)=>{
    // console.log(req._id)
    const userId= req._id

    if(!userId) throw new ApiError(500, 'Something went wrong while extrating _id from access token')

    const loggedUser= await User.findByIdAndUpdate(
        userId,
        {
            $unset : {
                refreshToken: 1
            }
        }
    )

    if(!loggedUser) throw new ApiError(500, 'could not find user')

        const options={
            httpOnly: true,
            secure: true
          }
          
          return res
          .status(200)
          .clearCookie("accesstoken", options)
          .clearCookie("refreshtoken", options)
          .json(new ApiResponse(200, {}, "User logged Out"))

})

//update user profile

const UpdateUserProfile= Asynchandler(async(req, res)=>{    
    const userId= req._id


   const profilePicturelocalpath= req.file.path
        

    
    // console.log('profilePicturelocalpath', profilePicturelocalpath)
    const profilePictureupload= await fileupload(profilePicturelocalpath)

    if(!profilePictureupload) throw new ApiError(500, 'something went wrong while uploading profile picture')

        const previousProfilePicture= req.user.profilePicture
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
              $set :{
                profilePicture : profilePictureupload.url
              }
            },
            {
              new:true
            }
          ).select('-password -refreshtoken')

        

          const deletePreviousProfilePicture= await filedelete(previousProfilePicture)

          if(!deletePreviousProfilePicture) throw new ApiError(500, 'something went wrong while deleting previous profile picture')


    if(!user) throw new ApiError(500, 'something went wrong while finding user profile')


    return res.status(200).json(new ApiResponse(200, user, 'User profile updated successfully' ))


})

// get user profile
const currentUserProfile= Asynchandler(async(req, res)=>{
        const userId= req._id
        const user = await User.findById(userId).select('-password -refreshtoken');
        // publicKey is included by default, but ensure it's present
        if(!user) throw new ApiError(500, 'something went wrong while finding user profile')    
        return res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully' ))
})

// update password
const updatePassword= Asynchandler(async(req, res)=>{
    const userId= req._id
    const {oldPassword, newPassword}= req.body

    if(!oldPassword || !newPassword) throw new ApiError(400, 'All fields are required')

    const user= await User.findById(userId)

    if(!user) throw new ApiError(400, 'User does not exists')

    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)


    if(!isPasswordCorrect) throw new ApiError(400, 'Invalid credentials')   

    user.password= newPassword  


    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {}, 'Password updated successfully' ))

})


// get all available users

const getAllUsers= Asynchandler(async(req, res)=>{
    const users= await User.find().select('-password -refreshtoken');
    // publicKey is included by default, but ensure it's present
    return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully' ))
})

// Search user 

const searchUser= Asynchandler(async(req, res)=>{
    const {username}= req.query
    // console.log('username', username)

    const users= await User.find({
        username: {
            $regex: username,
            $options: 'i'
        }
    }).select('-password -refreshtoken')

    if(!users) throw new ApiError(500, 'something went wrong while fetching users')

    return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully' ))

})


// Get PublicKey of a user

const getPublicKey = Asynchandler(async(req, res)=>{
    const {userId} = req.params;
    console.log('userId', userId);
    if(!userId) throw new ApiError(400, 'userId is required to fetch public key');

    const user = await User.findOne({
        _id: userId
    }).select('publicKey');

    if(!user) throw new ApiError(404, 'User not found');
    console.log('Public key', user.publicKey);
    return res.status(200).json(
        new ApiResponse(200, {publicKey: user.publicKey}, 'Public key fetched successfully')
    );
}
);

export {
    UserRegistration,
    UserLogin,
    UserLogout,
    UpdateUserProfile,
    currentUserProfile,
    updatePassword,
    getAllUsers,
    searchUser,
    getPublicKey
}


