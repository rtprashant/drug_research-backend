import { Molecule } from "../models/moleculeGenration.model.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getSubmittedMolecules = asyncHandler(async (req, res) => {
    const molecules = await Molecule.find({ status: "Pending" })
    if (!molecules) {
        throw new apiError(
            400,
            "No molecules found",
        )
    }
    // const users = molecules.map(async(mol)=>{
    //     const userId = mol.createdBy
    //     const user = await User.findById({userId})

    // })
    const moleculeWithUserDetails = await Promise.all(
        molecules.map(async (mol) => {
            const userId = mol.createdBy;
            const user = await User.findById(userId).select("-password -refreshToken");
            mol.createdBy = user
            return mol ; // Return the user object for each molecule
        })
    );

    
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {
                    moleculeWithUserDetails
                    
                },
                "Molecules found",
            )
        )
})

const changeStatus = asyncHandler(async (req, res) => {
    const { status , id } = req.body
    console.log(req.body);
    if (!id) {
        throw new apiError(400, "Molecule ID is required");
    }

    
   

    if (status === "Accepted") {
        const acceptedMolecule = await Molecule.updateOne({
            _id: id
        },
            {
                $set: {
                    status: "Accepted"
                }


            })
            
    }
    if (status === "Rejected") {
        const rejectedMolecule = await Molecule.updateOne(
            {
                _id: id
            },
            {
                $set: {
                    status: "Rejected"
                }
            }
        )
        
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            "Molecule status updated",

        )
    )

})

export {
    getSubmittedMolecules,
    changeStatus
}