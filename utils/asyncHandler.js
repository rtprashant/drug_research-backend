
// const asyncHnadler = (fn)=>async(req , res , next)=>{
//     try {
//         await fn(req , res , next)
//     } catch (error) {
//         res
//         .status(error.code || 500)
//         .json({
//             message: error.message,
//             success : false

//         })
//     }
// }

const asyncHandler = (requestHandler) => {
    return (res, req, next) => {
        Promise.resolve(requestHandler(res, req, next))
            .catch((err) => {
                next(err)
            })
    }
}
export default asyncHandler
