import jwt from "jsonwebtoken";

export function VerifyToken(req, res, next) {
    try {
        const token =
            req.cookies.token;
        console.log("Token from cookies:", token);
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const jwtSecret = process.env.JWT_SECRET?.trim();

        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        const decoded = jwt.verify(
            token,
            jwtSecret
        );

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid Token"
        });
    }
}