"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTodobyId = exports.deleteTodobyId = exports.addNewtodo = exports.getTodobyId = exports.getAlltodo = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const schema_1 = require("../db/schema");
const schema_2 = require("../schema/schema");
const getAlltodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = yield req.user.id;
        const userTodos = yield schema_1.Table.Todo.find({
            userId,
        });
        if (userTodos.length == 0) {
            res.status(404).send({ message: "No todos found" });
            return;
        }
        res.status(201).send({ todos: userTodos });
    }
    catch (e) {
        console.log(e);
        res.status(400).send({ message: "Error Ocurred" });
    }
});
exports.getAlltodo = getAlltodo;
const getTodobyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const todo = yield schema_1.Table.Todo.findById({ _id: id });
        if (!todo) {
            res.status(404).send({
                messsage: "Todo not found",
            });
            return;
        }
        res.status(201).send({ todo });
    }
    catch (e) {
        res.status(400).send({ message: "Error Ocurred" });
    }
});
exports.getTodobyId = getTodobyId;
const addNewtodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isValidInputs = schema_2.newTodoSchema.safeParse(req.body);
        if (!isValidInputs.success) {
            res.status(411).send({ message: "One or more input is invalid", errors: isValidInputs.error.errors });
            return;
        }
        const { title, description } = req.body;
        const newTodo = yield schema_1.Table.Todo.create({
            title,
            description,
            userId: req.user.id,
        });
        res.status(201).send({
            message: "Todo created succesfuly",
            todo: {
                title,
                description,
                isCompleted: false,
                userId: newTodo._id,
            },
        });
    }
    catch (e) {
        res.status(400).send({ message: "Error Ocurred" });
    }
});
exports.addNewtodo = addNewtodo;
const deleteTodobyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todoId = req.params.id;
        const todo = yield schema_1.Table.Todo.findById({ _id: todoId });
        if (!todo) {
            res.status(404).send({ message: "Todo does not exist" });
            return;
        }
        const deleteTodo = yield schema_1.Table.Todo.findOneAndDelete({
            _id: todoId,
        });
        res.status(201).send({ message: "Todo Deleted Succesfully" });
    }
    catch (e) {
        res.status(400).send({ message: "Error Ocurred" });
    }
});
exports.deleteTodobyId = deleteTodobyId;
const editTodobyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isValidInputs = schema_2.editTodoSchema.safeParse(req.body);
        if (!isValidInputs.success) {
            res.status(411).send({ message: "One or more input is invalid", errors: isValidInputs.error.errors });
            return;
        }
        const { title, description, isCompleted } = req.body;
        const todoId = req.params.id;
        const todo = yield schema_1.Table.Todo.findById({ _id: todoId });
        if (!todo) {
            res.status(404).send({ message: "Todo does not exist" });
            return;
        }
        todo.title = title;
        todo.description = title;
        todo.isCompleted = title;
        res.status(201).send({
            message: "Todo Updated",
            Todo: { title, description, isCompleted },
        });
    }
    catch (e) {
        res.status(400).send({ message: "Error Ocurred" });
    }
});
exports.editTodobyId = editTodobyId;
