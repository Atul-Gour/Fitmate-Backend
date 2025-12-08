import mongoose, { Schema } from "mongoose";

mongoose.set("strictQuery", true);
mongoose.Schema.Types.String.cast(false);

const MatchDataSchema = new mongoose.Schema(
  {
    matchName: {
      type: String,
    },
    sportsType: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    playersRequired: {
      type: Number,
      required: true,
      min: 1
    },
    matchType: {
      type: String,
      enum: ["Friendly", "Tournament", "Practice"],
      default: "friendly",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [
      {
        playerId:{
          type: Schema.Types.ObjectId,
          ref: "UserData",
        }
      },
    ],
    address: {
      fullAddress: {
        type: String,
      },
      groundName: { type: String },
      area: { type: String },
      city: { type: String },
      state: { type: String },
      coordinates: {
        lat: { type: Number },
        lon: { type: Number },
        mapLink: { type: String },
      },
    },
    notes: { type: String },
    img: String,
  },
  { timestamps: true }
);

export const MatchData = mongoose.model("MatchData", MatchDataSchema);
