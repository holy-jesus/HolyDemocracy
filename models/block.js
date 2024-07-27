import { Schema, model } from "mongoose";

const blockSchema = new Schema({
  userId: Number,
  chatId: Number,
});

const Block = model("Block", blockSchema);

export default Block;
