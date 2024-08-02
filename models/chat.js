import { Schema, model } from "mongoose";

const chatSchema = new Schema({
  _id: Number,
  creator: Number,
  admins: [Number],
  settings: {
    onlyCreatorCanAccessSettings: { type: Boolean, default: true },
    mentionOnlyCreator: { type: Boolean, default: true },
    votesForKick: { type: Number, default: 10 },
    votesForMute: { type: Number, default: 10 },
    votesAgainst: { type: Number, default: 4 },
    timeForVoting: { type: Number, default: 600 },
    muteTime: { type: Number, default: 3600 },
    cooldown: { type: Number, default: 600}
  },
});

const Chat = model("Chat", chatSchema);

export default Chat;
