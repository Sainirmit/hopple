import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a user
 * @param id User ID to encode in the token
 * @returns JWT token
 */
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
