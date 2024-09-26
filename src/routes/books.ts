import { createNewBook, generateBookAccessUrl, getAllPurchasedBooks, getBookByGenre, getPublicBookDetails, updateBook } from "@/controllers/book";
import { isAuth, isAuthor } from "@/middleware/auth";
import { fileParser } from "@/middleware/file";
import { newBookSchema, updateBookSchema, validate } from "@/middleware/validator";
import { Router } from "express";

const bookRouter = Router()
bookRouter.post('/create', isAuth, isAuthor, fileParser, validate(newBookSchema), createNewBook)
bookRouter.patch('/', isAuth, isAuthor, fileParser, validate(updateBookSchema), updateBook)
bookRouter.get('/list', isAuth, getAllPurchasedBooks)
bookRouter.get('/detail/:slug', getPublicBookDetails)
bookRouter.get('/by-genre/:genre', getBookByGenre)
bookRouter.get('/read/:slug', isAuth, generateBookAccessUrl)

export default bookRouter