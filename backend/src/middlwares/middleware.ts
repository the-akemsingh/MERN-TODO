import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { Table } from "../db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET as string;

const isAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("authorisation")?.split(" ")[1] as string;
    if (!token) {
      res.status(401).send({ message: "Not Authorised" });
      return;
    }
    const isTokesValid = jwt.verify(token, JWT_SECRET);
    if (!isTokesValid) {
      res.status(401).send({ message: "Not Authorised" });
      return;
    }
    const userEmail = jwt.decode(token);
    const user = await Table.User.findOne({
      email: userEmail,
    });
    req.user = { email: user!.email,name:user!.name,id:user!._id };
    next();
  } catch (e) {
    res.status(400).send({ message: "Error Occured" });
  }
};
export default isAuthorized;
