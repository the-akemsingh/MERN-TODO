import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const DB_URL=process.env.DB_URL;
mongoose.connect(DB_URL as string).then(()=>{
    console.log("db connected");
})

const todoSchema= new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    isCompleted:{type:Boolean,default:false},
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        require:true
    } 
})

const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
      
})

const Todo =  mongoose.model('Todos',todoSchema);
const User =  mongoose.model('Users',userSchema);

export const Table={Todo,User};