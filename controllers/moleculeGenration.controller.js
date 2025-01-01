import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"
import { Molecule } from "../models/moleculeGenration.model.js"
const genrateMolecule = asyncHandler(async (req, res) => {
    const { minSimilarity, propertyToOptimize, noOfMolecules, noOfItrations, noOfParticals, smiles } = req.body;
    const user = req.user._id;
    if (!minSimilarity || !propertyToOptimize || !noOfMolecules || !noOfItrations || !noOfParticals || !smiles) {
        throw new apiError(400,
            "Please fill all the neccessary fields"
        )
    }
    const api_key = process.env.NVIDIA_API_KEY
    const invoke_url = "https://health.api.nvidia.com/v1/biology/nvidia/molmim/generate"
    const payload = {
        "algorithm": "CMA-ES",
        "num_molecules": noOfMolecules,
        "property_name": propertyToOptimize,
        "minimize": false,
        "min_similarity": minSimilarity,
        "particles": noOfParticals,
        "iterations": noOfItrations,
        "smi": smiles,

    }
    const data =  await fetch(invoke_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`

        },
        body: JSON.stringify(payload)
    }).then((response)=>{
        return response.json()
    }).catch((err)=>{
        console.log(err);
        throw new apiError(500, err)

    })
   
    
    const generatedMolecules = JSON.parse(data.molecules).map((mol) => ({
        structure: mol.sample,
        score: mol.score,
      }))
  

      console.log(generatedMolecules);
      const molecule = await Molecule.create(
        {
            createdBy: user,
            minSimilarity,
            noOfMolecules,
            noOfItrations,
            noOfParticals,
            smiles,
            propertyToOptimize,
            genratedModel: generatedMolecules
        }
    )
   
    

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {generatedMolecules , id : molecule._id},
                "Molecules generated successfully"
            )
        )
   
})

const getMoleculeDetails = asyncHandler(async (req, res) => {
    const user = req.user._id
    if (!user) {
        throw new apiError(
            401,
            "Something went wrong"
        )
    }
    const molecule = await Molecule.find({ createdBy: user })
    const reverseOrderMolecule = molecule.reverse()

    console.log(molecule);
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                reverseOrderMolecule,
                "Molecules details fetched successfully"
            )
        )


})

const distoryGenratedMolecule = asyncHandler(async(req, res)=>{
    const user = req.user._id
    const { id } = req.body
    console.log(req.body);
    
    if(!id){
        throw new apiError(404, "Molecule not found")
    }
    await Molecule.deleteOne({_id : id}) 
    return res.status(200).json(new apiResponse(200,[], "Molecule deleted successfully"))

})

export {
    genrateMolecule,
    getMoleculeDetails,
    distoryGenratedMolecule
}
