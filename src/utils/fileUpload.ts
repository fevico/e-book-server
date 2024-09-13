import cloudinary from "@/cloud/cloudinary"
import { Request } from "express"
import { File } from "formidable"

export const updateAvatarToCloudinary  = async (file: File, avatarId? :string ) =>{
    if(avatarId){
        // if user already has a profile picture first remove it from cloudinary before saving new imag
        await cloudinary.uploader.destroy(avatarId)
      }
     const {secure_url, public_id, } = await cloudinary.uploader.upload(file.filepath, {
        width: 300,
        height: 300,
        gravity: 'face',
        crop: 'fill'
      })
  
      return {id: public_id, url: secure_url}
}