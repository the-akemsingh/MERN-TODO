"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const todoRouter_1 = __importDefault(require("./routers/todoRouter"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use('/user', userRouter_1.default);
exports.app.use('/todo', todoRouter_1.default);
exports.app.listen(3000, () => {
    console.log("server listening on port 3000");
});
