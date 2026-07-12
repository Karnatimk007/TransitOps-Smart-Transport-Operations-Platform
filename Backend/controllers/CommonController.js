import bcrypt from "bcryptjs";
import { connection } from "../Config/db.js";
import jwt from "jsonwebtoken";
async function resolveRoleId(roleId, roleName) {
	if (roleId) {
		return roleId;
	}
	const effectiveRoleName = roleName || "Driver";
	const [roles] = await connection.execute(
		"SELECT id FROM roles WHERE role_name = ? LIMIT 1",
		[effectiveRoleName]
	);
	if (!roles.length) {
		const [insertResult] = await connection.execute(
			"INSERT INTO roles (role_name, description) VALUES (?, ?)",
			[
				effectiveRoleName,
				effectiveRoleName === "Driver"
					? "Default driver role"
					: "Auto-created role",
			]
		);
		return insertResult.insertId;
	}
	return roles[0].id;
}
export async function registerUser(req, res) {
	try {
		const {
			full_name,
			email,
			password,
			phone = null,
			profile_image = null,
			role_id = null,
			role_name = null,
		} = req.body;

		if (!connection) {
			return res.status(500).json({
				message: "Database connection is not ready.",
			});
		}

		if (!full_name || !email || !password) {
			return res.status(400).json({
				message: "full_name, email, and password are required.",
			});
		}

		const normalizedEmail = email.trim().toLowerCase();
		const [existingUsers] = await connection.execute(
			"SELECT id FROM users WHERE email = ? LIMIT 1",
			[normalizedEmail]
		);

		if (existingUsers.length) {
			return res.status(409).json({
				message: "A user with this email already exists.",
			});
		}
		const resolvedRoleId = await resolveRoleId(role_id, role_name);
		if (!resolvedRoleId) {
			return res.status(404).json({
				message: "Role not found.",
			});
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const [result] = await connection.execute(
			`INSERT INTO users (role_id, full_name, email, password_hash, phone, profile_image)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[
				resolvedRoleId,
				full_name.trim(),
				normalizedEmail,
				passwordHash,
				phone,
				profile_image,
			]
		);

		return res.status(201).json({
			message: "User registered successfully.",
			user: {
				id: result.insertId,
				full_name: full_name.trim(),
				email: normalizedEmail,
				phone,
				profile_image,
				role_id: resolvedRoleId,
			},
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({
			message: "Failed to register user.",
		});
	}
}
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        let normalizedEmail = email.trim().toLowerCase();
        let [users] = await connection.execute(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [normalizedEmail]
        );
        if (!users.length) {
            return res.status(404).json({ message: "User not found." });
        }
        let user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }
		const jwtSecret = process.env.JWT_SECRET?.trim();
		if (!jwtSecret) {
			return res.status(500).json({
				message: "JWT secret is not configured.",
			});
		}

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role_id },
			jwtSecret,
			{ expiresIn: "1d" }
		);
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
        return res.status(200).json({ message: "Login successful.", user, token });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Failed to login user." });
    }
}