import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import {findOneUser} from '../dao/user.dao.js';


export async function authMiddleware(req,res,next){
    let token = req.cookies.token

    // Support Authorization header as fallback
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7)
        }
    }

    if(!token){
      return res.status(401).json({
            message: "Unauthorized access, please login first."
        })}
   try{
    const decoded = jwt.verify(token,config.JWT_SECRET)
    const user = await findOneUser({_id:decoded._id})
    req.user = user
    next()
   }catch(err){
   return res.status(401).json({
        message: "Invalid token, please login again."
    })
   }
}
