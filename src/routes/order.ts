import { getOrders, getOrderStatus, getOrderSuccessStatus } from "@/controllers/order";
import { isAuth } from "@/middleware/auth";
import { Router } from "express";

const orderRouter = Router()

orderRouter.get('/', isAuth, getOrders)
orderRouter.get('/check-status/:bookId', isAuth, getOrderStatus)
orderRouter.post('/success', isAuth, getOrderSuccessStatus)


export default orderRouter