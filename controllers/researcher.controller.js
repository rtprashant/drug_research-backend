import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Research } from "../models/research.model.js"
import apiResponse from "../utils/apiResponse.js";
import axios from 'axios'
import { aiRes } from "../utils/ai.js";

const researchAboutTheMolecule = asyncHandler(async (req, res) => {
    const { title } = req.body
    const user = req.user
    try {
        if (!title) {
            throw new apiError(400,
                "Please provide a title for the research about the molecule"
            )
        }

        const apiData = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${title}/property/MolecularFormula,MolecularWeight,InChIKey,CanonicalSMILES,IsomericSMILES,IUPACName,XLogP,ExactMass,MonoisotopicMass,TPSA,Complexity,Charge,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount/JSON`)
            .then((response) => {
                return response.json()
            }).then((data) => {
                return data.PropertyTable

            })
        const research = await Research.create({
            title,
            user,
        })
        res.status(201)
            .json(
                new apiResponse(
                    201,
                    apiData,
                    "Research about the molecule created successfully",
                )
            )
    }
    catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode)
                .json(new apiResponse(error.statusCode, error.message, error.description))

        }

    }
})

const aiSearch = asyncHandler(async (req, res) => {
    const { query } = req.body
    const user = req.user
    try {
        if (!query) {
            throw new apiError(400,
                "Please provide a query for the AI search"
            )
        }
        const aiResponse = await aiRes(query);
        const finalAiResponse = aiResponse?.choices[0]?.message?.content
        return res
        .status(200)
        .json(new apiResponse(200, finalAiResponse, "AI search results"))

    } catch (error) {
        if (error instanceof apiError) {
            return res.status(error.statusCode)
                .json(new apiResponse(error.statusCode, error.message, error.description))
        }

    }
})

export {
    researchAboutTheMolecule,
    aiSearch
}