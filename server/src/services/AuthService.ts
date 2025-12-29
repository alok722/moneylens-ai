import bcrypt from "bcrypt";
import { User } from "../models";
import { logger } from "../config/logger";

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  currency: string;
}

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string): Promise<AuthUser> {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    logger.info(`User logged in: ${username}`);

    return {
      id: user._id.toString(),
      username: user.username,
      name: user.name || username,
      currency: user.currency || "INR",
    };
  }

  /**
   * Register a new user
   */
  async register(
    username: string,
    password: string,
    name?: string
  ): Promise<AuthUser> {
    // Validate username length
    if (username.length < 3) {
      throw new Error("USERNAME_TOO_SHORT");
    }

    // Validate password length
    if (password.length < 4) {
      throw new Error("PASSWORD_TOO_SHORT");
    }

    // Check if username already exists
    const existingUser = await User.countDocuments({ username });
    if (existingUser > 0) {
      throw new Error("USERNAME_EXISTS");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name: name || username,
      currency: "INR",
    });

    logger.info(`New user registered: ${username}`);

    return {
      id: newUser._id.toString(),
      username: newUser.username,
      name: newUser.name || username,
      currency: newUser.currency,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; currency?: "USD" | "INR" }
  ): Promise<AuthUser> {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("USER_NOT_FOUND");
    }

    logger.info(`Profile updated for user: ${updatedUser.username}`);

    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      name: updatedUser.name || updatedUser.username,
      currency: updatedUser.currency || "INR",
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
