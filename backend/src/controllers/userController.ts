import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userSignInSchema, userSignUpSchema } from "../schema/schema";
import { Table } from "../db/schema";
dotenv.config();

const addNewUser = async (
  req: Request,
  res: Response
) => {
  try {

    const isValidInputs= userSignUpSchema.safeParse(req.body)
    if(!isValidInputs.success){
      res.status(411).send({message:"One or more input is invalid", errors: isValidInputs.error.errors })
      return;
    }
    const { name, email, password } = await req.body;

    const isEmailExist = await Table.User.findOne({
      email,
    });
    if (isEmailExist) {
      res.status(404).send({ message: "Email is already in use" });
      return ;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Table.User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).send({ message: "User signed up succesfuly",user:{email,name} });
  } catch (e) {
    res.status(400).send({ message: "Error signing up", e });
  }
};

const signInUser = async (req: Request, res: Response) => {
  try {

    const isValidInputs= userSignInSchema.safeParse(req.body)
    if(!isValidInputs.success){
      res.status(411).send({message:"One or more input is invalid", errors: isValidInputs.error.errors })
      return;
    }

    const { email, password } = await req.body;

    const user = await Table.User.findOne({
      email,
    });
    if (!user) {
       res.status(401).send({ message: "Email is not registered" });
       return;
    }
    
    const isPasswordValid =await bcrypt.compare(password, user!.password as string);
    if (!isPasswordValid) {
      res.status(401).send({ message: "Incorrect password" });
      return;
    }

    const token = jwt.sign(email, process.env.JWT_SECRET as string);
    res.status(201).send({
      message: "User signed in",
      token,
    });

  } catch (e) {
    res.status(400).send({ message: "Error signing in", e });
  }
};

export { addNewUser, signInUser };
