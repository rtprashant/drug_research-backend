import mongoose, { Schema } from "mongoose";
const researchSchmea = new Schema({
    title:{
        type:String,
        required:true

    },
    user :{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    researchHistory :[{
        type: Schema.Types.ObjectId,
        ref: 'Research'

    }]
},{
    timestamps: true
})
export const Research = mongoose.model('Research', researchSchmea)