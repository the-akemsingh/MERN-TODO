import express from 'express'
import { addNewUser, signInUser } from '../controllers/userController';

const router = express.Router();

router.post('/signup', addNewUser);
router.post('/signin', signInUser);

export default router