import Block from "./block.js";
import Chat from "./chat.js";
import Cooldown from "./cooldown.js";
import Voting from "./voting.js";
import { connect } from "mongoose";

await connect(process.env.MONGODB_URL);

export { Block, Chat, Cooldown, Voting };
