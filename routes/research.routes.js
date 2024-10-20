import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { aiSearch, researchAboutTheMolecule } from "../controllers/researcher.controller.js";
const router = Router()
router.route("/research").post(verifyJWT , researchAboutTheMolecule)
router.route("/aiResearch").post(verifyJWT , aiSearch )
export default router