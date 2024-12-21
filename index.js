import connectDB from "./db/indexdb.js";
import dotenv from 'dotenv'
import app from "./app.js";

dotenv.config({
    path: './.env'
})



connectDB()
.then(()=>{
   
    app.listen(process.env.PORT,()=>{
        console.log('listioning ', process.env.PORT);
    } )
   
})
.catch((error )=>(console.error('Error in conneting server at intdex.js file ',   error)))