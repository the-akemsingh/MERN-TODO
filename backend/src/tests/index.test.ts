import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../index";
import { Table } from "../db/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from "console";
import { response } from "express";

beforeEach(() => {
  vi.resetAllMocks();
});

interface userType {
  id?: string;
  name?: string;
  email: string;
  password: string;
}
const mockUserFindOne = (user: userType | null) => {
  vi.spyOn(Table.User, "findOne").mockResolvedValue(user);
};

describe("POST /user/signup", () => {
  describe("Successful Scenarios", () => {
    it("should signup new user", async () => {
      vi.spyOn(Table.User, "create").mockResolvedValue({
        //@ts-ignore
        name: "TestName",
        email: "testEmailforTesting@gmail.com",
        password: "hashedPassword",
      });
      mockUserFindOne(null);
      const res = await request(app).post("/user/signup").send({
        name: "TestName",
        email: "testEmailforTesting@gmail.com",
        password: "password",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User signed up succesfuly");
      expect(res.body.user).toEqual({
        name: "TestName",
        email: "testEmailforTesting@gmail.com",
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 411 if no inputs or wrong inputs are provided", async () => {
      const res = await request(app).post("/user/signup").send({
        name: 1,
        email: "invalid-email",
        password: "short",
      });
      expect(res.statusCode).toBe(411);
      expect(res.body.message).toBe("One or more input is invalid");
    });
    it("should return 404 if email is already in use", async () => {
      mockUserFindOne({
        email: "testEmailforTesting@gmail.com",
        password: "hashed_password",
      });
      const res = await request(app).post("/user/signup").send({
        name: "TestName",
        email: "existingEmail@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Email is already in use");
    });
  });
});

describe("POST /user/signin", () => {
  describe("Successful Scenarios", () => {
    it("should signin a user", async () => {
      mockUserFindOne({
        email: "testEmailforTesting@gmail.com",
        password: "hashed_password",
      });

      //@ts-ignore
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true);
      //@ts-ignore
      vi.spyOn(jwt, "sign").mockReturnValue("mockToken");

      const res = await request(app).post("/user/signin").send({
        email: "testEmailforTesting@gmail.com",
        password: "password",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User signed in");
      expect(res.body.token).toBe("mockToken");
    });
  });

  describe("Error Handling", () => {
    it("should return 411, if no inputs or wrong inputs are provided", async () => {
      const res = await request(app).post("/user/signin").send({
        email: 1,
        password: "short",
      });
      expect(res.statusCode).toBe(411);
      expect(res.body.message).toBe("One or more input is invalid");
    });

    it("should return 401, if the user with given email don't exist", async () => {
      const res = await request(app).post("/user/signin").send({
        email: "nonexistent@test.com",
        password: "password",
      });
      mockUserFindOne(null);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Email is not registered");
    });

    it("should return 401, if the password for the given email is wrong", async () => {
      mockUserFindOne({
        email: "testEmailforTesting@gmail.com",
        password: "hashed_password",
      });
      //@ts-ignore
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false);
      const res = await request(app).post("/user/signin").send({
        email: "testEmailforTesting@gmail.com",
        password: "wrongpassword",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Incorrect password");
    });

    it("should return 400 if there is an unexpected error", async () => {
      vi.spyOn(Table.User, "findOne").mockRejectedValue(
        new Error("Database error")
      );
      const res = await request(app).post("/user/signin").send({
        email: "testEmailforTesting@gmail.com",
        password: "password",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Error signing in");
    });
  });
});

const mockingMiddleware = () => {
  //mocking the middleware that authenticates user
  //@ts-ignore
  vi.spyOn(jwt, "verify").mockResolvedValue("yes");
  vi.spyOn(jwt, "decode").mockResolvedValue("userEmail");
  vi.spyOn(Table.User, "findOne").mockResolvedValue({
    id: "userID",
    email: "userEmail",
    name: "Test User",
    password: "password",
  });
};

describe("GET /todo/all", () => {
  describe("Successful scenarios", () => {
    it("should return all todos of the user", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "find").mockResolvedValue([
        {
          title: "Test Todo 1",
          description: "Description 1",
          isCompleted: false,
          userId: "userID",
        },
        {
          title: "Test Todo 2",
          description: "Description 2",
          isCompleted: true,
          userId: "userID",
        },
      ]);
      const res = await request(app)
        .get("/todo/all")
        .set("authorisation", "Bearer mockToken");

      expect(res.statusCode).toBe(201);
      expect(res.body.todos).toEqual([
        {
          title: "Test Todo 1",
          description: "Description 1",
          isCompleted: false,
          userId: "userID",
        },
        {
          title: "Test Todo 2",
          description: "Description 2",
          isCompleted: true,
          userId: "userID",
        },
      ]);
    });
  });
  describe("Error Handling", () => {
    it("should return 404, of no todos found ", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "find").mockResolvedValue([]);
      const res = await request(app)
        .get("/todo/all")
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("No todos found");
    });
    it("should return 400 if there is an unexpected error", async () => {
      vi.spyOn(Table.Todo, "find").mockRejectedValue(
        new Error("Database error")
      );
      const res = await request(app)
        .get("/todo/all")
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Error Occured");
    });
  });
});

describe("GET /todo/:id", () => {
  const todoId = "todoId";

  describe("Successful scenarios", () => {
    it("should return todo of given id", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockResolvedValue({
        title: "title",
        description: "description",
        isCompleted: false,
        userId: "userID",
      });
      const res = await request(app)
        .get(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(201);
      expect(res.body.todo).toEqual({
        title: "title",
        description: "description",
        isCompleted: false,
        userId: "userID",
      });
    });
  });
  
  describe("Error Handling", () => {

    it("should return 404 when todo is not found", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockResolvedValue(null);
      const res = await request(app)
        .get(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Todo not found");
    });

    it("should return 400 if there is an unexpected error", async () => {
      vi.spyOn(Table.Todo, "findById").mockRejectedValue(
        new Error("Database error")
      );
      const res = await request(app)
        .get(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Error Occured");
    });
  });
});

describe("POST /todo/add", () => {
  describe("Successful scenarios", () => {
    it("should add a new todo", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "create").mockResolvedValue({
        //@ts-ignore
        title: "title",
        description: "description",
        isCompleted: false,
        userId: "userID",
      });
      const res = await request(app)
        .post("/todo/add")
        .set("authorisation", "Bearer mockToken")
        .send({
          title: "todoTitle",
          description: "todoDescription",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Todo created successfuly");
    });
  });
  describe("Error Handling", () => {
    it("should return 411 when invalid input is given", async () => {
      mockingMiddleware();
      const res = await request(app)
        .post("/todo/add")
        .set("authorisation", "Bearer mockToken")
        .send({
          title: "",
          description: 0,
        });
      expect(res.statusCode).toBe(411);
      expect(res.body.message).toBe("One or more input is invalid");
    });
    it("should return 400 if there is an unexpected error", async () => {
      vi.spyOn(Table.Todo, "create").mockRejectedValue(
        new Error("Database error")
      );
      const res = await request(app)
        .get("/todo/all")
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Error Occured");
    });
  });
});

describe("DELETE /todo/:id", () => {
  const todoId = "todoId";
  describe("Successful scenarios", () => {
    it("should delete todo by its id", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockResolvedValue({
        //@ts-ignore
        // id:todoId,
        title: "title",
        description: "description",
        isCompleted: false,
        userId: "userID",
      });
      vi.spyOn(Table.Todo, "findOneAndDelete").mockResolvedValue(null);
      const res = await request(app)
        .delete(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Todo Deleted Succesfully");
    });
  });
  describe("Error Handling", () => {
    it("should return 404 when todo not found", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockResolvedValue(null);
      const res = await request(app)
        .delete(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Todo does not exist");
    });

    it("should return 400 if there is an unexpected error", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockRejectedValue(
        new Error("Database error")
      );
      const res = await request(app)
        .delete(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken");
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Error Occured");
    });
  });
});

describe("PUT /todo/:id", () => {
  const todoId = "todoId";
  describe("Successful scenarios", () => {
    it("should update todo", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockResolvedValue({
        //@ts-ignore
        // id:todoId,
        title: "title",
        description: "description",
        isCompleted: false,
        userId: "userID",
        save: vi.fn().mockResolvedValue(true),
      });
      const res = await request(app)
        .put(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken")
        .send({
          title: "title",
          description: "description",
          isCompleted: false,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Todo Updated");
      expect(res.body.Todo).toEqual({
        title: "title",
        description: "description",
        isCompleted: false,
      });
    });
  });
  describe("Error Handling", () => {
    it("should return 411 when for invalid input", async () => {
      mockingMiddleware();
      const res = await request(app)
        .put(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken")
        .send({
          title: 4,
          isCompleted: false,
        });
      expect(res.statusCode).toBe(411);
      expect(res.body.message).toBe("One or more input is invalid");
    });

    it("should return 404 when todo doesn't exists", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockResolvedValue(null);
      const res = await request(app)
        .put(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken")
        .send({
          title: "title",
          isCompleted: false,
        });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Todo does not exist");
    });

    it("should return 400 if there is an unexpected error", async () => {
      mockingMiddleware();
      vi.spyOn(Table.Todo, "findById").mockRejectedValue(
        new Error("Database error")
      );
      const res = await request(app)
        .put(`/todo/${todoId}`)
        .set("authorisation", "Bearer mockToken")
        .send({
          title: "title",
          description: "description",
          isCompleted: false,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Error Occured");
    });
  });
});
