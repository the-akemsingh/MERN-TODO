import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../index";
import { Table } from "../db/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

beforeEach(() => {
  vi.resetAllMocks();
});

interface userType {
  name?: string;
  email: string;
  password: string;
}
const mockUserFindOne = (user: userType | null) => {
  vi.spyOn(Table.User, "findOne").mockResolvedValue(user);
};

describe("POST /user/signup", () => {
  it("should signup new user", async () => {
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

describe("POST /user/signin", () => {
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
