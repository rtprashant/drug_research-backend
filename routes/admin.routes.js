import {Router} from "express"
import { changeStatus, getSubmittedMolecules } from "../controllers/admin.controller.js"
const router = Router()
router.route("/getSubmittedMolecules").get(getSubmittedMolecules)
router.route("/changeStatus").put(changeStatus)
export default router