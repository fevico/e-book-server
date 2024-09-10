import { RequestHandler } from "express";
import crypto from 'crypto'
import verificationTokenModel from "@/models/verificationToken";
import UserModel from "@/models/user";
import mail from "@/utils/mail";
import { sendErrorResponse } from "@/utils/helper";
import jwt from "jsonwebtoken"

export const generateAuthLink: RequestHandler = async(req, res) =>{

    const {email} = req.body
   let user = await UserModel.findOne({email})
   if(!user){
    user = await UserModel.create({email})
   }

   const userId = user._id.toString()
   await verificationTokenModel.findOneAndDelete({userId})

    const randomToken = crypto.randomBytes(36).toString('hex')
    await verificationTokenModel.create<{userId: string}>({
        userId, 
        token: randomToken
    })
    const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`

    await mail.sendVerificationMail({
        to: user.email,
        link
      })

    res.json({message: "Please check your email for verification link"}) 
}

export const verifyAuthToken: RequestHandler = async (req, res) => {
    const { token, userId } = req.query;
  
    if (typeof token !== "string" || typeof userId !== "string") {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request!",
        res,
      });
    }
  
    const verificationToken = await verificationTokenModel.findOne({ userId });
    if (!verificationToken || !verificationToken.compare(token)) {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request, token mismatch!",
        res,
      });
    }
  
    const user = await UserModel.findById(userId);
    if (!user) {
      return sendErrorResponse({
        status: 500,
        message: "Something went wrong, user not found!",
        res,
      });
    }
  
    await verificationTokenModel.findByIdAndDelete(verificationToken._id);
  
    // TODO: authentication
    const payload = {userId: user._id}
    const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: '5d'})
  
      res.json({authToken})
  
  
    res.json({});
  };