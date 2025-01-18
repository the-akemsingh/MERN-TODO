import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { User } from "../db/schema";

// Add this at the top of your file
declare global {
  namespace Express {
    interface Request {
      user?: any; // Or define a more specific type for your user
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
    const user = await User.findOne({
      email: userEmail,
    });
    req.user = { userEmail: user!.email,userName:user!.name,userId:user!.id };
    next();
  } catch (e) {
    res.status(400).send({ message: "Error Occured" });
  }
};
export default isAuthorized;
