import 'express-async-errors'
import '@/db/connect'
import express from "express";
import authRouter from "./routes/auth";
import { errorHandler } from './middleware/error';
import cookieParser from 'cookie-parser';
import { fileParser } from './middleware/file';
import authorRouter from './routes/author';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

 
app.use('/auth', authRouter)
app.use('/author', authorRouter)
app.use('/test', fileParser, (req, res) => {
  console.log(req.files)
  console.log(req.body)
  res.json({})
})

app.use(errorHandler)

const port = process.env.PORT || 8000;

app.listen(port, () => { 
  console.log(`Server is running on port ${port}`);
});



