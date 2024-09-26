import 'express-async-errors'
import '@/db/connect'
import express from "express";
import path from 'path';
import authRouter from "./routes/auth";
import { errorHandler } from './middleware/error';
import cookieParser from 'cookie-parser';
import { fileParser } from './middleware/file';
import authorRouter from './routes/author';
import bookRouter from './routes/books';
import formidable from 'formidable';
import reviewRouter from './routes/reviews';
import ReviewModel from './models/review';
import { Types } from 'mongoose';
import historyRouter from './routes/history';
import { isAuth, isValidReadingRequest } from './middleware/auth';
import cartRouter from './routes/cart';

const app = express();
const publicPath = path.join(__dirname, './books')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/books', isAuth, isValidReadingRequest, express.static(publicPath));

  
app.use('/auth', authRouter)
app.use('/author', authorRouter)
app.use('/book', bookRouter)
app.use('/review', reviewRouter)
app.use('/history', historyRouter)
app.use('/cart', cartRouter)


app.use('/test', async(req, res) => {
})

app.use(errorHandler)

const port = process.env.PORT || 8000;

app.listen(port, () => { 
  console.log(`Server is running on port ${port}`);
});



