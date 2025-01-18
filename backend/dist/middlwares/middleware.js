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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schema_1 = require("../db/schema");
const JWT_SECRET = process.env.JWT_SECRET;
const isAuthorized = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("authorisation")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).send({ message: "Not Authorised" });
            return;
        }
        const isTokesValid = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!isTokesValid) {
            res.status(401).send({ message: "Not Authorised" });
            return;
        }
        const userEmail = jsonwebtoken_1.default.decode(token);
        const user = yield schema_1.User.findOne({
            email: userEmail,
        });
        req.user = { userEmail: user.email, userName: user.name, userId: user.id };
        next();
    }
    catch (e) {
        res.status(400).send({ message: "Error Occured" });
    }
});
exports.default = isAuthorized;
