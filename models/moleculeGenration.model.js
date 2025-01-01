import mongoose ,{Schema} from "mongoose";
const moleculeGenrationSchema = new Schema({
    createdBy :{
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    minSimilarity :{
        type : Number,
        required : true,
    },
    noOfMolecules :{
        type : Number,
        required : true
    },
    noOfItrations :{
        type : Number,
        required : true
    },
    noOfParticals :{
        type : Number,
        required : true
    },
    smiles :{
        type : String,
        required : true
    },
    propertyToOptimize :{
        type : String ,
        required : true,
        enum : ["QED" ,"plogP"]

    },
    genratedModel :[
        {
            structure: { type: String, required: true },
            score: { type: Number, required: true },
        },
    ],
    status:{
        type : String,
        required : true ,
        enum : ["Pending","Accepted","Rejected"],
        default : "Pending",
    }

},{
    timestamps:true
})
export const Molecule = mongoose.model("Molecule" ,moleculeGenrationSchema)