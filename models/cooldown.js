import { Schema, model } from "mongoose";

const cooldownSchema = new Schema({
  userId: Number,
  chatId: Number,
  until: Number,
});

const Cooldown = model("Cooldown", cooldownSchema);

export default Cooldown;
