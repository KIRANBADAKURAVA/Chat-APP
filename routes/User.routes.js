import { Router } from "express";
import { UserRegistration } from "../controllers/User.controller.js";
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


export default UserRouter