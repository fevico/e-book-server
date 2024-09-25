import BookModel from "@/models/book";
import UserModel from "@/models/user";
import { AddReviewRequestHandler, IsPurchasedByUser } from "@/types";
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

export const isPurchasedByUser: IsPurchasedByUser = async(req, res, next) => {
 const user = await UserModel.findOne({_id: req.user.id, books: req.body.bookId})
 if(!user)
    return sendErrorResponse({
      res,
      message: "Sorry we did not found this book in your library!",
      status: 403,
    });
    next();
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

export const isValidReadingRequest: RequestHandler = async(req, res, next) => {
  const url = req.url 
  const regex = new RegExp("/([^/?]+.epub)")
 const regexMatch = url.match(regex)
 if(!regexMatch) return sendErrorResponse({
    message: "Invalid request",
    status: 403,
    res
  })
  const bookFileId = regexMatch[1]
 const book = await BookModel.findOne({"fileInfo.id": bookFileId})
 if(!book) return sendErrorResponse({
    message: "Invalid request",
    status: 403,
    res
  })
 const user = await UserModel.findOne({_id: req.user.id, books: book._id})
 if(!user) return sendErrorResponse({res, message: "Unauthorized request", status: 403})
  next()
}
