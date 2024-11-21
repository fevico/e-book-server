import { BookDoc } from "@/models/book";
import OrderModel from "@/models/order";
import UserModel from "@/models/user";
import stripe from "@/stripe";
import { StripeCustomer } from "@/stripe/stripe.types";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const getOrders: RequestHandler = async (req, res, next) => {
   const orders = await OrderModel.find({userId: req.user.id}).
   populate<{orderItems: {id: BookDoc, price: number, totalPrice: number, qty: number}[]}>("orderItems.id").sort("-createdAt")
   res.json({ 
    orders: orders.map((item) =>{
        return {
            id: item._id,
            stripeCustomerId: item.stripeCustomerId,
            paymentId: item.paymentId,
            totalAmount: item.totalAmount ? (item.totalAmount / 100).toFixed(2) : 0,
            paymentStatus: item.paymentStatus,
            date: item.createdAt,
            orderItem: item.orderItems.map(({id: book, price, totalPrice, qty}) => {
                return {
                    id: book._id,
                    title: book.title,
                    cover: book.cover?.url,
                    price: (price / 100).toFixed(2),
                    qty,
                    totalPrice: (totalPrice / 100).toFixed(2),
                    slug: book.slug
                }
            })
        }
    })

   })
}

export const getOrderStatus: RequestHandler = async (req, res, next) => {
  const {bookId} = req.params

  let status = false
  if(!isValidObjectId( bookId )) return res.json({status})
   const user = await UserModel.findOne({_id: req.user.id, books: bookId})
if(user) status = true
  res.json({status})
}

export const getOrderSuccessStatus: RequestHandler = async (req, res, next) => {
  const {sessionId} = req.body

  if(typeof sessionId !== "string") return sendErrorResponse({
    res,
    message: "Invalid session id",
    status: 400
  })
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const customerId = session.customer
    let customer: StripeCustomer
    if(typeof customerId === "string") {
    customer = await stripe.customers.retrieve(customerId) as unknown as StripeCustomer
    const {orderId} = customer.metadata
    const order = await OrderModel.findById(orderId).populate<{orderItems: {
        id: BookDoc;
        price: number;
        qty: number;
        totalPrice: number;
    }[]}>("orderItems.id")

    if(!order) return sendErrorResponse({
        res,
        message: "Order not found",
        status: 400
    })
    const data = order?.orderItems.map(({id: book, price, qty, totalPrice}) => {
        return {
            id: book._id,
            title: book.title,
            slug: book.slug,
            cover: book.cover?.url,
            price: (price / 100).toFixed(2) ,
            qty,
            totalPrice: (totalPrice / 100).toFixed(2)
        }
    })

   return res.json({orders: data, totalAmount: order.totalAmount ? (order.totalAmount / 100).toFixed(2) : 0 });
 }
 return sendErrorResponse({
    res,
    message: "Something went wrong order not found!",
    status: 400
})
}
