import { totp } from "otplib"
const secret = process.env.OTP_SECRET
const token = async ()=>{
    const otp =  await totp.generate(secret)
    if(!otp){
        console.log("Error generating OTP")
        return "failed to genrate otp"
    }
    return otp
}

export default token