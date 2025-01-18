"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todoController_1 = require("../controllers/todoController");
const middleware_1 = __importDefault(require("../middlwares/middleware"));
const router = express_1.default.Router();
router.use(middleware_1.default);
router.get('/all', todoController_1.getAlltodo);
router.get('/:id', todoController_1.getTodobyId);
router.post('/add', todoController_1.addNewtodo);
router.delete('/:id', todoController_1.deleteTodobyId);
router.put('/:id', todoController_1.editTodobyId);
exports.default = router;
