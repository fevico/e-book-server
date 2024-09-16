import { getAuthorDetails, registerAuthor } from "@/controllers/author";
import { isAuth } from "@/middleware/auth";
import { newAuthorSchema, validate } from "@/middleware/validator";
import { Router } from "express";

const authorRouter = Router()

authorRouter.post('/register', isAuth, validate(newAuthorSchema), registerAuthor)
authorRouter.get('/:slug', getAuthorDetails)

export default authorRouter;