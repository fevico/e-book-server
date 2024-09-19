import cloudinary from "@/cloud/cloudinary"
import { Request } from "express"
import { File } from "formidable"
import fs from "fs"
import path from "path"
import slugify from "slugify"

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

export const UploadCoverToCloudinary = async (file: File ) =>{
 const {secure_url, public_id, } = await cloudinary.uploader.upload(file.filepath)

  return {id: public_id, url: secure_url}
  
}

export const uploadBookToLocalDir = (file: File, uniqueFileName: string) =>{

  const bookStoragePath = path.join(__dirname, "../books");
  if(!fs.existsSync(bookStoragePath)){
    fs.mkdirSync(bookStoragePath);
  }

  const filePath = path.join(bookStoragePath, uniqueFileName);
  fs.writeFileSync(filePath, fs.readFileSync(file.filepath));
 
}