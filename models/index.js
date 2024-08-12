import mongoose from "mongoose";
import Block from "./block.js";
import Chat from "./chat.js";
import Cooldown from "./cooldown.js";
import Status from "./status.js";
import Voter from "./voter.js";
import Voting from "./voting.js";

await mongoose.connect(process.env.MONGODB_URL);

export { Block, Chat, Cooldown, Status, Voter, Voting };
