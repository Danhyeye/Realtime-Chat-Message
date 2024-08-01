import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const Auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const verifiedUser = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };
    const rootUser = await User.findById(verifiedUser.userId).select(
      "id email name bio profilePic"
    );

    if (!rootUser) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = { userId: rootUser.id };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token" });
  }
};
