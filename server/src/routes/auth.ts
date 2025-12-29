import { Router, Request, Response } from "express";
import { authService } from "../services";
import { logger } from "../config/logger";

const router = Router();

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  name?: string;
}

interface UpdateProfileRequest {
  userId: string;
  name?: string;
  currency?: "USD" | "INR";
}

router.post(
  "/login",
  async (req: Request<object, object, LoginRequest>, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    try {
      const user = await authService.login(username, password);
      res.json(user);
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ error: "Invalid username or password" });
      } else {
        logger.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.post(
  "/register",
  async (req: Request<object, object, RegisterRequest>, res: Response) => {
    const { username, password, name } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    try {
      const user = await authService.register(username, password, name);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.message === "USERNAME_TOO_SHORT") {
        res.status(400).json({ error: "Username must be at least 3 characters" });
      } else if (error.message === "PASSWORD_TOO_SHORT") {
        res.status(400).json({ error: "Password must be at least 4 characters" });
      } else if (error.message === "USERNAME_EXISTS") {
        res.status(400).json({ error: "Username already exists" });
      } else {
        logger.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.put(
  "/profile",
  async (req: Request<object, object, UpdateProfileRequest>, res: Response) => {
    const { userId, name, currency } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    try {
      const user = await authService.updateProfile(userId, { name, currency });
      res.json(user);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
      } else {
        logger.error("Profile update error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

export default router;
