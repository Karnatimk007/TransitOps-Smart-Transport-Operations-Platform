import express from "express";
import { registerUser,loginUser } from "../Controllers/CommonController.js";

const commonApi = express.Router();

commonApi.post("/register", registerUser);
commonApi.post("/login", loginUser);

export default commonApi;