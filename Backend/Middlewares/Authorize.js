export function Authorize(...allowedRoles) {
    return (req, res, next) => {
        try {
            // Check if VerifyToken middleware has attached the user
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. Please login first."
                });
            }

            // Check if user's role is allowed
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You do not have permission."
                });
            }

            next();

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Authorization failed."
            });
        }
    };
}