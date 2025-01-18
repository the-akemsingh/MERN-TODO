import { Request, Response } from "express";
import { User } from "../db/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const addNewUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = await req.body;
    const isEmailExist = await User.findOne({
      email,
    });
    if (isEmailExist) {
      res.status(404).send({ message: "Email is already in use" });
      return ;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
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
    const { email, password } = await req.body;
    const isUserExist = await User.findOne({
      email,
    });
    if (!isUserExist) {
       res.status(401).send({ message: "Email is not registered" });
       return;
    }
    const user = await User.findOne({
      email,
    });
    const isPasswordValid = bcrypt.compare(password, user!.password as string);
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
