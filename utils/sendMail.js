import nodemailer from "nodemailer"
import { apiError } from "./apiError.js"

const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass:  process.env.SMTP_PASS,
        },
    }
)

const sendMail = async (subject , text ,receiverMail , html=null)=>{
    try {
        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: receiverMail,
            subject: subject,
            text: text,
        }
        if(html){
            mailOptions.html = html 
        }
        const info = await transporter.sendMail(mailOptions)
        console.log("Message sent: ", info);
    } catch (error) {
        throw new apiError(error.message, 500)  
    }
}


export default sendMail