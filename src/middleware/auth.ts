import UserModel from "@/models/user";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

declare global{
    namespace Express {
        export interface Request {
            user: {
                id: string;
                name?: string;
                email: string;
                role: "user" | "author",
                avatar?: string;
                signedUp: boolean;
                authorId?: string;
            }
        }
    }
}

export const isAuth : RequestHandler = async (req, res, next) => {
   const authToken = req.cookies.authToken;

   if(!authToken){
    return sendErrorResponse({
        message: "Unauthorized request",
        status: 401,
        res
    })
   }
   const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
     userId: string;
   }
  const user = await UserModel.findById(payload.userId)
  if(!user) {
    return sendErrorResponse({
        message: "Unauthorized request user not found",
        status: 401,
        res
    })
  }
  req.user = formatUserProfile(user);
  next()
}

export const isAuthor: RequestHandler = (req, res, next) => {
  if(req.user.role === 'author') next()  
    else sendErrorResponse({
        message: "Unauthorized request",
        status: 401,
        res
    })
  // if(req.user?.role !== "author"){
    //     return sendErrorResponse({
    //         message: "Unauthorized request",
    //         status: 401,
    //         res
    //     })
    // }
    // next()
}