import { Router } from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import { createNewGroup , addMemberInGroup , addMemberViaPassword , leaveGroup  , getGroups ,  postMessages , getMessage ,  getMembers} from "../controllers/message.controller.js"
const router = Router()
router.route("/createNewGroup").post(verifyJWT , createNewGroup)
router.route("/addMemberInGroup").post(addMemberInGroup)
router.route("/addMemberViaPassword").post(verifyJWT,addMemberViaPassword)
router.route("/leaveGroup/:groupName").post(verifyJWT , leaveGroup)
router.route("/getGroups").get(verifyJWT , getGroups)
router.route("/postMessages/:groupName").post(verifyJWT ,postMessages)
router.route("/getMessage/:groupName").get(verifyJWT ,getMessage)
router.route("/getMembers/:groupName").get(verifyJWT,  getMembers)
export default router