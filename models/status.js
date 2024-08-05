import { Schema, model } from "mongoose";

const statusSchema = new Schema({
  _id: Number,
  chatId: Number,
  key: String,
});

const Status = model("Status", statusSchema);

export default Status;
