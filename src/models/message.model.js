import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const messageModel = model("messages", messageSchema);

export { messageModel };