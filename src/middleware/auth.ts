import UserModel from "@/models/user";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

declare global{
    namespace Express {
        export interface Request {
            user: {
                id: string;
                name?: string;
                email: string;
                role: "user" | "author"
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
  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  }
  next()
}