import asyncHandler from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import cloudinaryUpload from '../utils/cloudinary.js'
import sendMail from "../utils/sendMail.js"
import jwt from "jsonwebtoken"
import { totp } from "otplib"
import token from "../utils/otp.js"

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
    secure: true,
    sameSite: 'None'

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
        if (error instanceof apiError) {

            return res.status(error.statusCode)
                .json(new apiResponse(error.statusCode, error.message, error.description))
        }

    }
})
const sendOtp = asyncHandler(async (req , res)=>{
    const user = req.user
    const secret = process.env.OTP_SECRET + user.email
    totp.options = { step: 15*60 };
    const otp = totp.generate(secret)
    console.log(otp);
    
    const subject = "please verify your mail "
    const message = `Your OTP is ${otp} . Only Valid For Next 15 min `
    const receiverMail = user.email
    console.log(receiverMail);
    
    const sendOtp =  sendMail(subject, message, receiverMail)
    if (!sendOtp) {
        throw new apiError(500, "Failed to send OTP")
    }
    return res
    .status(200)
    .json(
        new apiResponse(200, message, "OTP sent successfully")
    )

})
const verifyMail = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const user = req.user
    const verify = totp.verify({
        token: otp,
        secret: process.env.OTP_SECRET+  user.email
    })
    if (!verify) {
        throw new apiError(401, "Invalid OTP")
    }
    const userUpdate = await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                isEmailVerified: true

            }
            
        },
        {
            new: true
        }
    ).select("-password -refreshToken")
    return res
    .status(200)
    .json(
        new apiResponse(200,
            userUpdate,
             "Email verified successfully", )
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
    const { newPassword, reenterNewPassword } = req.body
    const user = req.user
    try {
        if (!newPassword || !reenterNewPassword) {
            throw new apiError(
                400,
                "Credentials Required"
            )
        }
        if (newPassword !== reenterNewPassword) {
            throw new apiError(
                400,
                "Password do not match",
            )
        }
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
    } catch (error) {
        if (error instanceof apiError) {

            return res.status(error.statusCode)
                .json(new apiResponse(error.statusCode, error.message, error.description))
        }


    }
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
                user,
                "Profile Image Updated Successfully"
            )
        )
})

const chnageUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email, userName, bio } = req.body
    const user = req.user

    try {
        if (userName && user.userName !== userName) {
            const existingUser = await User.findOne({ userName });
            if (existingUser) {
                throw new apiError(400, "Username Already Exists");
            }
            user.userName = userName;
        }

        if (email && user.email !== email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                throw new apiError(400, "Email Already Exists");
            }
            user.email = email;
        }

        if (fullName) {
            user.fullName = fullName
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
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode)
                .json(new apiResponse(error.statusCode, error.message, error.description))
        }

    }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    changeProfileImage,
    chnageUserDetails,
    sendOtp,
    verifyMail,
    getUser
}