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

const app = express();
const publicPath = path.join(__dirname, './books')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/books', express.static(publicPath));

  
app.use('/auth', authRouter)
app.use('/author', authorRouter)
app.use('/book', bookRouter)


app.use('/test', async(req, res) => {
 const form = formidable({
    uploadDir: path.join(__dirname, './books'),
    filename: (name, ext, part, form) => {

      return name + ".jpg"
    }
  })
  await form.parse(req)
  res.json({})
})

app.use(errorHandler)

const port = process.env.PORT || 8000;

app.listen(port, () => { 
  console.log(`Server is running on port ${port}`);
});



