import { Schema, model } from "mongoose";

const cooldownSchema = new Schema({
  chatId: Number,
  userId: Number,
  command: String,
  until: Number,
});

const Cooldown = model("Cooldown", cooldownSchema);

export default Cooldown;
