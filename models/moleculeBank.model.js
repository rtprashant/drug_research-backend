import { Schema } from "mongoose";
import mongoose from "mongoose";


const moleculeBankSchema = new Schema({
    moleculeName :{
        type: String,
        required: true 
    },
    smileString :{
        type: String,
        required: true
    },
    molecularWeight :{
        type: Number,
        required: true
    },
    useages :{
        type: Array,
        required: true
    },
    createdBy :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }

},{
    timestamps:true
});

export const MoleculeBank = mongoose.model('MoleculeBank' , moleculeBankSchema)