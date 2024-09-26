import { clearCart, getCart, updateCart } from "@/controllers/cart";
import { isAuth } from "@/middleware/auth";
import { cartItemsSchema, validate } from "@/middleware/validator";
import { Router } from "express";

const cartRouter = Router()

cartRouter.post('/' , isAuth, validate(cartItemsSchema), updateCart)
cartRouter.get('/' , isAuth, getCart)
cartRouter.post('/clear', isAuth, clearCart)

export default cartRouter