import { getAuthorDetails, registerAuthor, updateAuthor } from "@/controllers/author";
import { isAuth, isAuthor } from "@/middleware/auth";
import { newAuthorSchema, validate } from "@/middleware/validator";
import { Router } from "express";

const authorRouter = Router()

authorRouter.post('/register', isAuth, validate(newAuthorSchema), registerAuthor)
authorRouter.patch('/', isAuth, isAuthor, validate(newAuthorSchema), updateAuthor)
authorRouter.get('/:id', getAuthorDetails)

export default authorRouter;