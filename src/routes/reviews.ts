import { addReview, getReview } from "@/controllers/review";
import { isAuth, isPurchasedByUser } from "@/middleware/auth";
import { newReviewSchema, validate } from "@/middleware/validator";
import { Router } from "express";

const reviewRouter = Router()

reviewRouter.post('/', isAuth, validate(newReviewSchema), isPurchasedByUser, addReview)
reviewRouter.get('/:bookId', isAuth, getReview)

export default reviewRouter