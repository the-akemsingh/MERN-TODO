import express from 'express'
import cors from 'cors'
import userRouter from './routers/userRouter'
import todoRouter from './routers/todoRouter'

const app=express()
app.use(cors());
app.use(express.json());

app.use('/user',userRouter);
app.use('/todo',todoRouter);

app.listen(3000,()=>{
    console.log("server listening on port 3000");
})