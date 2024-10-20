import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "researcher"]
    },
    isEmailVerified: {
        type: Boolean,
        default : false

    },
    bio: {
        type: String,
        required: false
    },
    refreshToken :{
        type : String ,

    }

}, {
    timestamps: true
})
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10);
    next()

})
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.genrateAccessToken = function(){
    
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET ,
    
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY ||'1d'
        }

    )
}
userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY||'10d',
        }

    )
}
export const User = mongoose.model("User", userSchema)