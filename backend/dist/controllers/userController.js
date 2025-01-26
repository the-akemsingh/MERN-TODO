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
exports.signInUser = exports.addNewUser = void 0;
const schema_1 = require("../db/schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const schema_2 = require("../schema/schema");
dotenv_1.default.config();
const addNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isValidInputs = schema_2.userSignUpSchema.safeParse(req.body);
        if (!isValidInputs.success) {
            res.status(411).send({ message: "One or more input is invalid" });
            return;
        }
        const { name, email, password } = yield req.body;
        const isEmailExist = yield schema_1.User.findOne({
            email,
        });
        if (isEmailExist) {
            res.status(404).send({ message: "Email is already in use" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield schema_1.User.create({
            name,
            email,
            password: hashedPassword,
        });
        res.status(201).send({ message: "User signed up succesfuly", user: { email, name } });
    }
    catch (e) {
        res.status(400).send({ message: "Error signing up", e });
    }
});
exports.addNewUser = addNewUser;
const signInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isValidInputs = schema_2.userSignInSchema.safeParse(req.body);
        if (!isValidInputs.success) {
            res.status(411).send({ message: "One or more input is invalid" });
            return;
        }
        const { email, password } = yield req.body;
        const isUserExist = yield schema_1.User.findOne({
            email,
        });
        if (!isUserExist) {
            res.status(401).send({ message: "Email is not registered" });
            return;
        }
        const user = yield schema_1.User.findOne({
            email,
        });
        const isPasswordValid = bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).send({ message: "Incorrect password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign(email, process.env.JWT_SECRET);
        res.status(201).send({
            message: "User signed in",
            token,
        });
    }
    catch (e) {
        res.status(400).send({ message: "Error signing in", e });
    }
});
exports.signInUser = signInUser;
