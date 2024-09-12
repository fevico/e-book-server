import { UserDoc } from "@/models/user";
import { Response } from "express";

type ErrorResponseType = {
res: Response,
message: string,
status: number
}

export const sendErrorResponse = ({res, message, status}: ErrorResponseType) =>{
    res.status(status).json({message})
}

export const formatUserProfile = (user: UserDoc) => {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    }
}