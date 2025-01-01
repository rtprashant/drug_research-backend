import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const messageSchema = new Schema ({
    text: {
        type: String,
        required: true
    },
    sender :{
        type : String
    },
    deliveredAt :{
        type : Date ,
        default : Date.now
    }
},{
    timestamps:true
})
export const  Message = mongoose.model("Message" , messageSchema);
const groupSchema = new Schema({
    groupName:{
        type : String,
        required : true,
        unique : true
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    password :{
        type : String ,
        required : true
    },
    members :[
        {
            type : Schema.Types.ObjectId ,
            ref : "User"
        }
    ],
    message : [{
        type : Schema.Types.ObjectId ,
        ref : "Message"
    }]
},{
    timestamps: true
})

groupSchema.pre("save" ,async function(next){
    if(!this.isModified("password")) return next()
    this.password =  await bcrypt.hash(this.password,10)
    next()

})
groupSchema.methods.compareGroupPassword = async function(password){
    return await bcrypt.compare(password , this.password)
}
groupSchema.methods.addGroupMembers = async function(userId){
    const user = this.members.some((id)=>id.toString()===userId.toString()) 
    if(!user){
        this.members.push(userId);
        return await this.save()
    }
    return null ;
}
groupSchema.methods.removeGroupMember = async function(userId){
    let intialLength = this.members.length ;
    this.members.pull(userId);
    if(intialLength !== this.members.length){
        return await this.save()
    }
    return null ;
    
}

export const Group = mongoose.models.Group || mongoose.model("Group" , groupSchema)