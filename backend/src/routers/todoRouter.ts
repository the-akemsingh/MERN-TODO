import express from 'express'
import { addNewtodo, deleteTodobyId, editTodobyId, getAlltodo, getTodobyId } from '../controllers/todoController';
import isAuthorized from '../middlwares/middleware';
const router = express.Router();

router.use(isAuthorized);
router.get('/all', getAlltodo);
router.get('/:id', getTodobyId);
router.post('/add', addNewtodo);
router.delete('/:id', deleteTodobyId);
router.put('/:id', editTodobyId);

export default router