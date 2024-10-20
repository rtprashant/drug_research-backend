import { Router } from 'express'
import verifyJWT from '../middleware/auth.middleware.js'
import { addMolecule, getMolecule, searchMolecule } from '../controllers/moleculeBank.controller.js'
const router = Router()
router.route("/addMolecule").post(verifyJWT , addMolecule)
router.route("/getMolecule").get(verifyJWT , getMolecule)
router.route("/searchMolecule").post(verifyJWT , searchMolecule)
export default router;