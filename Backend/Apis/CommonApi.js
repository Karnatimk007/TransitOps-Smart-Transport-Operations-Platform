import express from "express";
import { registerUser,loginUser } from "../Controllers/CommonController.js";
import { VerifyToken } from "../Middlewares/VerifyToken.js";
const commonApi = express.Router();
commonApi.get("/profile", VerifyToken, (req, res) => {
    res.json({
        message: "Protected Route",
        user: req.user
    });
});
commonApi.post("/register", registerUser);
commonApi.post("/login", loginUser);

export default commonApi;
