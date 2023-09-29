require("dotenv").config()
import { Redis } from "ioredis";

const redisClient = () => {
    if (process.env.REDIS_URI) {
        console.log("Redis connected")
        return process.env.REDIS_URI
    }

    throw new Error("Redis connection failed")
}

export const redis = new Redis(redisClient())
