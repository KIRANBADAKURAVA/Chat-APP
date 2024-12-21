import { Router } from "express";
import { UserLogin, UserRegistration } from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


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


export default UserRouter