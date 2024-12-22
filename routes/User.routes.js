import { Router } from "express";
import { UserLogin, UserLogout, UserRegistration, UpdateUserProfile,currentUserProfile, updatePassword } from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyToken from "../middlewares/auth.middleware.js";


const UserRouter= Router()

UserRouter.route('/register').post(
        upload.fields([
        {
            name: 'profilePicture', 
            maxCount: 1
        }
        ]),
    UserRegistration)

UserRouter.route('/login').post( UserLogin)
UserRouter.route('/logout').post(verifyToken,UserLogout)
UserRouter.route('/updateProfile').put(verifyToken, upload.single('profilePicture'), UpdateUserProfile)
UserRouter.route('/getuser').get(verifyToken, currentUserProfile)
UserRouter.route('/updatePassword').put(verifyToken, updatePassword)
export default UserRouter