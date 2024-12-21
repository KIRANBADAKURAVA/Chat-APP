
const Asynchandler= async  (func)=> {

    Promise.resolve((func(req, res, next))).catch((err)=>{
        console.log(err);
        next(err)
    })
    
}

export {Asynchandler}