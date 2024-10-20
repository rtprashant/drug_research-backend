import asyncHandler from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import cloudinaryUpload from '../utils/cloudinary.js'
import sendMail from "../utils/sendMail.js"
import jwt from "jsonwebtoken"

const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }
    } catch (error) {
        throw new apiError(
            400,
            "failed to genrate access and refresh token"
        )
    }
}


const options = {
    httpOnly: true,
    // secure: true, // Remove or comment out this line for local development
    
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, password, email, role, bio } = req.body
    try {
        if (!fullName || !userName || !password || !email || !role) {
            throw new apiError(
                400, "all fileds are required"
            )
        }
        const existedUser = await User.findOne({
            $or: [{ userName }, { email }]
        })
        if (existedUser) {
            throw new apiError(
                400,
                "user already exist try with diffrent user name or mail"
            )
        }
        const profileImageLocalPath = req.file?.path
        console.log(profileImageLocalPath);

        if (!profileImageLocalPath) {
            throw new apiError(
                400,
                "proflie image local path error"
            )
        }
        const profileImage = await cloudinaryUpload(profileImageLocalPath)
        if (!profileImage) {
            throw new apiError(
                400,
                "Profile Image Is Required"
            )
        }


        const user = await User.create({
            fullName,
            userName,
            password,
            email,
            profileImage: profileImage.url,
            role,
            bio: bio || "",
            isEmailVerified: false,


        })



        const createdUser = await User.findById(user._id).select("-password  -refreshToken")
        if (!createdUser) {
            throw new apiError(
                500,
                "failed to create a user"
            )
        }
        const mailVerificationToken = jwt.sign(
            {

                email
            },

            process.env.MAIL_VERIFICATION_SECRET,
            {
                expiresIn: process.env.MAIL_VERIFICATION_EXPIRY,
            }
        )
        if (!mailVerificationToken) {
            throw new apiError(400,
                "failed to genrate email verification token"
            )
        }
        try {
            await sendMail("Verify your mail", mailVerificationToken, email)
        } catch (error) {
            throw new apiError(
                400,
                "failed to send email verification token"
            )
        }
        return res
            .status(201)
            .json(
                new apiResponse(200, createdUser, "user registered successfully")
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode)
            .json(new apiResponse(error.statusCode, error.message, error.description))

        }

    }

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, userName, role } = req.body
    try {
        if ((!email && !userName) || !password || !role) {
            throw new apiError(
                400,
                "Require All The Credantilas"
            )
        }
        const user = await User.findOne({
            $or: [{ userName }, { email }]
        })
        if (!user) {
            throw new apiError(
                401,
                "User not found"
            )
        }
        const checkPassword = await user.comparePassword(password)
        if (!checkPassword) {
            throw new apiError(
                401,
                "Invalid Password"
            )
        }
        if (user.role != role) {
            throw new apiError(
                401,
                "Unauthorized User"
            )
        }
        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id)
        console.log(accessToken)
        console.log(refreshToken);
        const loggedInUser = await User.findById(user._id).select("-password  -refreshToken")
        return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .status(200)
            .json(
                new apiResponse(
                    200,
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "user login successfull"
    
                )
            )
    } catch (error) {
        if(error instanceof apiError){
           
            return res.status(error.statusCode)
            .json(new apiResponse(error.statusCode, error.message, error.description))
        }
        
    }
})

const verifyMail = asyncHandler(async (req, res) => {
    const { mailVerificationToken } = req.body
    if (!mailVerificationToken) {
        throw new apiError(
            400,
            "Unauthorized Request"
        )
    }
    const decodeMailVerificationToken = jwt.verify(mailVerificationToken, process.env.MAIL_VERIFICATION_SECRET)
    console.log(decodeMailVerificationToken);

    if (!decodeMailVerificationToken) {
        throw new apiError(
            400,
            "Invalid Mail Verification Token"
        )
    }
    const user = await User.findOne({ email: decodeMailVerificationToken.email })
    if (!user) {
        throw new apiError(
            400,
            "User Not Found"
        )
    }
    console.log(user);

    user.isEmailVerified = true
    await user.save(
        { validateBeforeSave: false }
    )
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "User Email Verified"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user
    await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                accessToken: undefined,
            }
        },
        {
            new: true
        }
    )
    return res
        .status(201)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(
            new apiResponse(
                200,
                {},
                "user logout successfull"
            )
        )

})
const getUser = asyncHandler(async (req, res) => {
    const user = req.user
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "User Fetched Successfully"
            )
        )
})
const changePassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body
    const user = req.user
    user.password = newPassword
    await user.save({
        validateBeforeSave: false
    })
    res
        .status(201)
        .json(
            new apiResponse(
                200,
                {},
                "password changed successfully"

            )
        )
})

const changeProfileImage = asyncHandler(async (req, res) => {
    const user = req.user
    const localPath = req.file?.path
    if (!localPath) {
        throw new apiError(
            400,
            "Image LocalPath Not Found"
        )
    }
    const updatedProfileImage = await cloudinaryUpload(localPath)
    console.log(updatedProfileImage);
    if (!updatedProfileImage.url) {
        throw new apiError(
            400,
            "Updated Image Not Found"
        )
    }
    user.profileImage = updatedProfileImage.url
    await user.save({
        validateBeforeSave: false,
    })
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { profileImage: updatedProfileImage.url },
                "Profile Image Updated Successfully"
            )
        )
})

const chnageUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email, userName, bio } = req.body
    const existedDetails = await User.findOne(
        {
            $or: [{ userName }, { email }]
        }
    )
    if (existedDetails) {
        throw new apiError(
            400,
            "User Credantials Already Exist"
        )
    }
    const user = req.user
    if (fullName) {
        user.fullName = fullName
    }
    if (email) {
        user.email = email
    }
    if (userName) {
        user.userName = userName
    }
    if (bio) {
        user.bio = bio
    }
    await user.save({
        validateBeforeSave: true
    })
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "User Details Updated Successfully"
            )
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    changeProfileImage,
    chnageUserDetails,
    verifyMail,
    getUser
}