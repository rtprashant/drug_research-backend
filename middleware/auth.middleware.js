import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =  await (req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", ""))
        if(!token){
            return res.status(401).json({message: "Unauthorized Request"})
        }
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        console.log(`decoded token is ${decodedToken}`);
        
        const user = await User.findById(decodedToken._id).select("-password  -refreshToken")   
        if(!user){
            throw new apiError(401, "user not found Invalid Access Token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new apiError(401 ," Invalid Access Token")
    }
})

export default verifyJWT
