import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
app.use(cors(
    {
        origin : process.env.CORS_ORIGIN,
        credentials : true
    }
))
app.use(cookieParser());
app.use(express.urlencoded({
    limit:"16kb",
    extended : true
}))
app.use(express.json({
    limit:"16kb"
}))
app.use(express.static("public"))


import userRoutes from "./routes/user.routes.js"
import researchRoutes from "./routes/research.routes.js"
import moleculeBankRoutes from "./routes/moleculeBank.routes.js"
app.use('/api/v1/users' , userRoutes)
app.use('/api/v1/researchs' , researchRoutes)
app.use('/api/v1/moleculeBanks',moleculeBankRoutes)
export default app ;