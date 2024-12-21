import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config();

   // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
   // file upload from localstorage

   const fileupload= async (cloudinaryfilepath)=>{
    if(!cloudinaryfilepath) return null

    try {
        const uploadResult = await cloudinary.uploader
        .upload(
            cloudinaryfilepath, {
                resource_type:'auto',
            }  
        )
        fs.unlinkSync(cloudinaryfilepath)
        return uploadResult
    } catch (error) {
        fs.unlinkSync(cloudinaryfilepath)
        throw error
    }   
   }

   const filedelete= async (cloudinaryfilepath)=>{
    if(!cloudinaryfilepath) return null

    try {
        const deleteResult = await cloudinary.uploader
        .destroy(
            cloudinaryfilepath, {
                resource_type:'auto',
            }  
        )
       
        return uploadResult
    } catch (error) {
    
        throw error
    }   
   }

   export {
            fileupload, 
            filedelete
        } 