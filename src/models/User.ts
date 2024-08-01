import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  profilePic: string;
  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  generateAuthToken: () => Promise<string>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "Available",
    },
    profilePic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { id: this._id, email: this.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "24h",
      }
    );
    return token;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
