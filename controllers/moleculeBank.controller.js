import { MoleculeBank } from "../models/moleculeBank.model.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// const addMolecule = asyncHandler(async (req, res) => {
//     let { moleculeName, smileString, molecularWeight, useages } = req.body;
//     const user = req.user._id
//     console.log(user);

//     try {
//         moleculeName = moleculeName.toLowerCase();
//         if (!moleculeName || !smileString || !molecularWeight || !useages) {
//             throw new apiError(400,
//                 "Please fill in all fields"
//             )
//         }
       
//         const existedMolecule = await MoleculeBank.findOne({
//             moleculeName: moleculeName.toLowerCase(),
//             smileString,
//             createdBy: user,
//         });
//         console.log(existedMolecule);
        
//         if (existedMolecule) {
//             throw new apiError(400,
//                 "Molecule with this name or smile already exist"
//             )
//         }

//         const newMolecule = await MoleculeBank.create({
//             moleculeName,
//             smileString,
//             molecularWeight,
//             useages,
//             createdBy: user
//         })
//         console.log(newMolecule);

//         if (!newMolecule) {
//             throw new apiError(500,
//                 "Failed to create molecule"
//             )
//         }
//         return res
//             .status(200)
//             .json(
//                 new apiResponse(200,
//                     newMolecule,
//                     "Molecule created successfully")

//             )
//     } catch (error) {
//         if (error instanceof apiError) {
//             return res.status(error.statusCode)
//                 .json(new apiResponse(error.statusCode, error.message, error.description))
//         }

//     }
// })
const addMolecule = asyncHandler(async (req, res) => {
    let { moleculeName, smileString, molecularWeight, useages } = req.body;
    const user = req.user._id;
    console.log("User ID:", user);

    try {
        // Validate input
        moleculeName = moleculeName.toLowerCase();
        if (!moleculeName || !smileString || !molecularWeight || !useages) {
            console.log("Validation failed: Missing fields");
            throw new apiError(400, "Please fill in all fields");
        }
        
        // Check if molecule already exists
        const existedMolecule = await MoleculeBank.findOne({
            moleculeName: moleculeName.toLowerCase(),
            smileString,
            createdBy: user,
        });
        console.log("Existed Molecule:", existedMolecule);
        
        if (existedMolecule) {
            console.log("Molecule already exists");
            throw new apiError(400, "Molecule with this name or smile already exists");
        }

        // Create new molecule
        const newMolecule = await MoleculeBank.create({
            moleculeName,
            smileString,
            molecularWeight,
            useages,
            createdBy: user
        });
        console.log("New Molecule Created:", newMolecule);

        // Check if creation succeeded
        if (!newMolecule) {
            console.log("Failed to create new molecule");
            throw new apiError(500, "Failed to create molecule");
        }

        // Success response
        return res.status(200).json(new apiResponse(200, newMolecule, "Molecule created successfully"));

    } catch (error) {
        console.log("Error caught:", error);

        if (error instanceof apiError) {
            return res.status(error.statusCode).json(new apiResponse(error.statusCode, error.message, error.description));
        }

        // Fallback for any uncaught errors
        return res.status(500).json(new apiResponse(500, "Internal Server Error", error.message || "Unknown error"));
    }
});

const getMolecule = asyncHandler(async (req, res) => {
    const user = req.user._id
    console.log(user);

    const createdMolecule = await MoleculeBank.find({ createdBy: user })
    console.log(createdMolecule.reverse());

    if (!createdMolecule || createdMolecule.length === 0) {
        throw new apiError(404, "No molecule found")
    }
    return res
        .status(200)
        .json(
            new apiResponse(

                200,
                createdMolecule,
                "molecules fetched"
            )
        )


})

const searchMolecule = asyncHandler(async (req, res) => {
    const user = req.user._id
    let { moleculeName } = req.body
    try {
        moleculeName = moleculeName.toLowerCase()
        if (!moleculeName) {
            throw new apiError(400, "Please provide a molecule name")
        }
        const molecule = await MoleculeBank.findOne({
            $and: [{ createdBy: user }, { moleculeName }]
        })
        if (!molecule) {
            throw new apiError(404, "Molecule not found")
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    molecule,
                    "molecule found"
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
    addMolecule,
    getMolecule,
    searchMolecule
}
