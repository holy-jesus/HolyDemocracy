import { Schema, model, ObjectId } from "mongoose";

const voterSchema = new Schema({
  votingId: ObjectId,
  userId: Number,
  username: String,
});

const Voter = model("Voter", voterSchema);

export default Voter;
