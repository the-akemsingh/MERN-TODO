import { z } from "zod";

export const newTodoSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const editTodoSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
});


export const userSignUpSchema=z.object({
    name:z.string(),
    email:z.string().email(),
    password:z.string().min(8).max(16),
})

export const userSignInSchema=z.object({
    email:z.string().email(),
    password:z.string().min(8).max(16),
})