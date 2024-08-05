import Block from "./block.js";
import Chat from "./chat.js";
import Cooldown from "./cooldown.js";
import Status from "./status.js";
import Voting from "./voting.js";
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URL);

export { Block, Chat, Cooldown, Status, Voting };
