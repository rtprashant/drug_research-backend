import { Router } from 'express'
import { upload } from "../middleware/multer.middleware.js"
import { changePassword, changeProfileImage, chnageUserDetails, getUser, loginUser, logoutUser, registerUser, verifyMail } from '../controllers/user.controller.js'
import verifyJWT from '../middleware/auth.middleware.js'
const router = Router()
router.route("/register").post(upload.single("profileImage"),registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/changePassword").post(verifyJWT , changePassword)
router.route("/changeProfileImage").put(verifyJWT , upload.single("profileImage"),changeProfileImage)
router.route("/changeUserDetails").put(verifyJWT , chnageUserDetails)
router.route("/emailVerification").post(verifyMail)
router.route("/getUser").get(verifyJWT ,getUser)
export default router