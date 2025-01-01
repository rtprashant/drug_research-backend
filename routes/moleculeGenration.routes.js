import {Router} from 'express'
import verifyJWT from "../middleware/auth.middleware.js";
import { distoryGenratedMolecule, genrateMolecule, getMoleculeDetails } from '../controllers/moleculeGenration.controller.js';
const router = Router() ;
router.route("/genrateMolecules").post(verifyJWT , genrateMolecule)
router.route("/getMoleculeHistory").get(verifyJWT , getMoleculeDetails)
router.route("/dltMolecule").post(verifyJWT , distoryGenratedMolecule)
export default router 