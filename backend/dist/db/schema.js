"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Todo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_URL = process.env.DB_URL;
mongoose_1.default.connect(DB_URL).then(() => {
    console.log("db connected");
});
const todoSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    }
});
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});
const Todo = mongoose_1.default.model('Todos', todoSchema);
exports.Todo = Todo;
const User = mongoose_1.default.model('Users', userSchema);
exports.User = User;
