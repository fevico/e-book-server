import { handlePayment } from "@/controllers/payments";
import express, { Router } from "express";

const webHookRouter = Router()

webHookRouter.post('/', express.raw({type: 'application/json'}), handlePayment)

export default webHookRouter;