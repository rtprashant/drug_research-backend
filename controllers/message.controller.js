import asyncHandler from "../utils/asyncHandler.js";
import { Group, Message } from "../models/group.model.js"
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";

const createNewGroup = asyncHandler(async (req, res) => {
    const { groupName, password } = req.body
    const user = req.user._id
    try {
        if (!groupName || !password) {
            throw new apiError(
                400,
                "Invalid request"
            )
        }
        const existedGroup = await Group.findOne({ groupName })
        if (existedGroup) {
            throw new apiError(
                400,
                "Group name already exists Try another Name"
            )
        }
        const group = await Group.create({ groupName, password, createdBy: user })
        group.members = user
        await group.save()
        const groupWithoutPassword = await Group.findById(group._id).select("-password");


        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    groupWithoutPassword,
                    "Group created successfully"
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode).json(new apiResponse(error.statusCode, error.message, error.description))
        }

    }
})

const addMemberInGroup = asyncHandler(async (req, res) => {
    const { userName, groupName } = req.body
    try {
        const user = await User.findOne({ userName })
        if (!user) {
            throw new apiError(400,
                "User Not Found , Failed To Join"
            )
        }
        const group = await Group.findOne({ groupName })
        const response = await group.addGroupMembers(user._id)
        console.log(response);

        if (!response) {
            throw new apiError(400,
                "Member Already Exist In Group"
            )
        }

        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    group,
                    `${userName} joined ${groupName} `
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode).json(new apiResponse(error.statusCode, error.message, error.description))
        }
    }

})

const addMemberViaPassword = asyncHandler(async (req, res) => {
    let{ password, groupName } = req.body
    const user = req.user._id
    try {
        groupName = groupName.toLowerCase()
        const group = await Group.findOne({ groupName })
        if (!group) {
            throw new apiError(400,
                "Group Not Found , Failed To Join"
            )
        }
        const response = await group.compareGroupPassword(password)
        console.log(response);
        if (!response) {
            throw new apiError(
                400,
                "Invalid Password , Failed To Join"
            )
        }
        const addMemberInGroup = await group.addGroupMembers(user._id)
        console.log(addMemberInGroup);
        if (!addMemberInGroup) {
            throw new apiError(400,
                `You Are Already  In ${groupName}`
            )
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    group,
                    `You Joined ${groupName} `
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode).json(new apiResponse(error.statusCode, error.message, error.description))
        }

    }
})

const leaveGroup = asyncHandler(async (req, res) => {
    const { groupName } = req.params
    const user = req.user._id
    try {
        const group = await Group.findOne({ groupName })
        if (!group) {
            throw new apiError(400,
                "Invalid Request")
        }
        const leaveGroup = await group.removeGroupMember(user._id)
        if (!leaveGroup) {
            throw new apiError(400,
                `Invalid Request`
            )
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    [],
                    `You Left ${groupName}`
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode).json(new apiResponse(error.statusCode, error.message, error.description))
        }

    }


})
const getGroups = asyncHandler(async (req, res) => {
    const user = req.user._id
    try {
        const groups = await Group.find({ members: user }).select("-password")
        if (!groups) {
            throw new apiError(400, "You are not in any chat")
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    groups,
                    `Lets Chat`
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode).json(new apiResponse(error.statusCode, error.message, error.description))
        }
    }

})

const postMessages = asyncHandler(async (req, res) => {
    const { groupName } = req.params
    if (!groupName) {
        throw new apiError(400, "Invalid Request")
    }
    const group = await Group.findOne({ groupName })
    if (!group) {
        throw new apiError(400, "Invalid Group")
    }
    const { text } = req.body
    const sender = req.user.userName
    console.log(sender);

    const newMessage = new Message({
        text,
        sender,
    })
    await newMessage.save()
    group.message.push(newMessage)
    await group.save()
    return res.status(200)
        .json(
            new apiResponse(
                200,
                newMessage,
                "Message Saved"
            )
        )

})

const getMessage = asyncHandler(async (req , res) => {
    const { groupName } = req.params
    if (!groupName) {
        throw new apiError(400, "Invalid Request")
    }
    const group = await Group.findOne({ groupName }).populate("message")
    if (!group) {
        throw new apiError(404, "Group not found");
    }
    const messages = group.message
    
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            messages,
            "messages fetched succesfully"
        )
    )

})

const getMembers = asyncHandler(async( req , res)=>{
    const {groupName} = req.params
    const group = await Group.findOne({ groupName }).populate({
        path: "members",
        select: "-password  -refreshToken",
    })
    const groupMembers = group.members
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            groupMembers,
            "Members fetched succesfully"
        )
    )


})
export {
    createNewGroup,
    addMemberInGroup,
    addMemberViaPassword,
    leaveGroup,
    getGroups,
    postMessages,
    getMessage,
    getMembers
}