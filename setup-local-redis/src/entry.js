import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.get("/redis", async(req,res)=>{
    const reply = await redis.ping();
    res.status(200).json({redis: reply});

});

app.get("/mongo", async(req,res)=>{
    try{
        await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/DB-redis");
        res.status(200).json({mongo: "Connected to MongoDB", database: mongoose.connection.name});
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});