import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import mongoose from "mongoose"

const PORT = process.env.PORT || 5000
const app = express()
const MONGO_URI = process.env.MONGO_URI

app.use(cors({
  origin: "http://localhost:5174",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}))
app.use(express.json())

const start = async()=>{
  try{
    app.listen(PORT,()=>console.log("ок"))
  }
  catch(e){
    console.log(e)
  }
}

start()
