import 'express-async-errors'
import 'dotenv/config';
import '@/db/connect'
import express from "express";
import path from 'path';
import authRouter from "./routes/auth";
import { errorHandler } from './middleware/error';
import cookieParser from 'cookie-parser';
import authorRouter from './routes/author';
import bookRouter from './routes/books';
import reviewRouter from './routes/reviews';
import historyRouter from './routes/history';
import { isAuth, isValidReadingRequest } from './middleware/auth';
import cartRouter from './routes/cart';
import checkoutRouter from './routes/checkout';
import webHookRouter from './routes/wbHook';
import cors from 'cors';
import morgan from 'morgan';
import orderRouter from './routes/order';

const app = express();
const publicPath = path.join(__dirname, './books')

app.use(morgan('dev'));
app.use(cors({ origin: [process.env.APP_URL!], credentials: true }));
app.use("/webhook", webHookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/books', isAuth, isValidReadingRequest, express.static(publicPath));

// app.use()
  
app.use('/auth', authRouter)
app.use('/author', authorRouter)
app.use('/book', bookRouter)
app.use('/review', reviewRouter)
app.use('/history', historyRouter)
app.use('/cart', cartRouter)
app.use('/checkout', checkoutRouter)
app.use('/order', orderRouter)


app.use('/test', async(req, res) => {
})

app.use(errorHandler)

const port = process.env.PORT || 8000;

app.listen(port, () => { 
  console.log(`Server is running on port ${port}`);
});



