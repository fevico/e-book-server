import { RequestHandler } from "express";
import crypto from 'crypto'
import verificationTokenModel from "@/models/verificationToken";
import UserModel from "@/models/user";
import mail from "@/utils/mail";

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
    const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}$userId=${userId}`

    await mail.sendVerificationMail({
        link,
        to: user.email,
      })

    res.json({message: "Please check your email for verification link"}) 
}