import { Schema, model } from "mongoose";

const votingSchema = new Schema({
  chatId: Number,
  starterId: Number,
  messageId: Number,
  startedMessageId: Number,
  candidateId: Number,
  timeoutId: Number,
  action: String,
  started: Date,
  until: Date,
  done: { type: String, value: null },
  neededNo: Number,
  no: [Number],
  neededYes: Number,
  yes: [Number],
});

const Voting = model("Voting", votingSchema);

export default Voting;
