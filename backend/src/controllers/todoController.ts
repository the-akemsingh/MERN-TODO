import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
import { Table } from "../db/schema";
import { editTodoSchema, newTodoSchema } from "../schema/schema";

const getAlltodo = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const userTodos = await Table.Todo.find({
      userId,
    });
    if (userTodos.length==0) {
      res.status(404).send({ message: "No todos found" });
      return;
    }
    res.status(201).send({ todos: userTodos });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "Error Occured" });
  }
};

const getTodobyId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await Table.Todo.findById({ _id: id });
    if (!todo) {
      res.status(404).send({
        message: "Todo not found",
      });
      return;
    }
    res.status(201).send({ todo });
  } catch (e) {
    res.status(400).send({ message: "Error Occured" });
  }
};

const addNewtodo = async (req: Request, res: Response) => {
  try {
    const isValidInputs= newTodoSchema.safeParse(req.body)
    if(!isValidInputs.success){
      res.status(411).send({message:"One or more input is invalid", errors: isValidInputs.error.errors })
      return;
    }
    const { title, description } = req.body;
    const newTodo = await Table.Todo.create({
      title,
      description,
      userId: req.user.id,
    
    });
    res.status(201).send({
      message: "Todo created successfuly",
      todo: {
        title,
        description,
        isCompleted: false,
        userId: newTodo._id,
      },
    });
  } catch (e) {
    res.status(400).send({ message: "Error Occured" });
  }
};

const deleteTodobyId = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.id;
    const todo = await Table.Todo.findById({ _id: todoId });
    if (!todo) {
      res.status(404).send({ message: "Todo does not exist" });
      return;
    }
    const deleteTodo = await Table.Todo.findOneAndDelete({
      _id: todoId,
    });
    res.status(201).send({ message: "Todo Deleted Succesfully" });
  } catch (e) {
    res.status(400).send({ message: "Error Occured" });
  }
};

const editTodobyId = async (req: Request, res: Response) => {
  try {
    const isValidInputs= editTodoSchema.safeParse(req.body)
    if(!isValidInputs.success){
      res.status(411).send({message:"One or more input is invalid", errors: isValidInputs.error.errors })
      return;
    }
    const { title, description, isCompleted } = req.body;
    const todoId = req.params.id;
    const todo = await Table.Todo.findById(todoId);
    if (!todo) {
      res.status(404).send({ message: "Todo does not exist" });
      return;
    }
    todo!.title = title;
    todo!.description = description;
    todo!.isCompleted = isCompleted;

    await todo.save();

    res.status(201).send({
      message: "Todo Updated",
      Todo: { title, description, isCompleted },
    });
  } catch (e) {
    res.status(400).send({ message: "Error Occured" });
  }
};


export { getAlltodo, getTodobyId, addNewtodo, deleteTodobyId, editTodobyId };