// require('dotenv').config()
import dotenv from "dotenv" 
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:'./env'
})



connectDB()
.then(()=>{
     app.listen(process.env.PORT || 8000 , (req , res)=>{
     console.log(` -> server is running at port ${process.env.PORT}`);
  }) 
})

.catch((error)=>{
  console.log("MongoDb connection failed !!!" , error)
})
























/*
import express from "express"

const app = express();

(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error" , (error)=>{
        console.log("not able");
        throw error;
       })

      app.listen(process.env.PORT , () =>{
        console.log(`app listening on port:${process.env.PORT}`)
      })



    } catch (error) {
        console.log("error:" , error)
        throw error
    }
})()
*/