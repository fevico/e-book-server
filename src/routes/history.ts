import { getBookHistory, updateBookHistory } from "@/controllers/history";
import { isAuth, isPurchasedByUser } from "@/middleware/auth";
import { historyValidationSchema, validate } from "@/middleware/validator";
import { Router } from "express";

const historyRouter = Router()

historyRouter.post('/', isAuth, validate(historyValidationSchema), isPurchasedByUser, updateBookHistory)
historyRouter.get('/:bookId', isAuth, getBookHistory)

export default historyRouter