import { ApiError } from "../utils/ApiError.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import jwt from 'jsonwebtoken'
import User from "../model/user.model.js";

const verifyToken= Asynchandler(async (req,res, next)=>{

      //console.log(req.cookies);
      
   const token= req.cookies?.accesstoken ||  req.header("Authorization")?.replace("Bearer ", "")
   //console.log(token)
   if(!token) throw new ApiError(401, 'token Access Denied')
     
   try {
         //console.log( token)
         const verified= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
         //console.log(verified);
         
         req._id= verified.id
         
         const user= await User.findById(req._id)  
         if(!user) throw new ApiError(401, 'Access Denied')
         req.user= user
         next()

   } catch (error) {
    throw new ApiError(400, error.message)
   }
})

export default verifyToken