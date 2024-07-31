import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface AuthRequest extends Request {
  token?: string;
  rootUser?: any;
  rootUserId?: string;
  rootUserEmail?: string;
}

export const Auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[0];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    if (token.length < 500) {
      const verifiedUser = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      const rootUser = await User.findById(verifiedUser.id).select(
        "id email name bio profilePic"
      );
      if (!rootUser) {
        return res.status(404).json({ error: "User not found" });
      }
      req.token = token;
      req.rootUser = rootUser;
      req.rootUserId = rootUser.id;
    } else {
      const data = jwt.decode(token) as { email: string };
      req.rootUserEmail = data.email;
      const googleUser = await User.findOne({
        email: req.rootUserEmail,
      }).select("id email name bio profilePic");
      if (!googleUser) {
        return res.status(404).json({ error: "User not found" });
      }
      req.rootUser = googleUser;
      req.token = token;
      req.rootUserId = googleUser.id;
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token" });
  }
};
