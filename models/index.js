import Chat from "./chat.js";
import Voting from "./voting.js";
import Block from "./block.js";
import { connect } from "mongoose";

await connect(process.env.MONGODB_URL);

export { Chat, Voting, Block };
