//higher order function that takes another function as an argument
// const asyncHandler = (fn)=> async () => {
//     try {
//         await fn(req , res , next);
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message : err.message
//         });
//     }
// }


//Either write like the above method or the method below both are same with different styles


const asyncHandler = (requestHandler) => {
    return (req, res , next)=> {
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}
export {asyncHandler}