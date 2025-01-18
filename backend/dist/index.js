"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const todoRouter_1 = __importDefault(require("./routers/todoRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/user', userRouter_1.default);
app.use('/todo', todoRouter_1.default);
app.listen(3000, () => {
    console.log("server listening on port 3000");
});
