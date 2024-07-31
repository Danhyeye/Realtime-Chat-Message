import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./User";

export interface IChat extends Document {
  _id: Types.ObjectId;
  photo: string;
  chatName: string;
  isGroup: boolean;
  users: (Types.ObjectId | IUser)[];
  latestMessage: Types.ObjectId;
  groupAdmin: Types.ObjectId;
}

const chatSchema: Schema<IChat> = new Schema(
  {
    photo: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/9790/9790561.png",
    },
    chatName: {
      type: String,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
