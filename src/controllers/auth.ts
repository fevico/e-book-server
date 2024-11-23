import { RequestHandler } from "express";
import crypto from 'crypto'
import verificationTokenModel from "@/models/verificationToken";
import UserModel from "@/models/user";
import mail from "@/utils/mail";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import jwt from "jsonwebtoken"
import { updateAvatarToCloudinary } from "@/utils/fileUpload";

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
  
    res.cookie('authToken', authToken, {
    httpOnly: true, 
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)   
})
    res.redirect(`${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(formatUserProfile(user))}`)
     res.send()  
  };

  export const sendProfileInfo: RequestHandler = async (req, res) => {
      res.json({
        profile: req.user
      })
  }

  export const logout: RequestHandler = async (req, res) => {
    res.clearCookie('authToken', {
      httpOnly: true, 
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'none',
      path: '/'
    }).send()  
  }

  export const updateProfile: RequestHandler = async (req, res) => {
   const user = await UserModel.findByIdAndUpdate(req.user.id, {name: req.body.name, signedUp: true}, {new: true})
   if(!user) return sendErrorResponse({
        status: 500,
        message: "Something went wrong, user not found!",
        res,
      });
  //  if there is any file upload them to cloud and update the url in the user profile
  const file = req.files.avatar

  if (file && !Array.isArray(file)) {
    // if you are using cloudinary this is the method you should use
    user.avatar = await updateAvatarToCloudinary(file, user.avatar?.id);

    await user.save();
  }
   res.json({profile: formatUserProfile(user)})
 }