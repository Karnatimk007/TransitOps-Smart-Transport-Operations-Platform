import jwt from "jsonwebtoken";

export function VerifyToken(req, res, next) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const jwtSecret = process.env.JWT_SECRET?.trim();

        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: "JWT secret is not configured.",
            });
        }

        const decoded = jwt.verify(token, jwtSecret);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
}