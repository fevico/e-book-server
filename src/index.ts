import '@/db/connect'
import express from "express";
import authRouter from "./routes/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

 
app.use('/auth', authRouter)

const port = process.env.PORT || 8000;

app.listen(port, () => { 
  console.log(`Server is running on port ${port}`);
});
