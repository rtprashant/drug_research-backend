import { apiError } from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";

const verifiedUser = asyncHandler(async(req, res ,next)=>{
    const user = req.user
    if(!user.isEmailVerified){
        throw new apiError(
            400,
            "Please Verify Your Email To Access This Resource"
        )
    }
    next()
})
export default verifiedUser